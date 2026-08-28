import React, { useState } from "react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogOut,
  MapPin,
  Sparkles,
  UserRoundCheck,
  UsersRound
} from "lucide-react";

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const SKILL_OPTIONS = [
  "Customer handling",
  "Table service",
  "Billing support",
  "Wiring & Repairs",
  "AC Servicing",
  "Deep Cleaning",
  "Cooking",
  "Delivery",
  "Inventory",
  "Coordination",
  "Event setup"
];

const CATEGORY_OPTIONS = [
  "Cafe",
  "Retail",
  "Events",
  "Cleaning",
  "Electrician",
  "Plumbing",
  "Delivery",
  "Cooking"
];

const DEFAULT_AVAILABILITY = [
  { day: "Mon", status: "Available", ranges: ["6 PM - 10 PM"] },
  { day: "Tue", status: "Available", ranges: ["6 PM - 10 PM"] },
  { day: "Wed", status: "Unavailable", ranges: [] },
  { day: "Thu", status: "Available", ranges: ["5 PM - 9 PM"] },
  { day: "Fri", status: "Available", ranges: ["6 PM - 11 PM"] },
  { day: "Sat", status: "Available", ranges: ["10 AM - 8 PM"] },
  { day: "Sun", status: "Limited", ranges: ["11 AM - 3 PM"] }
];

function requestGeolocation() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }),
      (error) => {
        // Map the raw PositionError codes to friendly messages so the
        // user understands why their location was not read.
        const friendly =
          error.code === 1
            ? "Location permission was denied. You can type the coordinates manually below."
            : error.code === 2
              ? "Your location is currently unavailable. Try again or enter coordinates manually."
            : error.code === 3
              ? "Location request timed out. Try again or enter coordinates manually."
              : error.message || "Failed to read location";
        reject(new Error(friendly));
      }
    );
  });
}

function StepProgress({ current, steps }) {
  return (
    <div className="step-progress">
      {steps.map((label, index) => {
        const status = index < current ? "done" : index === current ? "active" : "upcoming";
        return (
          <div key={label} className={`step ${status}`}>
            <span className="step-dot">{index + 1}</span>
            <small>{label}</small>
          </div>
        );
      })}
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}

function Notice({ message, type = "success" }) {
  if (!message) return null;
  return <div className={`notice ${type}`}>{message}</div>;
}

function validateSignup(form) {
  const errors = {};
  if (!form.fullName || form.fullName.trim().length < 2) errors.fullName = "Full name is required";
  if (!/^\+?\d{10,15}$/.test(form.phone || "")) errors.phone = "Enter a 10 digit phone number";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "")) errors.email = "Enter a valid email";
  if ((form.password || "").length < 8) errors.password = "Use at least 8 characters";
  if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
  return errors;
}

export function Landing({ onSignup, onLogin }) {
  return (
    <section className="hero" id="home">
      <img src="/flexywork-hero.png" alt="Local worker accepting a flexible shift at a neighborhood cafe" />
      <div className="hero-overlay" />
      <nav className="nav">
        <a className="brand" href="#home"><BriefcaseBusiness size={22} />FlexyWork</a>
        <div>
          <a href="#trust">Trust</a>
          <button type="button" className="link-button" onClick={onLogin}>Sign in</button>
          <button type="button" className="link-button primary-link" onClick={() => onSignup()}>Get started</button>
        </div>
      </nav>
      <div className="hero-content">
        <p className="eyebrow"><Sparkles size={16} />Local gig matching, powered by real accounts</p>
        <h1>Work when you want. Hire when you need.</h1>
        <p>FlexyWork connects local businesses with reliable workers for hourly, daily, recurring, and on-demand shifts — all backed by secure accounts, verified identities, and saved locations.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => onSignup("gig_worker")}>I'm a gig worker <ChevronRight size={18} /></button>
          <button className="secondary" onClick={() => onSignup("service_seeker")}>I want to hire</button>
        </div>
      </div>
      <div className="match-float">
        <div>
          <strong>Live MongoDB shifts</strong>
          <span>Auth, profile, verification</span>
        </div>
        <b>API</b>
      </div>
    </section>
  );
}

