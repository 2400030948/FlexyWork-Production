import Razorpay from "razorpay";
import crypto from "node:crypto";

/**
 * Razorpay service wrapper.
 *
 * Security notes:
 *  - RAZORPAY_KEY_SECRET is read exclusively from the environment and is
 *    NEVER exposed to the frontend, NEVER logged, and NEVER sent in any
 *    API response body.
 *  - RAZORPAY_KEY_ID is public-safe; it can be sent to the frontend so
 *    that the Razorpay Checkout widget can be initialised in the browser.
 *  - Signature verification always uses HMAC SHA-256 with the secret on
 *    the backend to confirm a payment actually originated from Razorpay.
 */

let cachedClient = null;

function readCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the server environment."
    );
  }
  return { keyId, keySecret };
}

export function getRazorpayKeyId() {
  // Public key is safe to return to the frontend for Checkout configuration.
  return process.env.RAZORPAY_KEY_ID || null;
}

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function getClient() {
  if (cachedClient) return cachedClient;
  const { keyId, keySecret } = readCredentials();
  cachedClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return cachedClient;
}

/**
 * Create a Razorpay order for the given amount (in INR rupees).
 * Razorpay expects the amount in the smallest currency subunit (paise),
 * so we multiply by 100 and round to an integer.
 *
 * @param {Object} params
 * @param {number} params.amount        Amount in INR (>= 1)
 * @param {string} params.receipt       Short receipt / reference id
 * @param {Object} [params.notes]       Optional metadata stored on the order
 * @returns {Promise<{id:string, amount:number, currency:string, receipt:string, status:string}>}
 */
export async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  if (!Number.isFinite(amount) || amount < 1) {
    throw new Error("Invalid payment amount");
  }
  if (!receipt || typeof receipt !== "string") {
    throw new Error("A receipt id is required to create a Razorpay order");
  }

  const client = getClient();
  const amountInPaise = Math.round(amount * 100);

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: receipt.slice(0, 40),
    notes
  });

  return {
    id: order.id,
    amount: order.amount, // paise
    currency: order.currency,
    receipt: order.receipt,
    status: order.status
  };
}

/**
 * Verify the Razorpay checkout signature using HMAC SHA-256.
 * The signature is computed as:
 *   expected = HMAC_SHA256( key_secret, order_id + "|" + payment_id )
 * and compared (in constant time) with the signature returned by the
 * Razorpay Checkout widget on the client.
 *
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 * @returns {boolean}
 */
export function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature) return false;
  const { keySecret } = readCredentials();
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const signatureBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

/**
 * Fetch full payment details from Razorpay. Useful for additional
 * verification / auditing on the backend.
 */
export async function fetchRazorpayPayment(paymentId) {
  const client = getClient();
  return client.payments.fetch(paymentId);
}
