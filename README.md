# 🌐 FlexyWork

> **Cooperative Gig Services Platform** — *Work flex. Earn more. Grow together.*

FlexyWork is a community-driven gig marketplace that connects **local service seekers** with **verified, skilled workers** while empowering **cooperative collectives** to pool resources, share tools, and distribute work fairly. Built as a full-stack web application targeting India's informal-service economy, FlexyWork blends the flexibility of on-demand platforms (UrbanCompany, TaskRabbit) with the resilience and trust of local cooperatives.

---

## 📌 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Our Solution](#-our-solution)
3. [Key Features](#-key-features)
4. [Tech Stack](#-tech-stack)
5. [Stakeholders](#-stakeholders)
6. [UML Diagrams](#-uml-diagrams)
7. [Project Structure](#-project-structure)
8. [Getting Started](#-getting-started)
9. [Future Roadmap](#-future-roadmap)
10. [Team](#-team)

---

## ❗ Problem Statement

India's urban and semi-urban service economy is fragmented:

- **Households** struggle to find *trusted* cleaners, electricians, gardeners, and elder-care workers on short notice.
- **Skilled workers** — often operating informally — lack a steady stream of jobs, fair pricing, social protection, and professional growth.
- **Worker cooperatives** that *could* provide shared tools, training, and backup have no digital infrastructure to coordinate.
- Existing platforms (UrbanCompany, HouseJoy) extract high commissions, treat workers as replaceable, and offer no community backup.

There is a clear need for a **trust-first, community-backed, low-friction** alternative.

---

## 💡 Our Solution

FlexyWork is a **two-sided cooperative gig platform** with three pillars:

| Pillar | What it does |
|---|---|
| 🔍 **Smart Discovery** | Seekers find nearby, verified workers by skill, distance, rating, and price. |
| 🤝 **Cooperative Backbone** | Workers join local collectives that share tools, insurance, and substitute workers. |
| 💸 **Fair Earnings** | Cooperative gigs split payouts transparently, so no single worker carries the risk. |

The platform is designed around **trust, transparency, and dignity of work**.

---

## ✨ Key Features

### 👤 For Service Seekers
- 🔎 Explore workers by **category, location, rating, and price**
- 📄 Detailed **provider profiles** (skills, availability, reliability score, reviews)
- 📅 **Weekly availability viewer** — see when a worker is free before booking
- 📝 Multi-step **service request wizard** (skill → schedule → location → review)
- 📜 **Booking history** with status tracking (Requested → Accepted → In-Progress → Completed)
- 💬 Direct in-app **messaging** with workers
- 🔔 **Real-time notifications** for booking updates

### 🛠️ For Workers
- 🧑‍🔧 **Profile management** with skills, bio, hourly rate, and verification badge
- 🗓️ **Weekly availability editor** (Available / Limited / Unavailable per day)
- 📥 **Inbox of gig invitations** ranked by match score
- 📊 **Earnings dashboard** with charts (daily / weekly / monthly)
- 🏘️ **Browse & join cooperative collectives** in the worker's locality
- 🪪 **Identity verification** for the trust badge
- 💼 **Cooperative gigs** — pool work with other verified workers and split payouts

### 🏛️ For Administrators
- 📈 **Platform KPIs** — total users, active gigs, GMV, retention
- 🧑‍⚖️ **Worker verification queue** (approve/reject ID proofs)
- 👥 **User registry** with role-based filtering
- 📋 **Gig audit logs** for dispute resolution
- 🛡️ **Community oversight** — moderate cooperative collectives

### 🏘️ For Cooperative Collectives *(Network Effect)*
- 🤝 Public **community page** showcasing members, services, and ratings
- 📣 **Cooperative gig board** — multiple workers apply, payout is auto-distributed
- 🧰 **Shared resource pool** (tools, training, insurance)
- 🔁 **Replacement support** — if a worker can't show up, the collective provides backup

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router) + React 19 |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 + custom design system (brand palette, soft surfaces) |
| **Icons** | lucide-react |
| **Animations** | framer-motion |
| **Charts** | Recharts |
| **Forms** | react-hook-form + zod validation |
| **Backend** | Node.js + Express 5 |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT in HttpOnly cookies + bcrypt password hashing |
| **Dev Tools** | Vite, PostCSS, ESLint, concurrently |
