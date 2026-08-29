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
  if (lower === "today" || lower === "aaj") {
    return formatYMD(current);
  }

  if (lower === "tomorrow") {
  if (lower === "tomorrow" || lower === "kal" || lower === "kal subah" || lower === "kal shaam") {
    current.setDate(current.getDate() + 1);
    return formatYMD(current);
  }

  if (lower === "yesterday") {
  if (lower === "day after tomorrow" || lower === "parso") {
    current.setDate(current.getDate() + 2);
    return formatYMD(current);
  }

  if (lower === "yesterday" || lower === "beeta kal") {
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
    itwaar: 0,
    ravivaar: 0,
    monday: 1,
    mon: 1,
    somvaar: 1,
    tuesday: 2,
    tue: 2,
    mangalvaar: 2,
    wednesday: 3,
    wed: 3,
    budhvaar: 3,
    thursday: 4,
    thu: 4,
    guruvaar: 4,
    friday: 5,
    fri: 5,
    shukravaar: 5,
    saturday: 6,
    sat: 6
    sat: 6,
    shanivaar: 6
  };

  for (const [dayName, targetDay] of Object.entries(daysMap)) {
    if (lower === dayName || lower === `this ${dayName}`) {
    if (lower === dayName || lower === `this ${dayName}` || lower === `iss ${dayName}`) {
      const diff = (targetDay - currentDayOfWeek + 7) % 7;
      current.setDate(current.getDate() + (diff === 0 ? 0 : diff));
      return formatYMD(current);
    }
    if (lower === `next ${dayName}`) {
    if (lower === `next ${dayName}` || lower === `agla ${dayName}`) {
      const diff = (targetDay - currentDayOfWeek + 7) % 7;
      const daysToAdd = diff === 0 ? 7 : diff + 7;
      current.setDate(current.getDate() + daysToAdd);
      return formatYMD(current);
    }
  }

  if (lower === "next week") {
    // Next Monday
  if (lower === "next week" || lower === "agle hafte") {
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
// Convert 12h/24h and Hinglish time to standard "HH:mm"
export function normalizeTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim().toLowerCase();

  // Handle formats like "18:00", "09:30"
  // Match 24h e.g. "18:00"
  const match24 = clean.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const h = String(match24[1]).padStart(2, "0");
    const m = match24[2];
    return `${h}:${m}`;
  }

  // Handle formats like "6 pm", "6:30 pm", "9am", "6 in the evening"
  // Match Hinglish e.g. "shaam 6 baje", "subah 9:30 baje", "raat 11 baje"
  const matchHinglish = clean.match(/^(?:(subah|shaam|dopahar|raat)\s+)?(\d{1,2})(?::(\d{2}))?\s*(?:baje)?(?:\s+(subah|shaam|dopahar|raat|am|pm))?$/i);
  if (matchHinglish) {
    let hour = parseInt(matchHinglish[2], 10);
    const minute = matchHinglish[3] ? matchHinglish[3] : "00";
    const timeOfDay = (matchHinglish[1] || matchHinglish[4] || "").toLowerCase();

    if (hour > 23) return null;

    if (["shaam", "dopahar", "raat", "pm"].includes(timeOfDay)) {
      if (hour < 12) hour += 12;
    } else if (["subah", "am"].includes(timeOfDay)) {
      if (hour === 12) hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  // Standard 12h e.g. "6 pm", "6:30 pm", "9am"
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|in the morning|in the evening|in the afternoon|at night)?$/i);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const minute = match12[2] ? match12[2] : "00";
    const meridiem = (match12[3] || "").toLowerCase();

    if (hour > 23) return null;

    if (meridiem === "pm" || meridiem === "in the evening" || meridiem === "in the afternoon" || meridiem === "at night") {
    if (["pm", "in the evening", "in the afternoon", "at night"].includes(meridiem)) {
      if (hour < 12) hour += 12;
    } else if (meridiem === "am" || meridiem === "in the morning") {
    } else if (["am", "in the morning"].includes(meridiem)) {
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
    eTotal += 24 * 60;
  }

  const diffHours = (eTotal - sTotal) / 60;
  if (diffHours <= 0) return null;

  return Number.isInteger(diffHours) ? `${diffHours}h` : `${diffHours.toFixed(1)}h`;
}

// Local Deterministic Natural Language Fallback Parser
// Local Deterministic Natural Language Fallback Parser with Multi-Lingual / Hinglish Support
export function parseShiftLocally(rawText) {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const baseDate = getKolkataDate();

  // 1. Role & Category extraction
  let title = null;
  let category = "General";

  if (/\bwaiter\b|\bwaitress\b|\bwaitstaff\b|\bserver\b/i.test(text)) {
  if (/\bwaiter\b|\bwaitress\b|\bwaitstaff\b|\bserver\b|\bcafe helper\b/i.test(text)) {
    title = "Waiter";
    category = "Cafe";
  } else if (/\bbarista\b|\bcoffee\b/i.test(text)) {
  } else if (/\bbarista\b|\bcoffee\b|\bchai\b/i.test(text)) {
    title = "Barista";
    category = "Cafe";
  } else if (/\bcashier\b|\bbilling\b/i.test(text)) {
  } else if (/\bcashier\b|\bbilling\b|\bcounter\b/i.test(text)) {
    title = "Cashier";
    category = "Retail";
  } else if (/\bsecurity guard\b|\bguard\b|\bbouncer\b/i.test(text)) {
  } else if (/\bsecurity guard\b|\bguard\b|\bbouncer\b|\bchowkidar\b/i.test(text)) {
    title = "Security Guard";
    category = "General";
  } else if (/\bcleaner\b|\bcleaning\b|\bhousekeeping\b|\bdeep clean\b/i.test(text)) {
  } else if (/\bcleaner\b|\bcleaning\b|\bhousekeeping\b|\bdeep clean\b|\bsafai\b/i.test(text)) {
    title = "Deep Cleaning";
    category = "Cleaning";
  } else if (/\belectrician\b|\bwiring\b|\belectrical\b/i.test(text)) {
  } else if (/\belectrician\b|\bwiring\b|\belectrical\b|\bbijli\b/i.test(text)) {
    title = "Electrician";
    category = "Repairs";
  } else if (/\bplumber\b|\bplumbing\b/i.test(text)) {
  } else if (/\bplumber\b|\bplumbing\b|\bpipe\b/i.test(text)) {
    title = "Plumber";
    category = "Repairs";
  } else if (/\bgardener\b|\bgardening\b|\blawn\b/i.test(text)) {
  } else if (/\bgardener\b|\bgardening\b|\blawn\b|\bmali\b/i.test(text)) {
    title = "Gardener";
    category = "Gardening";
  } else if (/\bwarehouse\b|\bpacker\b|\bloading\b|\bdelivery\b/i.test(text)) {
  } else if (/\bwarehouse\b|\bpacker\b|\bloading\b|\bdelivery\b|\bgodown\b/i.test(text)) {
    title = "Warehouse Helper";
    category = "Logistics";
  } else if (/\bshop helper\b|\bstore helper\b|\bretail\b/i.test(text)) {
  } else if (/\bshop helper\b|\bstore helper\b|\bretail\b|\bdukaan\b/i.test(text)) {
    title = "Shop Helper";
    category = "Retail";
  } else if (/\bhelper\b|\bworker\b/i.test(text)) {
  } else if (/\bhelper\b|\bworker\b|\blabor\b|\bbanda\b|\blog\b/i.test(text)) {
    title = "General Helper";
    category = "General";
  }

  // 2. Date extraction
  // 2. Date extraction (English + Hinglish)
  let date = null;
  if (/\btomorrow\b/i.test(text)) {
  if (/\btomorrow\b|\bkal\b/i.test(text) && !/\byesterday\b|\bbeeta kal\b/i.test(text)) {
    date = resolveRelativeDate("tomorrow", baseDate);
  } else if (/\btoday\b/i.test(text)) {
  } else if (/\bparso\b|\bday after tomorrow\b/i.test(text)) {
    date = resolveRelativeDate("day after tomorrow", baseDate);
  } else if (/\btoday\b|\baaj\b/i.test(text)) {
    date = resolveRelativeDate("today", baseDate);
  } else if (/\byesterday\b/i.test(text)) {
    date = resolveRelativeDate("yesterday", baseDate);
  } else if (/\bthis weekend\b|\bweekend\b/i.test(text)) {
    date = resolveRelativeDate("this weekend", baseDate);
  } else if (/\b(this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(text)) {
    const match = text.match(/\b((?:this|next)\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  } else if (/\b(this|next|iss|agla)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday|somvaar|mangalvaar|budhvaar|guruvaar|shukravaar|shanivaar|ravivaar|itwaar)\b/i.test(text)) {
    const match = text.match(/\b((?:this|next|iss|agla)\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|somvaar|mangalvaar|budhvaar|guruvaar|shukravaar|shanivaar|ravivaar|itwaar)\b/i);
    if (match) {
      const phrase = `${match[1] || "this "}${match[2]}`.trim();
      date = resolveRelativeDate(phrase, baseDate);
    }
  }

  // 3. Time extraction (Strict - no guessing!)
  // 3. Time extraction (English + Hinglish, e.g. "6 PM to 11 PM", "subah 9 baje se dopahar 2 baje tak")
  let startTime = null;
  let endTime = null;

  // Range matching e.g. "6 PM to 11 PM", "from 9 AM to 3 PM", "10:00 AM - 2:00 PM"
  const hinglishRange = text.match(/((?:(?:subah|shaam|dopahar|raat)\s+)?\d{1,2}(?::\d{2})?\s*(?:baje|am|pm)?)\s*(?:se|from|to|-|till|tak|se leke)\s*((?:(?:subah|shaam|dopahar|raat)\s+)?\d{1,2}(?::\d{2})?\s*(?:baje|tak|am|pm)?)/i);
  const rangeMatch = text.match(/(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-|till|until)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  if (rangeMatch) {

  if (rangeMatch && !/baje|subah|shaam|dopahar|raat|se/i.test(rangeMatch[0])) {
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
  } else if (hinglishRange) {
    startTime = normalizeTime(hinglishRange[1]);
    endTime = normalizeTime(hinglishRange[2]);
  } else {
    // Single start time match
    const singleStart = text.match(/(?:at|from|starting at)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
    const singleStart = text.match(/(?:at|from|starting at|baje)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
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
    const explicitDuration = text.match(/\b(\d+)\s*(?:hours?|hrs?|ghante?)\s*(?:shift|ke liye)?\b/i);
    if (explicitDuration) {
      duration = `${explicitDuration[1]}h`;
    }
  }

  // 5. Pay & PayType extraction (Strict - no guessing!)
  // 5. Pay & PayType extraction
  let paymentAmount = null;
  let paymentType = null;

  const hourlyMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+)\s*(?:₹|rs\.?|inr)?\s*(?:per|\/)\s*hour/i) ||
  const hourlyMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+)\s*(?:₹|rs\.?|inr)?\s*(?:per|\/|har)\s*(?:hour|ghanta|hr)/i) ||
                      text.match(/(?:hourly\s*(?:pay|rate|of)?\s*(?:₹|rs\.?|inr)?\s*(\d+))/i);

  const fixedMatch = text.match(/(?:pay|paying|payout|compensation)?\s*(?:is|of|for)?\s*(?:₹|rs\.?|inr)\s*(\d+)/i) ||
                     text.match(/(?:₹|rs\.?|inr)\s*(\d+)\s*(?:for the shift|fixed|total|per shift)?/i) ||
  const fixedMatch = text.match(/(?:pay|paying|payout|compensation|dungaa?|dena|rupaye|rupees)?\s*(?:is|of|for)?\s*(?:₹|rs\.?|inr)?\s*(\d{3,6})\s*(?:₹|rs\.?|inr|rupaye|rupees|hazar)?\s*(?:for the shift|fixed|total|per shift|dungaa?|milega)?/i) ||
                     text.match(/\bpay\s*(?:is)?\s*(\d{2,6})\b/i);

  if (hourlyMatch) {
    paymentAmount = Number(hourlyMatch[1]);
    paymentType = "hourly";
  } else if (fixedMatch && !/to be discussed|negotiable|discuss/i.test(text)) {
  } else if (fixedMatch && !/to be discussed|negotiable|discuss|baat karenge/i.test(text)) {
    paymentAmount = Number(fixedMatch[1]);
    if (/for the shift|fixed|total|shift/i.test(text) || !/hour|hr/i.test(text)) {
    if (/for the shift|fixed|total|shift|dungaa?|milega/i.test(text) || !/hour|hr|ghanta/i.test(text)) {
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
    { pattern: /\bcustomer service\b|\bcustomer handling\b|\bbat karne ka tarika\b/i, name: "Customer Service" },
    { pattern: /\binventory management\b|\bstocking\b|\bstock check\b/i, name: "Inventory Management" },
    { pattern: /\bdeep clean(?:ing)?\b|\bsafai\b/i, name: "Deep Cleaning" },
    { pattern: /\bcooking\b|\bkitchen prep\b|\bkhana banana\b/i, name: "Kitchen Prep" },
    { pattern: /\bwiring\b|\belectrical repairs\b|\bbijli fitting\b/i, name: "Wiring & Electrical" },
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
  const workersMatch = text.match(/\b(\d+)\s*(?:waiters?|servers?|cleaners?|workers?|helpers?|staff|people|guards?|log|bande|person)\b/i);
  if (workersMatch) {
    workersRequired = Math.max(1, parseInt(workersMatch[1], 10));
  }

  // 8. Location extraction
  let location = null;
  const locationMatch = text.match(/\b(?:in|at|near|location:?)\s+([A-Z][a-zA-Z0-9\s,]+?)(?:\s+(?:paying|from|for|with|tomorrow|today|this)|\.|$)/);
  const locationMatch = text.match(/\b(?:in|at|near|location:?|me|par)\s+([A-Z][a-zA-Z0-9\s,]+?)(?:\s+(?:paying|from|for|with|tomorrow|today|this|me|par)|\.|$)/);
  if (locationMatch && locationMatch[1].trim().length > 2) {
    const locCandidate = locationMatch[1].trim();
    if (!/^(the|a|an|urgent|flexible|fixed)$/i.test(locCandidate)) {
      location = locCandidate;
    }
  }

  // 9. Needs Clarification determination (Strictly check required fields)
  // 9. Needs Clarification determination
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
      urgency: /urgent|asap|immediately|jaldi/i.test(text) ? "urgent" : "normal"
    },
    needsClarification
  };
}

// AI Description Enhancer
export async function enhanceShiftDescription({ title, category, location, skills, description }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an expert shift coordinator on FlexyWork. 
Write a professional, attractive, and well-structured shift description for workers.

Shift Details:
- Title: ${title || "Service Professional"}
- Category: ${category || "General"}
- Location: ${location || "Indiranagar, Bangalore"}
- Required Skills: ${(skills || []).join(", ") || "General skills"}
- Employer Notes: ${description || "Reliable work needed."}

Format the description cleanly with:
1. Role Summary (1-2 sentences)
2. Key Responsibilities (3 bullet points)
3. Requirements & Attire (2 bullet points)
4. On-Site Perks & Safety (1-2 bullet points)

Keep tone clear, motivating, and concise (under 120 words).`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (e) {
      console.warn("AI Description Enhancer fallback:", e.message);
    }
  }

  // Local structured template fallback
  return `Role Overview:
Seeking a dependable ${title || "professional"} to assist with ${category || "general"} shift duties at our ${location || "on-site"} location.

Key Responsibilities:
• Deliver prompt and professional assistance according to supervisor instructions.
• Maintain a clean, organized, and safe work area at all times.
• Collaborate courteously with staff and patrons.

Requirements:
• Relevant experience in ${category} (${(skills || []).join(", ") || "basic competency"}).
• Punctuality and professional attire required. On-site verification via OTP upon arrival.`;
}

// Category Wage Benchmarks (Average market rates in INR)
export function getCategoryWageBenchmarks() {
  return {
    Cafe: { hourlyMin: 150, hourlyMax: 250, hourlyAvg: 180, fixedAvg: 900, label: "₹150 - ₹250/hr" },
    Cleaning: { hourlyMin: 180, hourlyMax: 300, hourlyAvg: 220, fixedAvg: 1500, label: "₹1,200 - ₹2,000 / shift" },
    Repairs: { hourlyMin: 200, hourlyMax: 350, hourlyAvg: 260, fixedAvg: 1300, label: "₹1,000 - ₹1,800 / shift" },
    Gardening: { hourlyMin: 150, hourlyMax: 250, hourlyAvg: 190, fixedAvg: 950, label: "₹800 - ₹1,200 / shift" },
    Retail: { hourlyMin: 120, hourlyMax: 200, hourlyAvg: 160, fixedAvg: 800, label: "₹120 - ₹200/hr" },
    Logistics: { hourlyMin: 140, hourlyMax: 220, hourlyAvg: 175, fixedAvg: 1000, label: "₹800 - ₹1,400 / shift" },
    Events: { hourlyMin: 200, hourlyMax: 350, hourlyAvg: 250, fixedAvg: 1500, label: "₹1,000 - ₹2,500 / shift" },
    General: { hourlyMin: 120, hourlyMax: 180, hourlyAvg: 150, fixedAvg: 750, label: "₹120 - ₹180/hr" }
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
Convert the employer's natural language shift request (supports English, Hindi, Hinglish) into strict structured JSON.

CURRENT SERVER CONTEXT:
- Timezone: Asia/Kolkata (UTC+05:30)
- Reference Today's Date: ${baseDateFormatted} (${dayOfWeek})
- Valid Categories: ["Cafe", "Cleaning", "Repairs", "Gardening", "Retail", "Logistics", "Events", "General"]

STRICT EXTRACTION RULES (CRITICAL):
1. NEVER GUESS OR INVENT CRITICAL INFORMATION (pay, start time, end time, date, location).
2. If pay is missing or says "to be discussed", set "paymentAmount": null and add "pay" to "needsClarification".
3. If pay is clearly per hour (e.g., "₹150/hr"), set "paymentType": "hourly" and "paymentAmount": number.
4. If pay is for the whole shift (e.g., "₹1000 for the shift"), set "paymentType": "fixed" and "paymentAmount": number.
2. If pay is missing or says "to be discussed" / "baat karenge", set "paymentAmount": null and add "pay" to "needsClarification".
3. If pay is clearly per hour (e.g., "₹150/hr", "200 per ghanta"), set "paymentType": "hourly" and "paymentAmount": number.
4. If pay is for the whole shift (e.g., "₹1000 for the shift", "800 rupaye dunga"), set "paymentType": "fixed" and "paymentAmount": number.
5. If start time or end time is ambiguous or unmentioned, set them to null and add them to "needsClarification".
6. Time must be normalized to "HH:mm" (24-hour format). E.g. "6 PM" -> "18:00", "9 AM" -> "09:00", "11 PM" -> "23:00".
7. Relative dates: "today" -> "${baseDateFormatted}", "tomorrow" -> add 1 day, "this Saturday" -> upcoming Saturday.
6. Time must be normalized to "HH:mm" (24-hour format). E.g. "6 PM" / "shaam 6 baje" -> "18:00", "9 AM" / "subah 9 baje" -> "09:00", "11 PM" -> "23:00".
7. Relative dates: "today" / "aaj" -> "${baseDateFormatted}", "tomorrow" / "kal" -> add 1 day, "this Saturday" -> upcoming Saturday.
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
