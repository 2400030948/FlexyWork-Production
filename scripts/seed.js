import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDb } from "../server/config/db.js";
import { Application } from "../server/models/Application.js";
import { Attendance } from "../server/models/Attendance.js";
import { Notification } from "../server/models/Notification.js";
import { EmployerProfile, WorkerProfile } from "../server/models/Profile.js";
import { Shift } from "../server/models/Shift.js";
import { User } from "../server/models/User.js";

dotenv.config();

const availability = [
  { day: "Mon", status: "Available", ranges: ["6 PM - 10 PM"] },
  { day: "Tue", status: "Available", ranges: ["6 PM - 10 PM"] },
  { day: "Wed", status: "Unavailable", ranges: [] },
  { day: "Thu", status: "Available", ranges: ["5 PM - 9 PM"] },
  { day: "Fri", status: "Available", ranges: ["6 PM - 11 PM"] },
  { day: "Sat", status: "Available", ranges: ["10 AM - 8 PM"] },
  { day: "Sun", status: "Limited", ranges: ["11 AM - 3 PM"] }
];

async function upsertUser({ name, email, role, location }) {
  const passwordHash = await bcrypt.hash("password123", 12);
  return User.findOneAndUpdate(
    { email },
    { name, email, role, location, passwordHash },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );
}

await connectDb();
await Promise.all([Application.deleteMany({}), Attendance.deleteMany({}), Notification.deleteMany({}), Shift.deleteMany({})]);

const employer = await upsertUser({ name: "Priya Nair", email: "employer@flexywork.local", role: "employer", location: "Indiranagar" });
const worker = await upsertUser({ name: "Rahul Sharma", email: "worker@flexywork.local", role: "worker", location: "Indiranagar" });
const aisha = await upsertUser({ name: "Aisha Khan", email: "aisha@flexywork.local", role: "worker", location: "Domlur" });

await EmployerProfile.findOneAndUpdate(
  { userId: employer._id },
  { businessName: "Blue Bowl Cafe", businessType: "Cafe", description: "Neighborhood cafe hiring flexible local staff.", location: "Indiranagar" },
  { upsert: true }
);

await WorkerProfile.findOneAndUpdate(
  { userId: worker._id },
  {
    skills: ["Customer handling", "Table service", "Billing support", "Basic communication"],
    experience: "47 completed cafe and retail shifts",
    bio: "Reliable evening-shift worker for cafes and local shops.",
    expectedHourlyWage: 125,
    availability,
    rating: 4.8,
    reliabilityScore: 96,
    completedShifts: 47,
    location: "Indiranagar"
  },
  { upsert: true }
);

await WorkerProfile.findOneAndUpdate(
  { userId: aisha._id },
  {
    skills: ["Events", "Customer handling", "Guest support", "Coordination"],
    experience: "72 event and hospitality shifts",
    expectedHourlyWage: 140,
    availability,
    rating: 4.9,
    reliabilityScore: 98,
    completedShifts: 72,
    location: "Domlur"
  },
  { upsert: true }
);

const today = new Date().toISOString().slice(0, 10);
const saturday = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

await Shift.insertMany([
  {
    employerId: employer._id,
    title: "Restaurant Helper",
    description: "Support dinner service, help with table setup, assist counter orders, and keep the floor guest-ready during a busy evening shift.",
    category: "Cafe",
    requiredSkills: ["Customer handling", "Table service", "Basic communication"],
    workersRequired: 2,
    date: today,
    startTime: "6 PM",
    endTime: "10 PM",
    duration: "4h",
    paymentType: "fixed",
    paymentAmount: 600,
    location: "Indiranagar",
    status: "published"
  },
  {
    employerId: employer._id,
    title: "Shop Assistant",
    description: "Help restock shelves, guide customers, pack orders, and assist the cashier during the evening rush.",
    category: "Retail",
    requiredSkills: ["Stocking", "Customer handling", "Billing support"],
    workersRequired: 1,
    date: today,
    startTime: "5 PM",
    endTime: "9 PM",
    duration: "4h",
    paymentType: "fixed",
    paymentAmount: 500,
    location: "Koramangala",
    status: "published"
  },
  {
    employerId: employer._id,
    title: "Event Crew",
    description: "Assist with event setup, guest movement, vendor coordination, and wrap-up after a community product showcase.",
    category: "Events",
    requiredSkills: ["Setup", "Guest support", "Coordination"],
    workersRequired: 3,
    date: saturday,
    startTime: "10 AM",
    endTime: "4 PM",
    duration: "6h",
    paymentType: "fixed",
    paymentAmount: 900,
    location: "Domlur",
    status: "published"
  }
]);

console.log("Seed complete. Demo logins: worker@flexywork.local / password123, employer@flexywork.local / password123");
process.exit(0);