export function LoginScreen({ onBack, onSignup, onAuth }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      onAuth(data.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section onboarding">
      <div className="section-title">
        <p className="eyebrow"><UserRoundCheck size={16} />Welcome back</p>
        <h2>Sign in</h2>
      </div>
      <button type="button" className="link-button back-button" onClick={onBack}>
        <ChevronLeft size={16} /> Back
      </button>
      <form className="panel form-grid" onSubmit={submit}>
        <label><span>Email</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></label>
        <label><span>Password</span><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" required /></label>
        <button type="submit" className="primary wide" disabled={busy}>{busy ? <><Loader2 size={18} className="spin" /> Signing in…</> : "Sign in"}</button>
        <Notice message={message} type="error" />
        <p className="muted small">
          Don't have an account? <button type="button" className="link-button" onClick={onSignup}>Sign up</button>
        </p>
      </form>
    </section>
  );
}

export function SignupScreen({ initialRole, onBack, onLogin, onAuth }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(initialRole || "");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function nextFromRole() {
    if (!role) {
      setMessage("Please choose how you want to use FlexyWork.");
      return;
    }
    setMessage("");
    setStep(2);
  }

  function back() {
    setMessage("");
    if (step === 1) return onBack();
    setStep((current) => Math.max(1, current - 1));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    const validation = validateSignup(form);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    try {
      const data = await api("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ ...form, role })
      });
      onAuth(data.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section onboarding">
      <div className="section-title">
        <p className="eyebrow"><UserRoundCheck size={16} />Create your account</p>
        <h2>Sign up</h2>
      </div>
      <button type="button" className="link-button back-button" onClick={back}>
        <ChevronLeft size={16} /> Back
      </button>
      <StepProgress current={step - 1} steps={["Role", "Account details"]} />
      {step === 1 && (
        <div className="panel form-grid">
          <h3>How do you want to use FlexyWork?</h3>
          <p className="muted">Pick one. You can change this later by contacting support.</p>
          <div className="choice-grid">
            <button
              type="button"
              className={`choice ${role === "gig_worker" ? "active" : ""}`}
              onClick={() => setRole("gig_worker")}
            >
              <BriefcaseBusiness />
              <strong>I'm a gig worker</strong>
              <span>Find flexible local shifts, manage your availability, and get paid for your work.</span>
            </button>
            <button
              type="button"
              className={`choice ${role === "service_seeker" ? "active" : ""}`}
              onClick={() => setRole("service_seeker")}
            >
              <UsersRound />
              <strong>I'm a service seeker</strong>
              <span>Post shifts, review applicants, and hire reliable workers for your business.</span>
            </button>
          </div>
          <button type="button" className="primary wide" onClick={nextFromRole}>Continue</button>
          <Notice message={message} type="error" />
          <p className="muted small">
            Already have an account? <button type="button" className="link-button" onClick={onLogin}>Sign in</button>
          </p>
        </div>
      )}
      {step === 2 && (
        <form className="panel form-grid" onSubmit={submit}>
          <h3>Account details</h3>
          <p className="muted">You're signing up as <strong>{role === "gig_worker" ? "a gig worker" : "a service seeker"}</strong>.</p>
          <label><span>Full name</span><input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} autoComplete="name" required /></label>
          <FieldError message={errors.fullName} />
          <label><span>Email</span><input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} autoComplete="email" required /></label>
          <FieldError message={errors.email} />
          <label><span>Phone</span><input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="10–15 digit phone" autoComplete="tel" required /></label>
          <FieldError message={errors.phone} />
          <label><span>Password</span><input type="password" value={form.password} onChange={(event) => setField("password", event.target.value)} autoComplete="new-password" required /></label>
          <FieldError message={errors.password} />
          <label><span>Confirm password</span><input type="password" value={form.confirmPassword} onChange={(event) => setField("confirmPassword", event.target.value)} autoComplete="new-password" required /></label>
          <FieldError message={errors.confirmPassword} />
          <button type="submit" className="primary wide" disabled={busy}>{busy ? <><Loader2 size={18} className="spin" /> Creating account…</> : "Create account"}</button>
          <Notice message={message} type="error" />
        </form>
      )}
    </section>
  );
}

