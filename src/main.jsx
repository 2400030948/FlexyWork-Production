import React, { useEffect, useMemo, useState } from "react";
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

const defaultAvailability = [
  { day: "Mon", status: "Available", ranges: ["6 PM - 10 PM"] },
  { day: "Tue", status: "Available", ranges: ["6 PM - 10 PM"] },
  { day: "Wed", status: "Unavailable", ranges: [] },
  { day: "Thu", status: "Available", ranges: ["5 PM - 9 PM"] },
  { day: "Fri", status: "Available", ranges: ["6 PM - 11 PM"] },
  { day: "Sat", status: "Available", ranges: ["10 AM - 8 PM"] },
  { day: "Sun", status: "Limited", ranges: ["11 AM - 3 PM"] }
];

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function initials(name = "") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
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

function Notice({ message, type = "success" }) {
  if (!message) return null;
  return <div className={`notice ${type}`}>{message}</div>;
}

function ShiftCard({ shift, selected, onClick }) {
  const score = shift.match?.score ?? 82;
  return (
    <button className={`shift-card ${selected ? "selected" : ""}`} onClick={onClick}>
      <div className="card-topline">
        <span>{shift.category}</span>
        <strong>{score}% match</strong>
      </div>
      <h3>{shift.title}</h3>
      <p>{shift.employer}</p>
      <div className="shift-meta">
        <span><Clock3 size={16} />{shift.time}</span>
        <span><IndianRupee size={16} />{shift.paymentAmount}</span>
        <span><MapPin size={16} />{shift.location}</span>
      </div>
      <div className="tags">{shift.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div>
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
          <strong>Live MongoDB shifts</strong>
          <span>Publish, apply, accept</span>
        </div>
        <b>API</b>
      </div>
    </section>
  );
}

function AuthPanel({ role, setRole, user, onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "Rahul Sharma",
    email: "worker@flexwork.local",
    password: "password123",
    businessName: "Blue Bowl Cafe",
    location: "Indiranagar"
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: role === "worker" ? "Rahul Sharma" : "Priya Nair",
      email: role === "worker" ? "worker@flexwork.local" : "employer@flexwork.local"
    }));
  }, [role]);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    try {
      const payload = mode === "login" ? { email: form.email, password: form.password } : { ...form, role };
      const data = await api(`/api/auth/${mode}`, { method: "POST", body: JSON.stringify(payload) });
      onAuth(data.user);
      setRole(data.user.role);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    onAuth(null);
  }

  return (
    <section className="section onboarding">
      <div className="section-title">
        <p className="eyebrow"><UserRoundCheck size={16} />Account</p>
        <h2>{user ? `Signed in as ${user.name}` : "Sign in to use real shifts."}</h2>
      </div>
      {user ? (
        <div className="panel auth-panel">
          <p>{user.email} · {user.role}</p>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      ) : (
        <form className="panel form-grid" onSubmit={submit}>
          <div className="button-row">
            <button type="button" className={mode === "login" ? "primary" : "secondary"} onClick={() => setMode("login")}>Login</button>
            <button type="button" className={mode === "register" ? "primary" : "secondary"} onClick={() => setMode("register")}>Register</button>
          </div>
          {mode === "register" && <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" />}
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" />
          <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" type="password" />
          {mode === "register" && role === "employer" && <input value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} placeholder="Business name" />}
          {mode === "register" && <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Location" />}
          <button className="primary wide">{mode === "login" ? "Login" : "Create Account"}</button>
          <Notice message={message} type="error" />
        </form>
      )}
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

function WorkerDashboard({ user, refreshKey }) {
  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [mine, setMine] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", minPay: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "worker") return;
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    setLoading(true);
    api(`/api/shifts?${params}`)
      .then((data) => {
        setShifts(data.shifts);
        setSelectedId(data.shifts[0]?.id || "");
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
    api("/api/shifts/mine").then((data) => setMine(data.shifts)).catch(() => {});
  }, [user, filters, refreshKey]);

  useEffect(() => {
    if (!selectedId || !user) return;
    api(`/api/shifts/${selectedId}`).then((data) => setSelected(data.shift)).catch((error) => setMessage(error.message));
  }, [selectedId, user]);

  async function apply() {
    setMessage("");
    try {
      const data = await api(`/api/shifts/${selected.id}/apply`, { method: "POST" });
      setMessage(data.message);
      const detail = await api(`/api/shifts/${selected.id}`);
      setSelected(detail.shift);
      const myData = await api("/api/shifts/mine");
      setMine(myData.shifts);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const upcoming = mine.filter((shift) => ["published", "filled", "in_progress"].includes(shift.status));
  const completed = mine.filter((shift) => shift.status === "completed");

  return (
    <section className="workspace" id="worker">
      <div className="panel intro">
        <p className="eyebrow"><Radio size={16} />Worker home</p>
        <h2>{user ? `Good evening, ${user.name}` : "Worker dashboard"}</h2>
        <p>Browse published shifts from MongoDB, open details, and submit a real application tied to your worker account.</p>
        <div className="stats-row">
          <Stat icon={ShieldCheck} label="Reliability" value="Live" />
          <Stat icon={Navigation} label="Nearby shifts" value={shifts.length} />
          <Stat icon={CircleDollarSign} label="Applications" value={mine.length} />
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Recommended for you</h3>
            <span>Shift-first matches</span>
          </div>
          <div className="filter-row">
            <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search shifts" />
            <input value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} placeholder="Category" />
            <input value={filters.minPay} onChange={(event) => setFilters({ ...filters, minPay: event.target.value })} placeholder="Min pay" type="number" />
          </div>
          {loading && <p className="muted">Loading shifts...</p>}
          {!loading && shifts.length === 0 && <div className="empty-state">No shifts found nearby. Try changing your search or ask an employer to publish one.</div>}
          <div className="shift-list">
            {shifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} selected={shift.id === selectedId} onClick={() => setSelectedId(shift.id)} />
            ))}
          </div>
        </div>
        <div className="panel details-panel">
          {selected ? (
            <>
              <div className="score-ring" style={{ "--score": `${selected.match?.score || 82}%` }}>
                <span>{selected.match?.score || 82}%</span>
                <small>Match</small>
              </div>
              <h3>{selected.title}</h3>
              <p>{selected.description}</p>
              <div className="detail-grid">
                <Stat icon={Clock3} label="Schedule" value={`${selected.date}, ${selected.time}`} />
                <Stat icon={Banknote} label="Earnings" value={`₹${selected.paymentAmount}`} />
                <Stat icon={LocateFixed} label="Location" value={selected.location} />
              </div>
              <h4>Why you are a good match</h4>
              <ul className="check-list">
                {(selected.match?.reasons || []).map((reason) => <li key={reason}><Check />{reason}</li>)}
              </ul>
              <button className="primary wide" onClick={apply} disabled={Boolean(selected.applicationStatus)}>
                {selected.applicationStatus ? `Application ${selected.applicationStatus}` : "Accept Shift"}
              </button>
              <Notice message={message} type={message.includes("already") || message.includes("failed") ? "error" : "success"} />
            </>
          ) : (
            <div className="empty-state">Select a published shift to view details.</div>
          )}
        </div>
      </div>
      <div className="panel shifts-panel">
        <div className="panel-head"><h3>My Shifts</h3><span>MongoDB applications</span></div>
        <div className="flow-grid">
          <div><h4>Upcoming</h4>{upcoming.length ? upcoming.map((shift) => <p key={shift.id}>{shift.title} · {shift.applicationStatus}</p>) : <p className="muted">No upcoming shifts.</p>}</div>
          <div><h4>Completed</h4>{completed.length ? completed.map((shift) => <p key={shift.id}>{shift.title}</p>) : <p className="muted">No completed shifts.</p>}</div>
          <div><h4>Cancelled</h4><p className="muted">No cancelled shifts.</p></div>
        </div>
      </div>
    </section>
  );
}

