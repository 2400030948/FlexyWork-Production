**FlexyWork** is a two-sided gig marketplace for Gig Workers and Service Seekers/Employers. Workers discover short-term work, manage availability, apply for shifts and track attendance. Employers create shifts, define requirements, review applicants and select workers.

The platform follows an availability-first workforce model, making it suitable for temporary, urgent and short-duration work.

**Problem**

Traditional hiring platforms are optimized for permanent jobs and longer recruitment cycles. They are less effective when an employer needs someone quickly, for a specific shift, with particular skills, within a defined budget and location.

Workers also struggle to find opportunities matching their skills, availability and expectations.

**Solution
**
FlexyWork reduces this friction through a structured workflow:

Employer Creates Gig
        ↓
Requirement Analysis
        ↓
Worker Matching
        ↓
Match Score + Ranking
        ↓
Worker Recommendations
        ↓
Application
        ↓
Employer Selection
        ↓
Attendance
        ↓
Completion

**Stakeholders:**

Service Seeker

Role

Gig Worker

Profile, availability, gig discovery, applications and attendance

Employer / Service Seeker

Create gigs, define requirements, review applicants and select workers

Platform Admin

Future verification, moderation, disputes and analytics

Payment / Notification Providers

Future external integrations

**Key Features**

For Gig Workers

Role-based registration and onboarding

Worker profile and skills

Availability management

Gig discovery and filtering

Smart Match Score

Gig applications

Upcoming and completed shifts

Check-in / check-out

Earnings representation

For Employers

Employer onboarding

Create and manage gigs

Define skills, budget, schedule and location

Create urgent shifts

View applicants

Review worker rating and reliability

Accept suitable workers

**User Flow**

Worker

Signup → Worker Onboarding → Set Availability
      → Browse Gigs → View Match Score → Apply
      → Employer Accepts → Check In → Work
      → Check Out → Completed

Employer

Signup → Employer Onboarding → Create Gig
      → Define Requirements → Smart Recommendations
      → Review Applicants → Accept Worker
      → Track Shift → Completion
**
System Architecture**

The current working application uses a React + Vite frontend, Express/Node.js backend and MongoDB.

                  ┌──────────────────┐
                  │      Users       │
                  └────────┬─────────┘
                           ↓
                ┌─────────────────────┐
                │    React + Vite     │
                │      Frontend       │
                └──────────┬──────────┘
                           │ REST / JSON
                           ↓
                ┌─────────────────────┐
                │   Express / Node.js │
                │       Backend       │
                ├─────────────────────┤
                │ Authentication      │
                │ Authorization       │
                │ Shift Services      │
                │ Application Services│
                │ Attendance Services │
                │ Matching Services   │
                └──────────┬──────────┘
                           ↓
                ┌─────────────────────┐
                │       MongoDB       │
                └─────────────────────┘

The frontend communicates through a centralized API layer, while business logic remains on the server.

Smart Automation

FlexyWork currently focuses on two core automation features.

1. Intelligent Gig Matching & Score Engine

Employer Posts Gig
        ↓
Requirement Analyzer
        ↓
Skills / Experience / Budget / Time
        ↓
Matching Engine
        ↓
Score Engine
        ↓
Ranked Workers
        ↓
Employer Recommendations

The first version uses an explainable weighted score:

Skills               40%
Experience           25%
Rating / Reliability 15%
Availability         10%
Budget Compatibility 10%
                      ───
                     100%

Example: Worker A → 94%, Worker B → 88%, Worker C → 81%.

The score is explainable rather than a black box. The employer always makes the final hiring decision.

2. Automated Notifications & Workflow

Gig Created → Top Matches Identified → Workers Notified
     ↓
Worker Applies → Employer Notified → Employer Accepts
     ↓
Worker Notified → Shift Reminder → Check In
     ↓
IN_PROGRESS → Check Out → COMPLETED

This automates repetitive coordination while keeping important decisions with users.

Security

Security is enforced at the backend rather than relying only on frontend UI restrictions.

Authentication through protected sessions

Role-based authorization

Resource ownership checks

Server-side input validation

Secure password hashing in production

Environment variables for secrets

Protected database credentials

401 Unauthorized handling

Duplicate application protection through database constraints

Rate limiting and abuse protection for production

Security model:

Authentication + Role Authorization
              +
       Resource Ownership
              +
      Business Validation

Scalability

The MVP intentionally uses a simple architecture. As traffic grows, the backend can scale horizontally:

                    Load Balancer
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
          API #1       API #2       API #3
             │           │           │
             └───────────┼───────────┘
                         ↓
                      MongoDB

**Future improvements:
**
Redis caching

Database indexing and optimization

Background workers

