#!/usr/bin/env node
/**
 * End-to-end verification: worker OTP check-in -> employer Razorpay order creation
 */
import dotenv from 'dotenv';
import { connectDb } from '../server/config/db.js';
import { Application } from '../server/models/Application.js';
import { Shift } from '../server/models/Shift.js';
import { User } from '../server/models/User.js';

dotenv.config();

const API = 'http://127.0.0.1:4000';

async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed for ${email}: ${data.message}`);
  const cookie = res.headers.get('set-cookie');
  return { user: data.user, cookie };
}

async function api(session, path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (session.cookie) headers.Cookie = session.cookie.split(';')[0];

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const results = [];
  const pass = (msg) => results.push({ ok: true, msg });
  const fail = (msg) => results.push({ ok: false, msg });

  try {
    // 1. Razorpay config
    const configRes = await fetch(`${API}/api/payments/config`);
    const config = await configRes.json();
    if (config.configured && config.keyId) {
      pass(`Razorpay configured (${config.keyId.slice(0, 12)}...)`);
    } else {
      fail('Razorpay NOT configured on server');
    }

    // 2. Login users
    const employerSession = await login('employer@flexywork.local', 'password123');
    const workerSession = await login('worker@flexywork.local', 'password123');
    pass('Employer and worker login OK');

    // 3. Find employer shift with assigned worker or create flow
    const mine = await api(employerSession, '/api/shifts/mine');
    if (!mine.ok) throw new Error('Failed to fetch employer shifts');

    const workerMine = await api(workerSession, '/api/shifts/mine');
    const workerId = workerSession.user.id;

    let shift = mine.data.shifts?.find(
      (s) => s.assignedWorkerIds?.includes(workerId) && !s.checkInTime
    );

    if (!shift) {
      // Create a fresh shift for testing
      const created = await api(employerSession, '/api/shifts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Razorpay E2E Test Shift',
          description: 'Automated test shift for OTP payment flow verification',
          category: 'Cleaning',
          date: '2026-08-30',
          startTime: '10:00',
          endTime: '14:00',
          duration: '4 hours',
          paymentAmount: 500,
          location: 'Test Location, Vijayawada'
        })
      });
      if (!created.ok) throw new Error(`Create shift failed: ${created.data.message}`);
      shift = created.data.shift;
      pass(`Created test shift ${shift.id}`);

      await connectDb();
      const workerUser = await User.findOne({ email: 'worker@flexywork.local' });
      await Shift.findByIdAndUpdate(shift.id, {
        $addToSet: { assignedWorkerIds: workerUser._id },
        status: 'filled'
      });
      await Application.findOneAndUpdate(
        { shiftId: shift.id, workerId: workerUser._id },
        { status: 'accepted', acceptedAt: new Date() },
        { upsert: true }
      );
      pass('Worker assigned to shift (direct DB assign for test)');
    } else {
      pass(`Using existing shift ${shift.id}`);
    }

    // 4. Employer gets OTP
    const employerView = await api(employerSession, `/api/shifts/${shift.id}`);
    if (!employerView.ok) throw new Error(`Employer shift fetch failed: ${employerView.data.message}`);
    const otp = employerView.data.shift.checkInOtp;
    if (!otp) fail('Employer cannot see checkInOtp');
    else pass(`Employer sees OTP: ${otp}`);

    if (employerView.data.shift.checkInTime) {
      pass(`Shift already checked in at ${employerView.data.shift.checkInTime}`);
    } else {
      // 5. Worker checks in with OTP
      const checkIn = await api(workerSession, `/api/attendance/${shift.id}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ otp })
      });
      if (!checkIn.ok) throw new Error(`Check-in failed: ${checkIn.data.message}`);
      if (checkIn.data.paymentRequired) pass('Check-in returned paymentRequired=true');
      else fail('Check-in did not return paymentRequired flag');
    }

    // 6. Employer sees checkInTime after check-in
    const afterCheckIn = await api(employerSession, `/api/shifts/${shift.id}`);
    const checkInTime = afterCheckIn.data.shift?.checkInTime;
    const shiftStatus = afterCheckIn.data.shift?.status;
    if (checkInTime) pass(`Employer sees checkInTime: ${checkInTime} (status: ${shiftStatus})`);
    else fail('CRITICAL: Employer does NOT see checkInTime after worker OTP check-in');

    // 7. Employer can create Razorpay order
    const order = await api(employerSession, `/api/payments/${shift.id}/create-order`, { method: 'POST' });
    if (order.ok && order.data.orderId && order.data.keyId) {
      pass(`Razorpay order created: ${order.data.orderId} for ₹${order.data.totalAmount}`);
    } else {
      fail(`CRITICAL: create-order failed (${order.status}): ${order.data.message || JSON.stringify(order.data)}`);
    }

    // 8. Payment status for shift
    const payments = await api(employerSession, `/api/payments/by-shift/${shift.id}`);
    if (payments.ok) {
      const pending = payments.data.payments?.filter((p) => p.status === 'pending');
      pass(`Payment records exist: ${payments.data.payments?.length || 0} total, ${pending?.length || 0} pending`);
    } else {
      fail(`Payment lookup failed: ${payments.data.message}`);
    }

  } catch (error) {
    fail(`Exception: ${error.message}`);
  }

  console.log('\n=== RAZORPAY OTP PAYMENT FLOW VERIFICATION ===\n');
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'} ${r.msg}`);
  }
  const allPass = results.every((r) => r.ok);
  console.log(`\n${allPass ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}\n`);
  process.exit(allPass ? 0 : 1);
}

main();
