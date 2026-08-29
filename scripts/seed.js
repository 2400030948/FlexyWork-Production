import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDb } from "../server/config/db.js";
import { Application } from "../server/models/Application.js";
import { Attendance } from "../server/models/Attendance.js";
import { Community, CooperativeGig } from "../server/models/Community.js";
import { Notification } from "../server/models/Notification.js";
import { Payment } from "../server/models/Payment.js";
import { EmployerProfile, WorkerProfile } from "../server/models/Profile.js";
import { Rating } from "../server/models/Rating.js";
import { Shift } from "../server/models/Shift.js";
import { User } from "../server/models/User.js";

dotenv.config();

const defaultAvailability = [
  { day: "Mon", status: "Available", ranges: ["9 AM - 1 PM", "4 PM - 8 PM"] },
  { day: "Tue", status: "Available", ranges: ["9 AM - 1 PM", "4 PM - 8 PM"] },
  { day: "Wed", status: "Unavailable", ranges: [] },
  { day: "Thu", status: "Available", ranges: ["9 AM - 1 PM", "4 PM - 8 PM"] },
  { day: "Fri", status: "Available", ranges: ["9 AM - 1 PM", "5 PM - 9 PM"] },
  { day: "Sat", status: "Available", ranges: ["10 AM - 6 PM"] },
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
await Promise.all([
  Application.deleteMany({}),
  Attendance.deleteMany({}),
  Community.deleteMany({}),
  CooperativeGig.deleteMany({}),
  Notification.deleteMany({}),
  Payment.deleteMany({}),
  Rating.deleteMany({}),
  Shift.deleteMany({})
]);

// 1. Users
const harshita = await upsertUser({ name: "Harshita", email: "harshita@flexywork.local", role: "employer", location: "Vijayawada" });
const priyaNair = await upsertUser({ name: "Priya Nair", email: "employer@flexywork.local", role: "employer", location: "Indiranagar" });
const priyaWorker = await upsertUser({ name: "Priya Sharma", email: "worker@flexywork.local", role: "worker", location: "Suryaraopeta, Vijayawada" });
const amit = await upsertUser({ name: "Amit Patel", email: "amit@flexywork.local", role: "worker", location: "Benz Circle, Vijayawada" });
const ravi = await upsertUser({ name: "Ravi Kumar", email: "ravi@flexywork.local", role: "worker", location: "Governorpet, Vijayawada" });
const rahul = await upsertUser({ name: "Rahul Sharma", email: "rahul@flexywork.local", role: "worker", location: "Indiranagar" });
const aisha = await upsertUser({ name: "Aisha Khan", email: "aisha@flexywork.local", role: "worker", location: "Domlur" });
const admin = await upsertUser({ name: "FlexyWork Admin", email: "admin@flexywork.local", role: "admin", location: "Vijayawada" });

// 2. Employer Profiles
await EmployerProfile.findOneAndUpdate(
  { userId: harshita._id },
  { businessName: "Harshita's Residence", businessType: "Household", description: "Local resident hiring verified home service professionals.", location: "Vijayawada" },
  { upsert: true }
);

await EmployerProfile.findOneAndUpdate(
  { userId: priyaNair._id },
  { businessName: "Blue Bowl Cafe", businessType: "Cafe", description: "Neighborhood cafe hiring flexible local staff.", location: "Indiranagar" },
  { upsert: true }
);

// 3. Worker Profiles
await WorkerProfile.findOneAndUpdate(
  { userId: priyaWorker._id },
  {
    skills: ["Deep Cleaning", "Organization", "Elder Care assistance", "Disinfection Services"],
    experience: "128 completed cleaning and household gigs",
    bio: "Experienced cleaning specialist dedicated to transforming homes. I focus on details and eco-friendly products. Member of the local collective.",
    expectedHourlyWage: 250,
    availability: defaultAvailability,
    rating: 4.9,
    reliabilityScore: 98,
    completedShifts: 128,
    isVerified: true,
    location: "Suryaraopeta, Vijayawada"
  },
  { upsert: true }
);

await WorkerProfile.findOneAndUpdate(
  { userId: amit._id },
  {
    skills: ["Wiring & Repairs", "Appliance Installation", "AC Servicing", "Smart Home Setup"],
    experience: "94 completed electrical repair gigs",
    bio: "Licensed electrician with 6+ years of field experience in residential and retail projects. Quick troubleshooting and neat fixes.",
    expectedHourlyWage: 350,
    availability: [
      { day: "Mon", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Tue", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Wed", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Thu", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Fri", status: "Available", ranges: ["8 AM - 5 PM"] },
      { day: "Sat", status: "Limited", ranges: ["9 AM - 1 PM"] },
      { day: "Sun", status: "Unavailable", ranges: [] }
    ],
    rating: 4.8,
    reliabilityScore: 95,
    completedShifts: 94,
    isVerified: true,
    location: "Benz Circle, Vijayawada",
    certifications: [
      {
        title: "ITI Electrician Certificate",
        issuingOrganization: "Government ITI",
        issueDate: "2018",
        expiryDate: "No Expiry",
        credentialId: "ITI-2018-AP-4421",
        description: "Two-year full-time program covering residential and industrial wiring, motor rewinding and safety standards.",
        documentUrl: "",
        verificationStatus: "verified",
        verifiedAt: new Date()
      },
      {
        title: "Smart Home Installer - Level 1",
        issuingOrganization: "FlexyWork Academy",
        issueDate: "2024",
        credentialId: "FW-SHI-2024-119",
        description: "Hands-on certification for WiFi smart switch and ceiling fan installations.",
        documentUrl: "",
        verificationStatus: "pending"
      }
    ],
    workExperiences: [
      {
        jobTitle: "Electrician",
        organization: "ABC Electrical Services",
        startDate: "2022",
        endDate: "",
        currentlyWorking: true,
        description: "• Residential electrical installation\n• Electrical maintenance\n• Safety inspection",
        skills: ["Wiring", "Maintenance", "Safety inspection"]
      },
      {
        jobTitle: "Junior Electrician",
        organization: "Krishna District Electricians Union",
        startDate: "2018",
        endDate: "2022",
        currentlyWorking: false,
        description: "• Apprenticeship on commercial wiring projects\n• Assisted in appliance installation jobs",
        skills: ["Wiring", "Apprenticeship"]
      }
    ]
  },
  { upsert: true }
);

await WorkerProfile.findOneAndUpdate(
  { userId: ravi._id },
  {
    skills: ["Lawn Mowing", "Pruning & Hedging", "Garden Setup", "Pest Control", "Potting & Soil Mix"],
    experience: "64 completed gardening gigs",
    bio: "Passionate gardener helping urban apartments and residential villas build beautiful green zones. Highly skilled in native Indian flora.",
    expectedHourlyWage: 200,
    availability: [
      { day: "Mon", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Tue", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Wed", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Thu", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Fri", status: "Available", ranges: ["7 AM - 11 AM", "3 PM - 6 PM"] },
      { day: "Sat", status: "Available", ranges: ["8 AM - 4 PM"] },
      { day: "Sun", status: "Available", ranges: ["8 AM - 12 PM"] }
    ],
    rating: 4.7,
    reliabilityScore: 92,
    completedShifts: 64,
    isVerified: true,
    location: "Governorpet, Vijayawada"
  },
  { upsert: true }
);

await WorkerProfile.findOneAndUpdate(
  { userId: rahul._id },
  {
    skills: ["Customer handling", "Table service", "Billing support", "Basic communication"],
    experience: "47 completed cafe and retail shifts",
    bio: "Reliable evening-shift worker for cafes and local shops.",
    expectedHourlyWage: 150,
    availability: defaultAvailability,
    rating: 4.8,
    reliabilityScore: 96,
    completedShifts: 47,
    isVerified: true,
    location: "Indiranagar"
  },
  { upsert: true }
);

await WorkerProfile.findOneAndUpdate(
  { userId: aisha._id },
  {
    skills: ["Events", "Customer handling", "Guest support", "Coordination"],
    experience: "72 event and hospitality shifts",
    bio: "Dedicated event and guest coordinator for local events.",
    expectedHourlyWage: 180,
    availability: defaultAvailability,
    rating: 4.9,
    reliabilityScore: 98,
    completedShifts: 72,
    isVerified: true,
    location: "Domlur"
  },
  { upsert: true }
);

// 4. Shifts
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const dayAfter = new Date(Date.now() + 172800000).toISOString().slice(0, 10);
const saturday = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

const gigCleaning = await Shift.create({
  employerId: harshita._id,
  title: "2BHK Apartment Deep Cleaning",
  description: "Requires full sweep, kitchen grease cleaning, window washing, and bathroom disinfection. Cleaning materials provided on site.",
  category: "Cleaning",
  requiredSkills: ["Deep Cleaning", "Organization"],
  workersRequired: 1,
  assignedWorkerIds: [priyaWorker._id],
  date: today,
  startTime: "10:00 AM",
  endTime: "2:00 PM",
  duration: "4h",
  paymentType: "fixed",
  paymentAmount: 1000,
  location: "Moghalrajpuram, Vijayawada",
  status: "filled",
  urgency: "normal"
});

const gigElectrician = await Shift.create({
  employerId: harshita._id,
  title: "Install Smart Light Switches & Ceiling Fans",
  description: "Need to replace 4 standard switches with smart WiFi-enabled touch switches, and hang a new ceiling fan in the living room.",
  category: "Repairs",
  requiredSkills: ["Wiring & Repairs", "Appliance Installation"],
  workersRequired: 1,
  assignedWorkerIds: [],
  date: tomorrow,
  startTime: "2:00 PM",
  endTime: "4:30 PM",
  duration: "2.5h",
  paymentType: "fixed",
  paymentAmount: 850,
  location: "Benz Circle, Vijayawada",
  status: "published",
  urgency: "normal"
});

const gigGarden = await Shift.create({
  employerId: harshita._id,
  title: "Kitchen Garden Pruning & Re-potting",
  description: "We have 15 potted plants that need trimming, fresh nutrient soil mix, and root health check. Organic manure provided.",
  category: "Gardening",
  requiredSkills: ["Lawn Mowing", "Pruning & Hedging", "Potting & Soil Mix"],
  workersRequired: 1,
  assignedWorkerIds: [],
  date: dayAfter,
  startTime: "8:00 AM",
  endTime: "11:00 AM",
  duration: "3h",
  paymentType: "hourly",
  paymentAmount: 600,
  location: "Kanuru, Vijayawada",
  status: "published",
  urgency: "normal"
});

const gigCafe = await Shift.create({
  employerId: priyaNair._id,
  title: "Restaurant Helper",
  description: "Support dinner service, help with table setup, assist counter orders, and keep the floor guest-ready during a busy evening shift.",
  category: "Cafe",
  requiredSkills: ["Customer handling", "Table service", "Basic communication"],
  workersRequired: 2,
  assignedWorkerIds: [rahul._id],
  date: today,
  startTime: "6 PM",
  endTime: "10 PM",
  duration: "4h",
  paymentType: "fixed",
  paymentAmount: 600,
  location: "Indiranagar",
  status: "published",
  urgency: "normal"
});

const gigRetail = await Shift.create({
  employerId: priyaNair._id,
  title: "Shop Assistant",
  description: "Help restock shelves, guide customers, pack orders, and assist the cashier during the evening rush.",
  category: "Retail",
  requiredSkills: ["Stocking", "Customer handling", "Billing support"],
  workersRequired: 1,
  assignedWorkerIds: [],
  date: today,
  startTime: "5 PM",
  endTime: "9 PM",
  duration: "4h",
  paymentType: "fixed",
  paymentAmount: 500,
  location: "Koramangala",
  status: "published",
  urgency: "normal"
});

const gigEvent = await Shift.create({
  employerId: priyaNair._id,
  title: "Event Crew",
  description: "Assist with event setup, guest movement, vendor coordination, and wrap-up after a community product showcase.",
  category: "Events",
  requiredSkills: ["Setup", "Guest support", "Coordination"],
  workersRequired: 3,
  assignedWorkerIds: [aisha._id],
  date: saturday,
  startTime: "10 AM",
  endTime: "4 PM",
  duration: "6h",
  paymentType: "fixed",
  paymentAmount: 900,
  location: "Domlur",
  status: "published",
  urgency: "urgent"
});

// 5. Applications & Attendance
await Application.create({
  shiftId: gigCleaning._id,
  workerId: priyaWorker._id,
  status: "accepted",
  acceptedAt: new Date()
});

await Application.create({
  shiftId: gigCafe._id,
  workerId: rahul._id,
  status: "accepted",
  acceptedAt: new Date()
});

await Application.create({
  shiftId: gigEvent._id,
  workerId: aisha._id,
  status: "accepted",
  acceptedAt: new Date()
});

await Attendance.create({
  shiftId: gigCleaning._id,
  workerId: priyaWorker._id,
  checkInAt: new Date(Date.now() - 3600000 * 3),
  status: "checked_in"
});

await Attendance.create({
  shiftId: gigCafe._id,
  workerId: rahul._id,
  status: "scheduled"
});

// 6. Payments
await Payment.create({
  shiftId: gigCleaning._id,
  workerId: priyaWorker._id,
  employerId: harshita._id,
  amount: gigCleaning.paymentAmount,
  status: "pending"
});

// 7. Communities & Cooperative Gigs
const homeServices = await Community.create({
  name: "Vijayawada Home Services Collective",
  memberCount: 128,
  rating: 4.8,
  services: ["Cleaning", "Gardening", "Elder Care", "Cooking", "Event Help"],
  totalEarnings: 342500,
  bannerImage: "/images/collective-banner.jpg",
  logo: "VH",
  description: "A local worker cooperative of skilled home professionals collaborating on gigs, sharing equipment, pooling transport, and bidding on larger commercial estate and apartment contracts together.",
  activityFeed: [
    { text: "Priya Sharma completed 25 gigs this month.", timestamp: "2 hours ago" },
    { text: "Ravi Kumar joined the Cooperative Board.", timestamp: "1 day ago" },
    { text: "Collective secured the Sri Balaji Towers annual garden maintenance contract!", timestamp: "3 days ago" },
    { text: "₹42,500 earned by community members this week.", timestamp: "4 days ago" }
  ]
});

const electriciansUnion = await Community.create({
  name: "Krishna District Electricians Union",
  memberCount: 45,
  rating: 4.7,
  services: ["Wiring & Repairs", "Appliance Installation", "Solar Panel Maintenance", "HVAC Servicing"],
  totalEarnings: 189000,
  bannerImage: "/images/electrician-banner.jpg",
  logo: "KE",
  description: "Connecting certified electricians across the region. We standardise pricing, handle bulk contracts for commercial construction sites, and provide peer-reviewed skills upskilling sessions.",
  activityFeed: [
    { text: "Amit Patel joined the Electricians Collective.", timestamp: "4 hours ago" },
    { text: "Union completed rewiring for the Community Center Hall.", timestamp: "2 days ago" },
    { text: "Free tool testing session scheduled for next Saturday.", timestamp: "5 days ago" }
  ]
});

await CooperativeGig.create([
  {
    communityId: homeServices._id,
    title: "Community Hall Annual Maintenance",
    description: "Comprehensive refresh of the local Suryaraopeta Community Hall. Requires structural electrical inspection, garden hedge redesign, and deep hygiene disinfection of the facilities.",
    totalPayout: 8500,
    workersRequired: 4,
    joinedWorkers: [
      { workerId: amit._id, name: "Amit Patel", role: "Wiring & Repairs" },
      { workerId: ravi._id, name: "Ravi Kumar", role: "Lawn Mowing" }
    ],
    skillsRequired: [
      { skill: "Wiring & Repairs", count: 2, filled: 1 },
      { skill: "Lawn Mowing", count: 1, filled: 1 },
      { skill: "Deep Cleaning", count: 1, filled: 0 }
    ],
    status: "open",
    distribution: "Equal parts distribution by hourly commitment across each completed check-in."
  },
  {
    communityId: homeServices._id,
    title: "Sri Balaji Towers Garden & Lobby Overhaul",
    description: "Bi-annual spruce-up of the lawns and lobby furniture of the Sri Balaji Apartment complex. Requires hedge clipping, lobby sanitization, and light plumbing checks.",
    totalPayout: 4200,
    workersRequired: 2,
    joinedWorkers: [
      { workerId: ravi._id, name: "Ravi Kumar", role: "Lawn Mowing" }
    ],
    skillsRequired: [
      { skill: "Lawn Mowing", count: 1, filled: 1 },
      { skill: "Deep Cleaning", count: 1, filled: 0 }
    ],
    status: "open",
    distribution: "Gardeners take 60% of pool; cleaning and support workers take 40%."
  }
]);

// 8. Notifications
await Notification.create([
  { userId: harshita._id, message: "Priya Sharma accepted your cleaning request for today." },
  { userId: priyaWorker._id, message: "Harshita requested your Deep Cleaning services for today." },
  { userId: priyaWorker._id, message: "Vijayawada Home Services Collective posted a new gig: Community Hall Annual Maintenance." },
  { userId: priyaNair._id, message: "Rahul Sharma applied for Restaurant Helper." }
]);

console.log("Seed complete. Demo logins ready:");
console.log("- Seeker: employer@flexywork.local / password123 (or harshita@flexywork.local)");
console.log("- Worker: worker@flexywork.local / password123 (or amit@flexywork.local, ravi@flexywork.local)");
console.log("- Admin: admin@flexywork.local / password123");
process.exit(0);