Message queues for matching and notifications

CDN/static hosting

Horizontal API scaling

WebSockets/SSE for real-time updates

Monitoring and centralized logging

The matching and notification services are designed so they can later run asynchronously.

**Feasibility**

Technical: React, Node.js, Express and MongoDB provide a mature, low-complexity MVP stack.

Operational: The model fits events, retail, hospitality, local businesses and other short-term workforce needs.

Economic: The platform can start with a small infrastructure footprint and scale with usage. Future revenue can include employer subscriptions, platform commission and premium urgent matching.
**
Technology Stack
**
Layer

Technology

Frontend

React, Vite, JavaScript, CSS

Backend

Node.js, Express

Database

MongoDB

API

REST / JSON

Authentication

Session/Cookie-based flow

UI

Lucide React

Version Control

Git

UML Diagrams

Use Case Diagram

flowchart LR
    Worker([Gig Worker])
    Employer([Employer])
    Admin([Admin])
    System((FlexyWork))
    Worker -->|Register / Login| System
    Worker -->|Set Availability| System
    Worker -->|Browse Gigs| System
    Worker -->|Apply| System
    Worker -->|Check In / Out| System
    Employer -->|Register / Login| System
    Employer -->|Create Gig| System
    Employer -->|View Applicants| System
    Employer -->|Review Matches| System
    Employer -->|Accept Worker| System
    Admin -->|Verify / Moderate| System

Domain Model

classDiagram
    class User {
        id
        name
        email
        role
    }
    class WorkerProfile {
        skills
        rating
        reliability
        availability
    }
    class EmployerProfile {
        businessName
        location
    }
    class Gig {
        title
        skills
        date
        startTime
        endTime
        budget
        location
        status
    }
    class Application {
        status
        matchScore
        createdAt
    }
    class Attendance {
        checkIn
        checkOut
        status
    }
    User "1" --> "0..1" WorkerProfile
    User "1" --> "0..1" EmployerProfile
    EmployerProfile "1" --> "*" Gig
    WorkerProfile "1" --> "*" Application
    Gig "1" --> "*" Application
    Application "1" --> "0..1" Attendance

Smart Matching Flow

flowchart TD
    A[Employer Creates Gig] --> B[Requirement Analyzer]
    B --> C[Eligible Worker Filtering]
    C --> D[Score Engine]
    D --> E[Rank Workers]
    E --> F[Top Matches]
    F --> G[Employer Recommendations]
    G --> H[Employer Makes Final Decision]

Scalable Deployment

flowchart TB
    U[Users] --> CDN[CDN / Static Hosting]
    CDN --> LB[Load Balancer]
    LB --> API1[Express API]
    LB --> API2[Express API]
    LB --> API3[Express API]
    API1 --> DB[(MongoDB)]
    API2 --> DB
    API3 --> DB
    API1 -.-> Q[Future Message Queue]
    API2 -.-> Q
    API3 -.-> Q
    Q -.-> W[Background Workers]

**Project Structure**

FlexyWork/
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── auth.jsx
│   │   └── styles.css
│   └── package.json
├── backend/
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── server.js
├── package.json
└── README.md

The repository also contains a parallel Next.js prototype. The production direction should use one canonical frontend to avoid duplicated application logic.

**Deployment**

Stack: Next.js 15 (frontend) + Express 5 (API) + MongoDB Atlas.

### Docker (recommended)

```bash
cp .env.example .env          # fill in MongoDB, JWT, SMTP, Razorpay, Google OAuth
npm run docker:build          # or: docker compose build
npm run docker:up             # or: docker compose up
```

App runs at `http://localhost:3000`. Express API runs internally on port 4000; Next.js proxies `/api/*` to it.

**Required `.env` values for production:**
- `MONGODB_URI`, `JWT_SECRET` (32+ chars), `CLIENT_ORIGIN`
- `SMTP_USER`, `SMTP_PASS`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

`NEXT_PUBLIC_GOOGLE_CLIENT_ID` is baked in at image build time. Rebuild after changing it:
`docker compose build --no-cache`

### Without Docker

```bash
npm install --legacy-peer-deps
npm run build
NODE_ENV=production npm start
```

**Future Scope**

AI-assisted requirement extraction

ML-based recommendations after sufficient historical data

Real-time notifications

Email/SMS/push integration

Online payments and escrow

Identity verification

Fraud and no-show detection

Worker reputation system

Admin dashboard and analytics

Redis + message queues for large-scale workloads

Core Value Proposition

FlexyWork does not automate the human hiring decision. It automates the friction around finding, matching, notifying and managing gig workers.

FIND → MATCH → NOTIFY → APPLY → SELECT → ATTEND → COMPLETE
