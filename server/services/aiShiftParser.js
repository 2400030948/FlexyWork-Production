import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const VALID_CATEGORIES = [
  "Cafe",
  "Cleaning",
  "Repairs",
  "Gardening",
  "Retail",
  "Logistics",
  "Events",
  "General"
];

// Calculate date and time in Asia/Kolkata timezone
export function getKolkataDate() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value || "2026";
  const month = parts.find((p) => p.type === "month")?.value || "08";
  const day = parts.find((p) => p.type === "day")?.value || "29";
  return new Date(`${year}-${month}-${day}T00:00:00+05:30`);
}

export function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Resolve relative date strings (today, tomorrow, this Saturday, next Monday, etc.)
export function resolveRelativeDate(dateStr, baseDate = getKolkataDate()) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const lower = dateStr.trim().toLowerCase();

  // Already standard format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) {
    return lower;
  }

  const current = new Date(baseDate.getTime());
  const currentDayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  if (lower === "today") {
    return formatYMD(current);
  }

  if (lower === "tomorrow") {
    current.setDate(current.getDate() + 1);
    return formatYMD(current);
  }

  if (lower === "yesterday") {
    current.setDate(current.getDate() - 1);
    return formatYMD(current);
  }

  if (lower === "this weekend" || lower === "weekend") {
    // Upcoming Saturday of current week
    const daysUntilSat = (6 - currentDayOfWeek + 7) % 7;
    current.setDate(current.getDate() + (daysUntilSat === 0 ? 0 : daysUntilSat));
    return formatYMD(current);
  }

  const daysMap = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6
  };

  for (const [dayName, targetDay] of Object.entries(daysMap)) {
    if (lower === dayName || lower === `this ${dayName}`) {
      const diff = (targetDay - currentDayOfWeek + 7) % 7;
      current.setDate(current.getDate() + (diff === 0 ? 0 : diff));
      return formatYMD(current);
    }
    if (lower === `next ${dayName}`) {
      const diff = (targetDay - currentDayOfWeek + 7) % 7;
      const daysToAdd = diff === 0 ? 7 : diff + 7;
      current.setDate(current.getDate() + daysToAdd);
      return formatYMD(current);
    }
  }

  if (lower === "next week") {
    // Next Monday
    const diff = (1 - currentDayOfWeek + 7) % 7;
    current.setDate(current.getDate() + (diff === 0 ? 7 : diff));
    return formatYMD(current);
  }

  // Attempt standard date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return formatYMD(parsed);
  }

  return null;
}

// Convert 12h/24h time to standard "HH:mm"
export function normalizeTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim().toLowerCase();

  // Handle formats like "18:00", "09:30"
  const match24 = clean.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const h = String(match24[1]).padStart(2, "0");
    const m = match24[2];
    return `${h}:${m}`;
  }

  // Handle formats like "6 pm", "6:30 pm", "9am", "6 in the evening"
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|in the morning|in the evening|in the afternoon|at night)?$/i);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const minute = match12[2] ? match12[2] : "00";
    const meridiem = (match12[3] || "").toLowerCase();

    if (hour > 23) return null;

    if (meridiem === "pm" || meridiem === "in the evening" || meridiem === "in the afternoon" || meridiem === "at night") {
      if (hour < 12) hour += 12;
    } else if (meridiem === "am" || meridiem === "in the morning") {
      if (hour === 12) hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  return null;
}

// Calculate duration string handling midnight crossings
export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null;

  let sTotal = sh * 60 + sm;
  let eTotal = eh * 60 + em;

  if (eTotal <= sTotal) {
    eTotal += 24 * 60; // Crossed midnight (e.g. 22:00 -> 02:00 = 4h)
  }

  const diffHours = (eTotal - sTotal) / 60;
  if (diffHours <= 0) return null;

  return Number.isInteger(diffHours) ? `${diffHours}h` : `${diffHours.toFixed(1)}h`;
}

