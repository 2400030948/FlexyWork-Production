import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlarmClock,
  BadgeCheck,
  Banknote,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Gauge,
  HeartHandshake,
  IndianRupee,
  ListChecks,
  LocateFixed,
  MapPin,
  MessageSquareText,
  Navigation,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  UserRoundCheck,
  UsersRound,
  WandSparkles
} from "lucide-react";
import "./styles.css";

const weights = {
  availability: 30,
  distance: 20,
  skills: 20,
  reliability: 15,
  experience: 10,
  pay: 5
};

const shifts = [
  {
    id: 1,
    role: "Restaurant Helper",
    employer: "Blue Bowl Cafe",
    area: "Indiranagar",
    distance: 1.2,
    date: "Today",
    time: "6 PM - 10 PM",
    duration: "4h",
    pay: 600,
    category: "Cafe",
    tags: ["Nearby", "Evening", "Meals included"],
    skills: ["Customer handling", "Table service", "Basic communication"],
    description:
      "Support dinner service, help with table setup, assist counter orders, and keep the floor guest-ready during a busy evening shift.",
    scores: { availability: 100, distance: 92, skills: 90, reliability: 96, experience: 88, pay: 100 }
  },
  {
    id: 2,
    role: "Shop Assistant",
    employer: "FreshMart Local",
    area: "Koramangala",
    distance: 1.4,
    date: "Today",
    time: "5 PM - 9 PM",
    duration: "4h",
    pay: 500,
    category: "Retail",
    tags: ["No experience required", "Nearby", "Fast pay"],
    skills: ["Stocking", "Customer handling", "Billing support"],
    description:
      "Help restock shelves, guide customers, pack orders, and assist the cashier during the evening rush.",
    scores: { availability: 100, distance: 90, skills: 86, reliability: 96, experience: 80, pay: 94 }
  },
  {
    id: 3,
    role: "Event Crew",
    employer: "StageReady Events",
    area: "Domlur",
    distance: 3.8,
    date: "Saturday",
    time: "10 AM - 4 PM",
    duration: "6h",
    pay: 900,
    category: "Events",
    tags: ["Weekend", "Team shift", "High pay"],
    skills: ["Setup", "Guest support", "Coordination"],
    description:
      "Assist with event setup, guest movement, vendor coordination, and wrap-up after a community product showcase.",
    scores: { availability: 82, distance: 72, skills: 90, reliability: 96, experience: 92, pay: 100 }
  }
];

const workers = [
  { name: "Rahul Sharma", rating: 4.8, reliability: 96, distance: 1.4, shifts: 47, skills: ["Retail", "Cafe", "Billing"], speed: "Usually replies in 4 min" },
  { name: "Aisha Khan", rating: 4.9, reliability: 98, distance: 2.1, shifts: 72, skills: ["Events", "Customer handling"], speed: "Usually replies in 7 min" },
  { name: "Neel Iyer", rating: 4.7, reliability: 92, distance: 0.9, shifts: 28, skills: ["Stocking", "Delivery support"], speed: "Usually replies in 3 min" }
];

const availability = [
  { day: "Mon", status: "Available", ranges: ["6 PM - 10 PM"] },
  { day: "Tue", status: "Available", ranges: ["6 PM - 10 PM"] },
  { day: "Wed", status: "Unavailable", ranges: [] },
  { day: "Thu", status: "Available", ranges: ["5 PM - 9 PM"] },
  { day: "Fri", status: "Available", ranges: ["6 PM - 11 PM"] },
  { day: "Sat", status: "Available", ranges: ["10 AM - 8 PM"] },
  { day: "Sun", status: "Limited", ranges: ["11 AM - 3 PM"] }
];

function matchScore(item) {
  return Math.round(
    Object.entries(weights).reduce((total, [key, weight]) => total + (item.scores[key] * weight) / 100, 0)
  );
}