function Availability({ user }) {
  const [availability, setAvailability] = useState(defaultAvailability);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.role !== "worker") return;
    api("/api/workers/me/availability").then((data) => setAvailability(data.availability.length ? data.availability : defaultAvailability)).catch(() => {});
  }, [user]);

  function toggle(day) {
    setAvailability((items) =>
      items.map((item) =>
        item.day === day
          ? { ...item, status: item.status === "Available" ? "Unavailable" : "Available", ranges: item.status === "Available" ? [] : ["6 PM - 10 PM"] }
          : item
      )
    );
  }

  async function save() {
    try {
      await api("/api/workers/me/availability", { method: "PUT", body: JSON.stringify({ availability }) });
      setMessage("Availability saved");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="section">
      <div className="section-title">
        <p className="eyebrow"><CalendarClock size={16} />Availability</p>
        <h2>Your week, matched to shifts.</h2>
      </div>
      <div className="availability">
        {availability.map((day) => (
          <button className={`day ${day.status.toLowerCase()}`} key={day.day} onClick={() => user?.role === "worker" && toggle(day.day)}>
            <strong>{day.day}</strong>
            <div className="timeline">
              <span />
              {day.ranges.map((range) => <b key={range}>{range}</b>)}
            </div>
            <small>{day.status}</small>
          </button>
        ))}
      </div>
      {user?.role === "worker" && <button className="primary save-availability" onClick={save}>Save Availability</button>}
      <Notice message={message} type={message.includes("saved") ? "success" : "error"} />
    </section>
  );
}