// Local Deterministic Natural Language Fallback Parser
export function parseShiftLocally(rawText) {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const baseDate = getKolkataDate();

  // 1. Role & Category extraction
  let title = null;
  let category = "General";

  if (/\bwaiter\b|\bwaitress\b|\bwaitstaff\b|\bserver\b/i.test(text)) {
    title = "Waiter";
    category = "Cafe";
  } else if (/\bbarista\b|\bcoffee\b/i.test(text)) {
    title = "Barista";
    category = "Cafe";
  } else if (/\bcashier\b|\bbilling\b/i.test(text)) {
    title = "Cashier";
    category = "Retail";
  } else if (/\bsecurity guard\b|\bguard\b|\bbouncer\b/i.test(text)) {
    title = "Security Guard";
    category = "General";
  } else if (/\bcleaner\b|\bcleaning\b|\bhousekeeping\b|\bdeep clean\b/i.test(text)) {
    title = "Deep Cleaning";
    category = "Cleaning";
  } else if (/\belectrician\b|\bwiring\b|\belectrical\b/i.test(text)) {
    title = "Electrician";
    category = "Repairs";
  } else if (/\bplumber\b|\bplumbing\b/i.test(text)) {
    title = "Plumber";
    category = "Repairs";
  } else if (/\bgardener\b|\bgardening\b|\blawn\b/i.test(text)) {
    title = "Gardener";
    category = "Gardening";
  } else if (/\bwarehouse\b|\bpacker\b|\bloading\b|\bdelivery\b/i.test(text)) {
    title = "Warehouse Helper";
    category = "Logistics";
  } else if (/\bshop helper\b|\bstore helper\b|\bretail\b/i.test(text)) {
    title = "Shop Helper";
    category = "Retail";
  } else if (/\bhelper\b|\bworker\b/i.test(text)) {
    title = "General Helper";
    category = "General";
  }

  // 2. Date extraction
  let date = null;
  if (/\btomorrow\b/i.test(text)) {
    date = resolveRelativeDate("tomorrow", baseDate);
  } else if (/\btoday\b/i.test(text)) {
    date = resolveRelativeDate("today", baseDate);
  } else if (/\byesterday\b/i.test(text)) {
    date = resolveRelativeDate("yesterday", baseDate);
  } else if (/\bthis weekend\b|\bweekend\b/i.test(text)) {
    date = resolveRelativeDate("this weekend", baseDate);
  } else if (/\b(this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(text)) {
    const match = text.match(/\b((?:this|next)\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (match) {
      const phrase = `${match[1] || "this "}${match[2]}`.trim();
      date = resolveRelativeDate(phrase, baseDate);
    }
  }

  // 3. Time extraction (Strict - no guessing!)
  let startTime = null;
  let endTime = null;

  // Range matching e.g. "6 PM to 11 PM", "from 9 AM to 3 PM", "10:00 AM - 2:00 PM"
  const rangeMatch = text.match(/(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|till|until)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  if (rangeMatch) {
    let rawStart = rangeMatch[1].trim();
    let rawEnd = rangeMatch[2].trim();

    // If start time omitted meridiem but end time has it (e.g. "6 to 11 PM")
    if (!/am|pm/i.test(rawStart) && /pm/i.test(rawEnd)) {
      const endHour = parseInt(rawEnd, 10);
      const startHour = parseInt(rawStart, 10);
      if (startHour <= endHour || startHour <= 12) {
        rawStart += " PM";
      }
    } else if (!/am|pm/i.test(rawStart) && /am/i.test(rawEnd)) {
      rawStart += " AM";
    }

    startTime = normalizeTime(rawStart);
    endTime = normalizeTime(rawEnd);
  } else {
    // Single start time match
    const singleStart = text.match(/(?:at|from|starting at)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
    if (singleStart) {
      startTime = normalizeTime(singleStart[1]);
    }
  }

  // 4. Duration calculation
  let duration = null;
  if (startTime && endTime) {
    duration = calculateDuration(startTime, endTime);
  } else {
    const explicitDuration = text.match(/\b(\d+)\s*(?:hours?|hrs?)\s*(?:shift)?\b/i);
    if (explicitDuration) {
      duration = `${explicitDuration[1]}h`;
    }
  }

  // 5. Pay & PayType extraction (Strict - no guessing!)
  let paymentAmount = null;
  let paymentType = null;

  const hourlyMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+)\s*(?:₹|rs\.?|inr)?\s*(?:per|\/)\s*hour/i) ||
                      text.match(/(?:hourly\s*(?:pay|rate|of)?\s*(?:₹|rs\.?|inr)?\s*(\d+))/i);

  const fixedMatch = text.match(/(?:pay|paying|payout|compensation)?\s*(?:is|of|for)?\s*(?:₹|rs\.?|inr)\s*(\d+)/i) ||
                     text.match(/(?:₹|rs\.?|inr)\s*(\d+)\s*(?:for the shift|fixed|total|per shift)?/i) ||
                     text.match(/\bpay\s*(?:is)?\s*(\d{2,6})\b/i);

  if (hourlyMatch) {
    paymentAmount = Number(hourlyMatch[1]);
    paymentType = "hourly";
  } else if (fixedMatch && !/to be discussed|negotiable|discuss/i.test(text)) {
    paymentAmount = Number(fixedMatch[1]);
    if (/for the shift|fixed|total|shift/i.test(text) || !/hour|hr/i.test(text)) {
      paymentType = "fixed";
    }
  }

  // 6. Required skills extraction
  const requiredSkills = [];
  const skillPatterns = [
    { pattern: /\bexcel\b/i, name: "Excel" },
    { pattern: /\bcustomer service\b|\bcustomer handling\b/i, name: "Customer Service" },
    { pattern: /\binventory management\b|\bstocking\b/i, name: "Inventory Management" },
    { pattern: /\bdeep clean(?:ing)?\b/i, name: "Deep Cleaning" },
    { pattern: /\bcooking\b|\bkitchen prep\b/i, name: "Kitchen Prep" },
    { pattern: /\bwiring\b|\belectrical repairs\b/i, name: "Wiring & Electrical" },
    { pattern: /\blawn mowing\b/i, name: "Lawn Mowing" },
    { pattern: /\btable service\b/i, name: "Table Service" }
  ];

  for (const item of skillPatterns) {
    if (item.pattern.test(text)) {
      requiredSkills.push(item.name);
    }
  }

  // 7. Workers required count
  let workersRequired = 1;
  const workersMatch = text.match(/\b(\d+)\s*(?:waiters?|servers?|cleaners?|workers?|helpers?|staff|people|guards?)\b/i);
  if (workersMatch) {
    workersRequired = Math.max(1, parseInt(workersMatch[1], 10));
  }

  // 8. Location extraction
  let location = null;
  const locationMatch = text.match(/\b(?:in|at|near|location:?)\s+([A-Z][a-zA-Z0-9\s,]+?)(?:\s+(?:paying|from|for|with|tomorrow|today|this)|\.|$)/);
  if (locationMatch && locationMatch[1].trim().length > 2) {
    const locCandidate = locationMatch[1].trim();
    if (!/^(the|a|an|urgent|flexible|fixed)$/i.test(locCandidate)) {
      location = locCandidate;
    }
  }

  // 9. Needs Clarification determination (Strictly check required fields)
  const needsClarification = [];
  if (!title) needsClarification.push("role");
  if (!date) needsClarification.push("date");
  if (!startTime) needsClarification.push("startTime");
  if (!endTime) needsClarification.push("endTime");
  if (paymentAmount === null || isNaN(paymentAmount)) needsClarification.push("pay");
  if (paymentAmount !== null && !paymentType) needsClarification.push("payType");
  if (!location) needsClarification.push("location");

  const description = title
    ? `Shift for ${title}: ${text}`
    : text;

  return {
    parsedShift: {
      title,
      description,
      category,
      requiredSkills,
      workersRequired,
      date,
      startTime,
      endTime,
      duration,
      paymentAmount,
      paymentType,
      location,
      urgency: /urgent|asap|immediately/i.test(text) ? "urgent" : "normal"
    },
    needsClarification
  };
}

// Main AI Shift Parser function
export async function parseShiftFromNaturalLanguage(rawText) {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    throw new Error("rawText must be a non-empty string");
  }

  const baseDate = getKolkataDate();
  const baseDateFormatted = formatYMD(baseDate);
  const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][baseDate.getDay()];
  const apiKey = process.env.GEMINI_API_KEY;

  // If Gemini API Key is configured, attempt LLM structured parsing
  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      });

      const systemPrompt = `You are an expert AI parser for FlexyWork, a localized flexible shift platform.
Convert the employer's natural language shift request into strict structured JSON.

CURRENT SERVER CONTEXT:
- Timezone: Asia/Kolkata (UTC+05:30)
- Reference Today's Date: ${baseDateFormatted} (${dayOfWeek})
- Valid Categories: ["Cafe", "Cleaning", "Repairs", "Gardening", "Retail", "Logistics", "Events", "General"]

STRICT EXTRACTION RULES (CRITICAL):
1. NEVER GUESS OR INVENT CRITICAL INFORMATION (pay, start time, end time, date, location).
2. If pay is missing or says "to be discussed", set "paymentAmount": null and add "pay" to "needsClarification".
3. If pay is clearly per hour (e.g., "₹150/hr"), set "paymentType": "hourly" and "paymentAmount": number.
4. If pay is for the whole shift (e.g., "₹1000 for the shift"), set "paymentType": "fixed" and "paymentAmount": number.
5. If start time or end time is ambiguous or unmentioned, set them to null and add them to "needsClarification".
6. Time must be normalized to "HH:mm" (24-hour format). E.g. "6 PM" -> "18:00", "9 AM" -> "09:00", "11 PM" -> "23:00".
7. Relative dates: "today" -> "${baseDateFormatted}", "tomorrow" -> add 1 day, "this Saturday" -> upcoming Saturday.
8. Duration: If both startTime and endTime are known, calculate duration string (e.g. "5h"). Handle midnight crossings (e.g. 22:00 to 02:00 -> "4h").
9. Required skills: Only extract explicitly mentioned skills (e.g., "Must know Excel" -> ["Excel"]). Do not invent skills.
10. "needsClarification" must be a string array containing any of: ["role", "date", "startTime", "endTime", "pay", "payType", "location"].

JSON OUTPUT SCHEMA:
{
  "title": string | null,
  "description": string | null,
  "category": string | null,
  "requiredSkills": string[],
  "workersRequired": number,
  "date": string | null (YYYY-MM-DD),
  "startTime": string | null (HH:mm),
  "endTime": string | null (HH:mm),
  "duration": string | null,
  "paymentAmount": number | null,
  "paymentType": "fixed" | "hourly" | null,
  "location": string | null,
  "urgency": "normal" | "urgent",
  "needsClarification": string[]
}`;

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Employer shift description:\n"${rawText}"` }
      ]);

      const responseText = result.response.text();
      const parsedData = JSON.parse(responseText);

      // Validate & Normalize structured output
      const normalizedDate = parsedData.date ? resolveRelativeDate(parsedData.date, baseDate) : null;
      const normalizedStart = parsedData.startTime ? normalizeTime(parsedData.startTime) : null;
      const normalizedEnd = parsedData.endTime ? normalizeTime(parsedData.endTime) : null;

      let normalizedDuration = parsedData.duration;
      if (normalizedStart && normalizedEnd) {
        normalizedDuration = calculateDuration(normalizedStart, normalizedEnd);
      }

      const clarificationSet = new Set(Array.isArray(parsedData.needsClarification) ? parsedData.needsClarification : []);
      if (!parsedData.title) clarificationSet.add("role");
      if (!normalizedDate) clarificationSet.add("date");
      if (!normalizedStart) clarificationSet.add("startTime");
      if (!normalizedEnd) clarificationSet.add("endTime");
      if (parsedData.paymentAmount === null || parsedData.paymentAmount === undefined || isNaN(parsedData.paymentAmount)) {
        clarificationSet.add("pay");
      }
      if (!parsedData.location) clarificationSet.add("location");

      return {
        parsedShift: {
          title: parsedData.title || null,
          description: parsedData.description || `Shift for ${parsedData.title || "worker"}: ${rawText}`,
          category: VALID_CATEGORIES.includes(parsedData.category) ? parsedData.category : "General",
          requiredSkills: Array.isArray(parsedData.requiredSkills) ? parsedData.requiredSkills : [],
          workersRequired: Number.isInteger(parsedData.workersRequired) && parsedData.workersRequired >= 1 ? parsedData.workersRequired : 1,
          date: normalizedDate,
          startTime: normalizedStart,
          endTime: normalizedEnd,
          duration: normalizedDuration || null,
          paymentAmount: parsedData.paymentAmount !== null && !isNaN(parsedData.paymentAmount) ? Number(parsedData.paymentAmount) : null,
          paymentType: parsedData.paymentType === "hourly" || parsedData.paymentType === "fixed" ? parsedData.paymentType : null,
          location: parsedData.location || null,
          urgency: parsedData.urgency === "urgent" ? "urgent" : "normal"
        },
        needsClarification: Array.from(clarificationSet)
      };
    } catch (llmError) {
      console.warn("Gemini LLM parsing failed or timed out. Falling back to local deterministic parser:", llmError.message);
      // Fallback safely to local deterministic parser
      return parseShiftLocally(rawText);
    }
  }

  // Local deterministic parser fallback
  return parseShiftLocally(rawText);
}