function workerMatch(worker) {
  return Math.round(worker.reliability * 0.42 + Math.max(0, 100 - worker.distance * 10) * 0.28 + worker.rating * 6 + worker.shifts * 0.12);
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat">
      <Icon size={19} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ShiftCard({ shift, selected, onClick }) {
  const score = matchScore(shift);
  return (
    <button className={`shift-card ${selected ? "selected" : ""}`} onClick={onClick}>
      <div className="card-topline">
        <span>{shift.category}</span>
        <strong>{score}% match</strong>
      </div>
      <h3>{shift.role}</h3>
      <p>{shift.employer}</p>
      <div className="shift-meta">
        <span><Clock3 size={16} />{shift.time}</span>
        <span><IndianRupee size={16} />{shift.pay}</span>
        <span><MapPin size={16} />{shift.distance} km</span>
      </div>
      <div className="tags">{shift.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    </button>
  );
}

function Landing({ setRole }) {
  return (
    <section className="hero" id="home">
      <img src="/flexywork-hero.png" alt="Local worker accepting a flexible shift at a neighborhood cafe" />
      <div className="hero-overlay" />
      <nav className="nav">
        <a className="brand" href="#home"><BriefcaseBusiness size={22} />FlexyWork</a>
        <div>
          <a href="#worker">Workers</a>
          <a href="#employer">Employers</a>
          <a href="#trust">Trust</a>
        </div>
      </nav>
      <div className="hero-content">
        <p className="eyebrow"><Sparkles size={16} />AI-powered local shift matching</p>
        <h1>Work when you want. Hire when you need.</h1>
        <p>FlexyWork connects local businesses with reliable workers for hourly, daily, recurring, and on-demand shifts.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => setRole("worker")}>Find Work <ChevronRight size={18} /></button>
          <button className="secondary" onClick={() => setRole("employer")}>Hire Workers</button>
        </div>
      </div>
      <div className="match-float">
        <div>
          <strong>Restaurant Helper</strong>
          <span>Today, 6 PM - 10 PM</span>
        </div>
        <b>94%</b>
      </div>
    </section>
  );
}

function Onboarding({ role, setRole }) {
  return (
    <section className="section onboarding">
      <div className="section-title">
        <p className="eyebrow"><UserRoundCheck size={16} />Onboarding</p>
        <h2>What are you here to do?</h2>
      </div>
      <div className="choice-grid">
        <button className={role === "worker" ? "choice active" : "choice"} onClick={() => setRole("worker")}>
          <CalendarClock />
          <strong>Find flexible work</strong>
          <span>Set your hours, see nearby shifts, accept the ones that fit.</span>
        </button>
        <button className={role === "employer" ? "choice active" : "choice"} onClick={() => setRole("employer")}>
          <UsersRound />
          <strong>Hire workers</strong>
          <span>Create a shift in seconds and invite the best local matches.</span>
        </button>
      </div>
    </section>
  );
}

function WorkerDashboard() {
  const [selectedId, setSelectedId] = useState(1);
  const selected = shifts.find((shift) => shift.id === selectedId);
  const score = matchScore(selected);

  return (
    <section className="workspace" id="worker">
      <div className="panel intro">
        <p className="eyebrow"><Radio size={16} />Worker home</p>
        <h2>Good evening, Rahul</h2>
        <p>You are available today from <strong>6 PM - 10 PM</strong>. Here are the shifts that fit your schedule, location, and pay goals.</p>
        <div className="stats-row">
          <Stat icon={ShieldCheck} label="Reliability" value="94/100" />
          <Stat icon={Navigation} label="Nearby shifts" value="8" />
          <Stat icon={CircleDollarSign} label="Week goal" value="₹2,400" />
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Recommended for you</h3>
            <span>Shift-first matches</span>
          </div>
          <div className="shift-list">
            {shifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} selected={shift.id === selectedId} onClick={() => setSelectedId(shift.id)} />
            ))}
          </div>
        </div>
        <div className="panel details-panel">
          <div className="score-ring" style={{ "--score": `${score}%` }}>
            <span>{score}%</span>
            <small>Match</small>
          </div>
          <h3>{selected.role}</h3>
          <p>{selected.description}</p>
          <div className="detail-grid">
            <Stat icon={Clock3} label="Schedule" value={`${selected.date}, ${selected.time}`} />
            <Stat icon={Banknote} label="Earnings" value={`₹${selected.pay}`} />
            <Stat icon={LocateFixed} label="Location" value={`${selected.distance} km away`} />
          </div>
          <h4>Why you are a good match</h4>
          <ul className="check-list">
            <li><Check />Available for the entire shift</li>
            <li><Check />Relevant skills: {selected.skills.slice(0, 2).join(", ")}</li>
            <li><Check />96% reliability score</li>
            <li><Check />Pay expectation matches</li>
          </ul>
          <button className="primary wide">Accept Shift</button>
        </div>
      </div>
    </section>
  );
}