export function WorkerOnboarding({ user, profile, onComplete, onLogout }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    dateOfBirth: profile?.dateOfBirth?.slice(0, 10) || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    skills: profile?.skills || [],
    categories: profile?.categories || [],
    experience: profile?.experience || "",
    bio: profile?.bio || "",
    expectedHourlyWage: profile?.expectedHourlyWage || 0,
    location: profile?.location || "",
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null
  });
  const [aadhaar, setAadhaar] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [verification, setVerification] = useState(null);

  const steps = ["Personal", "Skills & experience", "Location", "Identity (Aadhaar)", "Done"];

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleArrayValue(name, value) {
    setForm((current) => {
      const exists = current[name].includes(value);
      return { ...current, [name]: exists ? current[name].filter((item) => item !== value) : [...current[name], value] };
    });
  }

  async function useCurrentLocation() {
    setMessage("");
    try {
      const coords = await requestGeolocation();
      setField("latitude", coords.latitude);
      setField("longitude", coords.longitude);
      if (!form.location) {
        setField("location", `Lat ${coords.latitude.toFixed(4)}, Lng ${coords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  function validateLocationStep() {
    if (!form.location || form.location.trim().length < 2) return "Enter your location description";
    if (form.latitude === null || form.longitude === null) return "Provide latitude and longitude (use the location button or enter manually)";
    if (form.latitude < -90 || form.latitude > 90) return "Latitude must be between -90 and 90";
    if (form.longitude < -180 || form.longitude > 180) return "Longitude must be between -180 and 180";
    return null;
  }

  async function saveProfile() {
    setBusy(true);
    setMessage("");
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address,
        city: form.city,
        state: form.state,
        skills: form.skills,
        categories: form.categories,
        experience: form.experience,
        bio: form.bio,
        expectedHourlyWage: Number(form.expectedHourlyWage) || 0,
        location: form.location,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        availability: profile?.availability || DEFAULT_AVAILABILITY
      };
      const data = await api("/api/auth/workers/me/profile", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      onComplete({ user: data.user, profile: data.profile });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitAadhaar() {
    if (!/^\d{12}$/.test(aadhaar)) {
      setMessage("Aadhaar must be a 12-digit number");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const data = await api("/api/auth/workers/me/verification", {
        method: "POST",
        body: JSON.stringify({ aadhaarNumber: aadhaar })
      });
      setVerification(data.verification);
      onComplete({ user: data.user });
      setStep(5);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function goNext() {
    setMessage("");
    if (step === 3) {
      const locationError = validateLocationStep();
      if (locationError) {
        setMessage(locationError);
        return;
      }
      saveProfile().then(() => setStep(4));
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length));
  }

  return (
    <section className="section onboarding">
      <div className="section-title">
        <p className="eyebrow"><UserRoundCheck size={16} />Worker onboarding</p>
        <h2>Complete your worker profile</h2>
      </div>
      <button type="button" className="link-button back-button" onClick={onLogout}>
        <LogOut size={16} /> Sign out
      </button>
      <StepProgress current={step - 1} steps={steps} />
      {step === 1 && (
        <div className="panel form-grid">
          <h3>Personal details</h3>
          <label><span>Full name</span><input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} required /></label>
          <label><span>Phone</span><input value={form.phone} onChange={(event) => setField("phone", event.target.value)} required /></label>
          <label><span>Date of birth</span><input type="date" value={form.dateOfBirth} onChange={(event) => setField("dateOfBirth", event.target.value)} /></label>
          <label><span>Address</span><input value={form.address} onChange={(event) => setField("address", event.target.value)} placeholder="Street, area" /></label>
          <div className="two-col">
            <label><span>City</span><input value={form.city} onChange={(event) => setField("city", event.target.value)} /></label>
            <label><span>State</span><input value={form.state} onChange={(event) => setField("state", event.target.value)} /></label>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="panel form-grid">
          <h3>Skills & experience</h3>
          <label><span>Skills (pick all that apply)</span></label>
          <div className="chip-row">
            {SKILL_OPTIONS.map((skill) => (
              <button
                type="button"
                key={skill}
                className={`chip ${form.skills.includes(skill) ? "active" : ""}`}
                onClick={() => toggleArrayValue("skills", skill)}
              >
                {skill}
              </button>
            ))}
          </div>
          <label><span>Service categories</span></label>
          <div className="chip-row">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                type="button"
                key={category}
                className={`chip ${form.categories.includes(category) ? "active" : ""}`}
                onClick={() => toggleArrayValue("categories", category)}
              >
                {category}
              </button>
            ))}
          </div>
          <label><span>Experience</span><input value={form.experience} onChange={(event) => setField("experience", event.target.value)} placeholder="e.g. 2 years in cafe service" /></label>
          <label><span>Short bio</span><textarea value={form.bio} onChange={(event) => setField("bio", event.target.value)} maxLength={400} rows={3} /></label>
          <label><span>Expected hourly wage (₹)</span><input type="number" min="0" value={form.expectedHourlyWage} onChange={(event) => setField("expectedHourlyWage", event.target.value)} /></label>
        </div>
      )}
      {step === 3 && (
        <div className="panel form-grid">
          <h3>Where do you work?</h3>
          <p className="muted">This helps us match you to nearby shifts. You can change it later.</p>
          <label><span>Location description</span><input value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder="e.g. Indiranagar, Bengaluru" /></label>
          <div className="two-col">
            <label><span>Latitude</span><input type="number" step="0.000001" value={form.latitude ?? ""} onChange={(event) => setField("latitude", event.target.value === "" ? null : Number(event.target.value))} /></label>
            <label><span>Longitude</span><input type="number" step="0.000001" value={form.longitude ?? ""} onChange={(event) => setField("longitude", event.target.value === "" ? null : Number(event.target.value))} /></label>
          </div>
          <button type="button" className="secondary" onClick={useCurrentLocation}>
            <MapPin size={16} /> Use my current location
          </button>
          <p className="muted small">Your browser will ask for permission. We never read your location without your consent.</p>
        </div>
      )}
      {step === 4 && (
        <div className="panel form-grid">
          <h3>Identity verification (Aadhaar)</h3>
          <p className="muted">This is a demo identity check. We store only the last 4 digits of your Aadhaar number; the rest is hashed and never returned in API responses. A platform admin reviews the submission manually.</p>
          {verification ? (
            <div>
              <p>Submitted. Status: <strong>{verification.status}</strong></p>
              <p className="muted small">Aadhaar ending •••• {verification.last4}</p>
            </div>
          ) : (
            <label><span>12-digit Aadhaar number</span><input value={aadhaar} onChange={(event) => setAadhaar(event.target.value.replace(/[^0-9]/g, "").slice(0, 12))} inputMode="numeric" maxLength={12} /></label>
          )}
        </div>
      )}
      {step === 5 && (
        <div className="panel form-grid">
          <h3>You're all set</h3>
          <p className="muted">Your profile is saved. Verification status: <strong>{user?.verificationStatus}</strong>.</p>
          <p>You can update your profile, skills, and availability any time from the dashboard.</p>
        </div>
      )}
      <Notice message={message} type="error" />
      <div className="button-row">
        {step > 1 && step < 5 && <button type="button" className="secondary" onClick={() => setStep((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /> Back</button>}
        {step < 4 && <button type="button" className="primary" onClick={goNext} disabled={busy}>Continue <ChevronRight size={16} /></button>}
        {step === 4 && !verification && <button type="button" className="primary" onClick={submitAadhaar} disabled={busy}>{busy ? <><Loader2 size={18} className="spin" /> Submitting…</> : "Submit for verification"}</button>}
        {step === 4 && verification && <button type="button" className="primary" onClick={() => setStep(5)}>Continue <ChevronRight size={16} /></button>}
        {step === 5 && <button type="button" className="primary" onClick={onComplete}>Go to dashboard <ChevronRight size={16} /></button>}
      </div>
    </section>
  );
}

export function SeekerOnboarding({ user, profile, onComplete, onLogout }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    businessName: profile?.businessName || "",
    businessType: profile?.businessType || "Local business",
    description: profile?.description || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    latitude: profile?.latitude ?? null,
    longitude: profile?.longitude ?? null
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const steps = ["Business", "Shop location", "Done"];

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function useCurrentLocation() {
    setMessage("");
    try {
      const coords = await requestGeolocation();
      setField("latitude", coords.latitude);
      setField("longitude", coords.longitude);
    } catch (error) {
      setMessage(error.message);
    }
  }

  function validateLocationStep() {
    if (!form.address || form.address.trim().length < 2) return "Enter the shop/place address";
    if (form.latitude === null || form.longitude === null) return "Provide latitude and longitude (use the location button or enter manually)";
    if (form.latitude < -90 || form.latitude > 90) return "Latitude must be between -90 and 90";
    if (form.longitude < -180 || form.longitude > 180) return "Longitude must be between -180 and 180";
    return null;
  }

  function validateBusinessStep() {
    if (!form.fullName || form.fullName.trim().length < 2) return "Your full name is required";
    if (!/^\+?\d{10,15}$/.test(form.phone || "")) return "Enter a 10–15 digit phone number";
    if (!form.businessName || form.businessName.trim().length < 2) return "Business / shop name is required";
    return null;
  }

  async function saveProfile() {
    setBusy(true);
    setMessage("");
    try {
      const data = await api("/api/auth/seekers/me/profile", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          businessName: form.businessName,
          businessType: form.businessType,
          description: form.description,
          address: form.address,
          city: form.city,
          state: form.state,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude)
        })
      });
      onComplete({ user: data.user, profile: data.profile });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  function goNext() {
    setMessage("");
    if (step === 1) {
      const businessError = validateBusinessStep();
      if (businessError) {
        setMessage(businessError);
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const locationError = validateLocationStep();
      if (locationError) {
        setMessage(locationError);
        return;
      }
      saveProfile().then(() => setStep(3));
      return;
    }
    // step 3 has its own "Go to dashboard" button that calls onComplete
    // directly, so this branch is only hit if goNext is somehow called
    // at the final step.
    setStep((current) => Math.min(current + 1, steps.length));
  }

  return (
    <section className="section onboarding">
      <div className="section-title">
        <p className="eyebrow"><UserRoundCheck size={16} />Service seeker onboarding</p>
        <h2>Set up your business</h2>
      </div>
      <button type="button" className="link-button back-button" onClick={onLogout}>
        <LogOut size={16} /> Sign out
      </button>
      <StepProgress current={step - 1} steps={steps} />
      {step === 1 && (
        <div className="panel form-grid">
          <h3>About your business</h3>
          <label><span>Your full name</span><input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} required /></label>
          <label><span>Phone</span><input value={form.phone} onChange={(event) => setField("phone", event.target.value)} required /></label>
          <label><span>Business / shop name</span><input value={form.businessName} onChange={(event) => setField("businessName", event.target.value)} required /></label>
          <label><span>Business type</span><input value={form.businessType} onChange={(event) => setField("businessType", event.target.value)} placeholder="Cafe, retail, events…" /></label>
          <label><span>Description</span><textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows={3} maxLength={400} /></label>
        </div>
      )}
      {step === 2 && (
        <div className="panel form-grid">
          <h3>Where is your shop/place located?</h3>
          <p className="muted">Workers use this to find shifts near them. You can update it later.</p>
          <label><span>Address</span><input value={form.address} onChange={(event) => setField("address", event.target.value)} placeholder="Street, area" required /></label>
          <div className="two-col">
            <label><span>City</span><input value={form.city} onChange={(event) => setField("city", event.target.value)} /></label>
            <label><span>State</span><input value={form.state} onChange={(event) => setField("state", event.target.value)} /></label>
          </div>
          <div className="two-col">
            <label><span>Latitude</span><input type="number" step="0.000001" value={form.latitude ?? ""} onChange={(event) => setField("latitude", event.target.value === "" ? null : Number(event.target.value))} /></label>
            <label><span>Longitude</span><input type="number" step="0.000001" value={form.longitude ?? ""} onChange={(event) => setField("longitude", event.target.value === "" ? null : Number(event.target.value))} /></label>
          </div>
          <button type="button" className="secondary" onClick={useCurrentLocation}>
            <MapPin size={16} /> Use my current location
          </button>
          <p className="muted small">Your browser will ask for permission. Coordinates are stored server-side and never re-asked unless you edit your profile.</p>
        </div>
      )}
      {step === 3 && (
        <div className="panel form-grid">
          <h3>You're all set</h3>
          <p className="muted">Your business profile is saved. You can now publish shifts and review applicants.</p>
        </div>
      )}
      <Notice message={message} type="error" />
      <div className="button-row">
        {step > 1 && step < 3 && <button type="button" className="secondary" onClick={() => setStep((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /> Back</button>}
        {step < 3 && <button type="button" className="primary" onClick={goNext} disabled={busy}>Continue <ChevronRight size={16} /></button>}
        {step === 3 && <button type="button" className="primary" onClick={onComplete}>Go to dashboard <ChevronRight size={16} /></button>}
      </div>
    </section>
  );
}

