import { parseShiftLocally, parseShiftFromNaturalLanguage, resolveRelativeDate, normalizeTime, calculateDuration, getKolkataDate, formatYMD } from "../server/services/aiShiftParser.js";

async function runTests() {
  console.log("=== RUNNING SHIFT PARSER TESTS ===");
  const today = formatYMD(getKolkataDate());
  console.log("Reference Date (Asia/Kolkata):", today);

  // TEST 1
  console.log("\n--- TEST 1: 'I need a waiter tomorrow from 6 PM to 11 PM. Pay ₹1000 for the shift.' ---");
  const t1 = await parseShiftFromNaturalLanguage("I need a waiter tomorrow from 6 PM to 11 PM. Pay ₹1000 for the shift.");
  console.log("Result:", JSON.stringify(t1, null, 2));
  console.assert(t1.parsedShift.title === "Waiter", "T1 Title failed");
  console.assert(t1.parsedShift.startTime === "18:00", "T1 StartTime failed");
  console.assert(t1.parsedShift.endTime === "23:00", "T1 EndTime failed");
  console.assert(t1.parsedShift.paymentAmount === 1000, "T1 Pay failed");
  console.assert(t1.parsedShift.paymentType === "fixed", "T1 PayType failed");
  console.assert(t1.parsedShift.duration === "5h", "T1 Duration failed");
  console.assert(!t1.needsClarification.includes("pay"), "T1 Pay should not need clarification");
  console.assert(!t1.needsClarification.includes("startTime"), "T1 StartTime should not need clarification");

  // TEST 2
  console.log("\n--- TEST 2: 'I need a security guard tomorrow.' ---");
  const t2 = await parseShiftFromNaturalLanguage("I need a security guard tomorrow.");
  console.log("Result:", JSON.stringify(t2, null, 2));
  console.assert(t2.parsedShift.title === "Security Guard", "T2 Title failed");
  console.assert(t2.parsedShift.startTime === null, "T2 StartTime should be null");
  console.assert(t2.parsedShift.endTime === null, "T2 EndTime should be null");
  console.assert(t2.parsedShift.paymentAmount === null, "T2 Pay should be null");
  console.assert(t2.needsClarification.includes("startTime"), "T2 should need startTime clarification");
  console.assert(t2.needsClarification.includes("endTime"), "T2 should need endTime clarification");
  console.assert(t2.needsClarification.includes("pay"), "T2 should need pay clarification");

  // TEST 3
  console.log("\n--- TEST 3: 'I need a cashier this Saturday from 9 AM to 3 PM. ₹150 per hour. Must know Excel.' ---");
  const t3 = await parseShiftFromNaturalLanguage("I need a cashier this Saturday from 9 AM to 3 PM. ₹150 per hour. Must know Excel.");
  console.log("Result:", JSON.stringify(t3, null, 2));
  console.assert(t3.parsedShift.title === "Cashier", "T3 Title failed");
  console.assert(t3.parsedShift.startTime === "09:00", "T3 StartTime failed");
  console.assert(t3.parsedShift.endTime === "15:00", "T3 EndTime failed");
  console.assert(t3.parsedShift.paymentAmount === 150, "T3 Pay failed");
  console.assert(t3.parsedShift.paymentType === "hourly", "T3 PayType failed");
  console.assert(t3.parsedShift.requiredSkills.includes("Excel"), "T3 Excel skill failed");
  console.assert(t3.parsedShift.duration === "6h", "T3 Duration failed");

  // TEST 4
  console.log("\n--- TEST 4: 'Need someone in the evening tomorrow.' ---");
  const t4 = await parseShiftFromNaturalLanguage("Need someone in the evening tomorrow.");
  console.log("Result:", JSON.stringify(t4, null, 2));
  console.assert(t4.parsedShift.startTime === null, "T4 StartTime should be null (not guessed)");
  console.assert(t4.parsedShift.endTime === null, "T4 EndTime should be null (not guessed)");
  console.assert(t4.needsClarification.includes("startTime"), "T4 should need startTime clarification");

  // TEST 5
  console.log("\n--- TEST 5: 'Need a worker tomorrow for 8 hours, pay to be discussed.' ---");
  const t5 = await parseShiftFromNaturalLanguage("Need a worker tomorrow for 8 hours, pay to be discussed.");
  console.log("Result:", JSON.stringify(t5, null, 2));
  console.assert(t5.parsedShift.duration === "8h", "T5 Duration failed");
  console.assert(t5.parsedShift.paymentAmount === null, "T5 Pay should be null");
  console.assert(t5.needsClarification.includes("pay"), "T5 should need pay clarification");

  // TEST 6: Hinglish input
  console.log("\n--- TEST 6 (Hinglish): 'Kal subah 9 baje se dopahar 2 baje tak cafe helper chahiye 800 rupaye dunga' ---");
  const t6 = await parseShiftFromNaturalLanguage("Kal subah 9 baje se dopahar 2 baje tak cafe helper chahiye 800 rupaye dunga");
  console.log("Result:", JSON.stringify(t6, null, 2));
  console.assert(t6.parsedShift.title === "Waiter", "T6 Title failed");
  console.assert(t6.parsedShift.startTime === "09:00", "T6 StartTime failed");
  console.assert(t6.parsedShift.endTime === "14:00", "T6 EndTime failed");
  console.assert(t6.parsedShift.paymentAmount === 800, "T6 Pay failed");
  console.assert(t6.parsedShift.paymentType === "fixed", "T6 PayType failed");
  console.assert(t6.parsedShift.duration === "5h", "T6 Duration failed");

  // Midnight crossing duration test
  console.log("\n--- MIDNIGHT CROSSING DURATION TEST: 22:00 to 02:00 ---");
  const dur = calculateDuration("22:00", "02:00");
  console.log("Duration:", dur);
  console.assert(dur === "4h", "Midnight duration failed");

  console.log("\n✅ ALL BACKEND SHIFT PARSER & HINGLISH TESTS PASSED SUCCESSFULLY!");
}

runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