function Availability() {
  return (
    <section className="section">
      <div className="section-title">
        <p className="eyebrow"><CalendarClock size={16} />Availability</p>
        <h2>Your week, matched to shifts.</h2>
      </div>
      <div className="availability">
        {availability.map((day) => (
          <div className={`day ${day.status.toLowerCase()}`} key={day.day}>
            <strong>{day.day}</strong>
            <div className="timeline">
              <span />
              {day.ranges.map((range) => <b key={range}>{range}</b>)}
            </div>
            <small>{day.status}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmployerDashboard() {
  const [prompt, setPrompt] = useState("Need 2 helpers tomorrow from 5 to 9 PM. ₹500 each.");
  const parsed = useMemo(() => ({
    role: prompt.toLowerCase().includes("waiter") ? "Waiter" : "Helper",
    workers: prompt.match(/\b(\d+)\b/)?.[1] ?? "1",
    date: prompt.toLowerCase().includes("tomorrow") ? "Tomorrow" : "Today",
    time: "5 PM - 9 PM",
    pay: prompt.match(/₹\s?(\d+)/)?.[1] ?? "500",
    location: "Current business location"
  }), [prompt]);

  return (
    <section className="workspace" id="employer">
      <div className="panel intro employer-intro">
        <p className="eyebrow"><BriefcaseBusiness size={16} />Employer home</p>
        <h2>Do you have enough people for today?</h2>
        <div className="stats-row">
          <Stat icon={UsersRound} label="Active workers" value="6" />
          <Stat icon={CalendarClock} label="Upcoming shifts" value="12" />
          <Stat icon={AlarmClock} label="Open positions" value="3" />
          <Stat icon={CheckCircle2} label="Completed" value="18" />
        </div>
      </div>
      <div className="dashboard-grid employer-grid">
        <div className="panel create-panel">
          <div className="panel-head">
            <h3>Quick Create</h3>
            <span><WandSparkles size={15} />AI parse</span>
          </div>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <div className="parsed">
            {Object.entries(parsed).map(([key, value]) => (
              <div key={key}><span>{key}</span><strong>{value}</strong></div>
            ))}
          </div>
          <div className="button-row">
            <button className="secondary">Edit</button>
            <button className="primary">Publish Shift</button>
          </div>
          <button className="urgent"><BellRing size={18} />Need Someone Now</button>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>Best workers for this shift</h3>
            <span>Transparent scoring</span>
          </div>
          <div className="worker-list">
            {workers.map((worker) => (
              <div className="worker-card" key={worker.name}>
                <div className="avatar">{worker.name.split(" ").map((part) => part[0]).join("")}</div>
                <div>
                  <strong>{worker.name}</strong>
                  <p><Star size={15} />{worker.rating} · Reliability {worker.reliability} · {worker.distance} km</p>
                  <small>{worker.shifts} shifts completed · {worker.speed}</small>
                </div>
                <b>{workerMatch(worker)}%</b>
                <button className="icon-button" aria-label={`Invite ${worker.name}`}><Plus size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExecutionFlow() {
  return (
    <section className="section execution">
      <div className="section-title">
        <p className="eyebrow"><TimerReset size={16} />Shift execution</p>
        <h2>Check in, finish, get paid.</h2>
      </div>
      <div className="flow-grid">
        <div className="panel compact">
          <Clock3 />
          <h3>Upcoming Shift</h3>
          <p>5 PM - 9 PM · Shop Assistant</p>
          <button className="primary wide">Check In</button>
        </div>
        <div className="panel compact active-work">
          <Gauge />
          <h3>You are working</h3>
          <p>Started 5:02 PM · Elapsed 2h 13m</p>
          <button className="secondary wide">Check Out</button>
        </div>
        <div className="panel compact paid">
          <IndianRupee />
          <h3>Shift Completed</h3>
          <strong>₹500</strong>
          <p>Payment: Processing</p>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="section trust" id="trust">
      <div className="section-title">
        <p className="eyebrow"><HeartHandshake size={16} />Trust layer</p>
        <h2>Reliable because the score is explainable.</h2>
      </div>
      <div className="trust-grid">
        {[
          ["Attendance", "98%", "Completed shifts and no-show history"],
          ["On-time rate", "94%", "Check-in timing across recent work"],
          ["Ratings", "4.8", "Two-sided reviews from workers and employers"],
          ["Verification", "Done", "Identity, business profile, and payment checks"]
        ].map(([label, value, copy]) => (
          <div className="metric" key={label}>
            <BadgeCheck />
            <strong>{value}</strong>
            <span>{label}</span>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [role, setRole] = useState("worker");
  return (
    <>
      <Landing setRole={setRole} />
      <main>
        <section className="section problem">
          <div className="section-title">
            <p className="eyebrow"><MessageSquareText size={16} />The gap</p>
            <h2>Need someone for 3 hours?</h2>
          </div>
          <p>Traditional job platforms are built around resumes, interviews, and waiting. FlexyWork starts with availability and turns urgent local need into a matched shift.</p>
          <div className="steps">
            {["Set availability", "Match nearby", "Work the shift", "Get paid"].map((step, index) => <span key={step}>{index + 1}. {step}</span>)}
          </div>
        </section>
        <Onboarding role={role} setRole={setRole} />
        {role === "worker" ? <WorkerDashboard /> : <EmployerDashboard />}
        <Availability />
        <EmployerDashboard />
        <ExecutionFlow />
        <Trust />
      </main>
      <footer>
        <BriefcaseBusiness size={20} />
        <span>FlexyWork · Right person. Right place. Right time.</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
