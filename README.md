# 🌐 FlexyWork

> **Cooperative Gig Services Platform** — *Work flex. Earn more. Grow together.*

FlexyWork is a community-driven gig marketplace that connects **local service seekers** with **verified, skilled workers** while empowering **cooperative collectives** to pool resources, share tools, and distribute work fairly. Built as a full-stack web application targeting India's informal-service economy, FlexyWork blends the flexibility of on-demand platforms (UrbanCompany, TaskRabbit) with the resilience and trust of local cooperatives.

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

FLEXYWORK bridges this gap.

        STUDENTS
            │
            │ Skills
            ▼
      ┌─────────────┐
      │  FLEXYWORK  │
      └─────────────┘
            ▲
            │ Opportunities
            │
        CLIENTS

---

🗄️ ER Diagram
erDiagram

    USER ||--o{ GIG : creates
    USER ||--o{ APPLICATION : submits
    GIG ||--o{ APPLICATION : receives

    APPLICATION ||--|| CONTRACT : creates

    USER ||--o{ CONTRACT : student
    USER ||--o{ CONTRACT : client

    CONTRACT ||--o{ SUBMISSION : contains
    CONTRACT ||--|| PAYMENT : generates

    CONTRACT ||--o{ REVIEW : receives

    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ MESSAGE : sends

    USER {
        UUID id PK
        string name
        string email
        string password
        string role
    }

    GIG {
        UUID id PK
        UUID client_id FK
        string title
        string description
        string category
        decimal budget
        date deadline
        string status
    }

    APPLICATION {
        UUID id PK
        UUID gig_id FK
        UUID student_id FK
        string proposal
        decimal proposed_price
        string status
    }

    CONTRACT {
        UUID id PK
        UUID gig_id FK
        UUID student_id FK
        UUID client_id FK
        decimal amount
        string status
    }

    SUBMISSION {
        UUID id PK
        UUID contract_id FK
        string file_url
        string description
        string status
    }

    PAYMENT {
        UUID id PK
        UUID contract_id FK
        decimal amount
        string payment_method
        string status
    }

    REVIEW {
        UUID id PK
        UUID contract_id FK
        UUID reviewer_id FK
        UUID reviewee_id FK
        integer rating
        string comment
    }

    NOTIFICATION {
        UUID id PK
        UUID user_id FK
        string message
        boolean is_read
    }

    MESSAGE {
        UUID id PK
        UUID sender_id FK
        UUID receiver_id FK
        string message
        datetime timestamp
    }
    

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