function EmployerDashboard({ user, onPublished }) {
  const [prompt, setPrompt] = useState("Need 2 helpers tomorrow from 5 to 9 PM. ₹500 each.");
  const [form, setForm] = useState({
    title: "Helper",
    description: "Flexible helper shift for a local business.",
    category: "General",
    requiredSkills: "Customer handling, Basic communication",
    workersRequired: 1,
    date: new Date().toISOString().slice(0, 10),
    startTime: "5 PM",
    endTime: "9 PM",
    duration: "4h",
    paymentType: "fixed",
    paymentAmount: 500,
    location: "Indiranagar",
    maximumDistance: 8,
    urgency: "normal"
  });
  const [shifts, setShifts] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.role !== "employer") return;
    api("/api/shifts/mine").then((data) => {
      setShifts(data.shifts);
      setSelectedShiftId((current) => current || data.shifts[0]?.id || "");
    }).catch((error) => setMessage(error.message));
  }, [user, message]);

  useEffect(() => {
    if (!selectedShiftId || user?.role !== "employer") return;
    api(`/api/shifts/${selectedShiftId}/applications`).then((data) => setApplications(data.applications)).catch(() => setApplications([]));
  }, [selectedShiftId, user]);

  const stats = useMemo(() => ({
    active: shifts.filter((shift) => ["published", "filled", "in_progress"].includes(shift.status)).length,
    upcoming: shifts.filter((shift) => shift.status === "published").length,
    open: shifts.reduce((total, shift) => total + Math.max(0, shift.workersRequired - shift.filledCount), 0),
    completed: shifts.filter((shift) => shift.status === "completed").length
  }), [shifts]);

  async function parsePrompt() {
    try {
      const data = await api("/api/shifts/parse", { method: "POST", body: JSON.stringify({ prompt }) });
      setForm({ ...form, ...data.parsed, requiredSkills: data.parsed.requiredSkills.join(", ") });
      setMessage("Prompt parsed. Review before publishing.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function publish(event) {
    event.preventDefault();
    try {
      await api("/api/shifts", {
        method: "POST",
        body: JSON.stringify({ ...form, requiredSkills: form.requiredSkills.split(",").map((skill) => skill.trim()).filter(Boolean) })
      });
      setMessage("Shift published successfully.");
      onPublished();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function accept(applicationId) {
    try {
      await api(`/api/shifts/applications/${applicationId}`, { method: "PATCH", body: JSON.stringify({ status: "accepted" }) });
      const data = await api(`/api/shifts/${selectedShiftId}/applications`);
      setApplications(data.applications);
      setMessage("Worker accepted.");
      onPublished();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="workspace" id="employer">
      <div className="panel intro employer-intro">
        <p className="eyebrow"><BriefcaseBusiness size={16} />Employer home</p>
        <h2>Do you have enough people for today?</h2>
        <div className="stats-row">
          <Stat icon={UsersRound} label="Active shifts" value={stats.active} />
          <Stat icon={CalendarClock} label="Upcoming shifts" value={stats.upcoming} />
          <Stat icon={AlarmClock} label="Open positions" value={stats.open} />
          <Stat icon={CheckCircle2} label="Completed" value={stats.completed} />
        </div>
      </div>
      <div className="dashboard-grid employer-grid">
        <form className="panel create-panel" onSubmit={publish}>
          <div className="panel-head">
            <h3>Create Shift</h3>
            <span><WandSparkles size={15} />AI parse</span>
          </div>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <button type="button" className="secondary wide" onClick={parsePrompt}>Parse Prompt</button>
          <div className="parsed form-grid compact-form">
            {["title", "category", "date", "startTime", "endTime", "duration", "paymentAmount", "location", "workersRequired", "requiredSkills"].map((key) => (
              <label key={key}><span>{key}</span><input value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>
            ))}
          </div>
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="button-row">
            <button className="primary">Publish Shift</button>
          </div>
          <button type="button" className="urgent" onClick={() => setForm({ ...form, urgency: "urgent" })}><BellRing size={18} />Need Someone Now</button>
          <Notice message={message} type={message.includes("success") || message.includes("accepted") || message.includes("parsed") ? "success" : "error"} />
        </form>
        <div className="panel">
          <div className="panel-head">
            <h3>Applicants for your shifts</h3>
            <span>Employer-owned data</span>
          </div>
          <select value={selectedShiftId} onChange={(event) => setSelectedShiftId(event.target.value)}>
            <option value="">Select a shift</option>
            {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.title} · {shift.status}</option>)}
          </select>
          {applications.length === 0 && <div className="empty-state">No workers have applied yet.</div>}
          <div className="worker-list">
            {applications.map((application) => (
              <div className="worker-card" key={application.id}>
                <div className="avatar">{initials(application.worker.name)}</div>
                <div>
                  <strong>{application.worker.name}</strong>
                  <p><Star size={15} />{application.profile?.rating || 4.8} · Reliability {application.profile?.reliabilityScore || 90}</p>
                  <small>{application.profile?.completedShifts || 0} shifts completed · {application.profile?.skills?.join(", ")}</small>
                </div>
                <b>{application.status}</b>
                <button className="icon-button" aria-label={`Accept ${application.worker.name}`} onClick={() => accept(application.id)} disabled={application.status === "accepted"}><Plus size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExecutionFlow({ user }) {
  const [mine, setMine] = useState([]);
  const [message, setMessage] = useState("");
  const accepted = mine.find((shift) => shift.applicationStatus === "accepted");

  useEffect(() => {
    if (user?.role !== "worker") return;
    api("/api/shifts/mine").then((data) => setMine(data.shifts)).catch(() => {});
  }, [user, message]);

  async function attendance(action) {
    if (!accepted) return;
    try {
      await api(`/api/attendance/${accepted.id}/${action}`, { method: "POST" });
      setMessage(action === "check-in" ? "Checked in." : "Checked out.");
    } catch (error) {
      setMessage(error.message);
    }
  }

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
          <p>{accepted ? `${accepted.time} · ${accepted.title}` : "No accepted shift yet"}</p>
          <button className="primary wide" disabled={!accepted} onClick={() => attendance("check-in")}>Check In</button>
        </div>
        <div className="panel compact active-work">
          <Gauge />
          <h3>You are working</h3>
          <p>{message || "Attendance updates are stored in MongoDB."}</p>
          <button className="secondary wide" disabled={!accepted} onClick={() => attendance("check-out")}>Check Out</button>
        </div>
        <div className="panel compact paid">
          <IndianRupee />
          <h3>Shift Completed</h3>
          <strong>{accepted ? `₹${accepted.paymentAmount}` : "₹0"}</strong>
          <p>Payment: Simulated for MVP</p>
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
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api("/api/auth/me")
      .then((data) => {
        setUser(data.user);
        setRole(data.user.role);
      })
      .catch(() => {});
  }, []);

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
        <AuthPanel role={role} setRole={setRole} user={user} onAuth={setUser} />
        {role === "worker" ? (
          <WorkerDashboard user={user} refreshKey={refreshKey} />
        ) : (
          <EmployerDashboard user={user} onPublished={() => setRefreshKey((key) => key + 1)} />
        )}
        <Availability user={user} />
        <ExecutionFlow user={user} />
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
