# M3 RIDE — Full-Stack Ride-Hailing Platform (Ahmedabad, Gujarat)

M3 RIDE is an integrated, production-oriented urban transit platform connecting **Riders**, **Captains**, and **City Fleet Administrators**, inspired by Rapido, Uber, and Ola, custom-built for high-density metropolitan ecosystems starting in Ahmedabad, Gujarat, India.

---

## 1. System Architecture & Connected Products

The platform is built as one unified codebase sharing persistent state, reactive dispatch broadcasting, and domain pricing:

1. **Rider Application** (`/rider/*`):
   - Map-first home screen with Sabarmati Riverfront, SG Highway, and Commerce Six Roads vector telemetry.
   - Quick one-tap destination pills for Ahmedabad landmarks (Satellite, GIFT City, Kalupur Railway Station, Law Garden Night Market).
   - Real-time vehicle tier selection: **M3 Bike Taxi** (₹25 base, ₹68 typical 8.4 km run), **M3 Auto Rickshaw** (₹40 base), and **M3 Prime Cab AC** (₹65 base).
   - Transparent fare breakdown with Zero Surge Lock, platform & road safety levy, and promotional coupons (`WELCOME_AMD`).
   - High-security 4-digit verbal PIN verification (`4 9 1 6`).
   - Live captain telemetry, helmet sanitation badges, RTO license plate verification (`GJ-01-ET-7842`), and 112 / 100 Emergency SOS command integration.

2. **Captain Application** (`/captain/*`):
   - Instant Online/Offline duty switch with live audio/visual radar.
   - Daily Net Earnings HUD (₹840.00 / 9 trips / 5.2h online) with instant UPI payouts.
   - Zero-Commission pass subscription system (Daily Pass ₹49/day, Weekly ₹299, Monthly ₹999).
   - Live Ahmedabad Demand Surge Heatmap (SG Highway 1.8x, Vastrapur 1.5x, Navrangpura High Demand).
   - High-priority incoming ride request modal with circular 15-second countdown timer.
   - End-to-end trip execution workflow: Navigate to Pickup → Mark Arrived → Enter 4-Digit Passenger PIN → Navigate to Destination → Complete Ride & Collect Payment.

3. **Admin Dashboard** (`/admin/*`):
   - Desktop-first fleet operations dashboard with role-based access control (Super Admin, Operations Manager, Verification Agent, Support Agent).
   - Overview metrics: Gross Booking Value, platform fee revenue, subscription pass revenue, active rides, online captains.
   - Live Operations Map: Ahmedabad zone filtering (SG Highway, Kalupur, Navrangpura, Vastrapur) and live fleet markers.
   - Rides Management: Filterable and searchable dispatches table with complete event audit timelines.
   - Captains & Fleet: Account suspension and reactivation controls.
   - Verification Queue: Captain KYC reviewer with document preview, approval, and mandatory rejection reason requirement.
   - Pricing & Service Areas: Authoritative fare structure configuration and live simulator.
   - Subscriptions Management: Zero-commission plan administrator.
   - Support & Safety: Passenger and captain dispute resolution workflow.

4. **Multi-Role Simulation Mode** (`/split`):
   - Dual-device emulator running Rider and Captain side-by-side to test live booking, dispatch, acceptance, and PIN verification in real time.

---

## 2. Shared Design System

The application faithfully adopts the supplied **Google Stitch** design tokens:
- **Primary Brand Color**: `#FF6B00` (Vivid Amber-Orange)
- **Deep Charcoal**: `#171717`
- **Surface**: `#FFFFFF` / `#F9F9FF`
- **Canvas Neutral**: `#F7F8FA`
- **Accent Primary**: `#A04100` / `#FFDBCC`
- **Tertiary Blue**: `#0053DB`
- **Success**: `#16803D`
- **Emergency / SOS**: `#DC2626`
- **Typography**: Inter with strict tabular numeral alignment (`tabular-nums`) and monospace OTP display.

---

## 3. Getting Started & Development

### Prerequisites
- Node.js >= 18.0.0
- npm or bun

### Installation
```bash
npm install
```

### Starting the Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### Running Automated Business Logic Tests
```bash
npm test
```
Executes 18 automated tests covering:
- Base fare, distance rates, and minimum fare lock enforcement.
- Single-captain atomic ride assignment.
- 4-digit PIN verification logic.
- Captain earnings crediting upon trip completion.
- Cancellation policy enforcement with audit logs.
- Captain subscription renewals.
- Admin KYC verification queue operations.

### Backend and PostgreSQL

The frontend is currently a self-contained simulation backed by browser storage. The production-ready API lives in `backend` and uses PostgreSQL for accounts, driver profiles, pricing, rides, and ride audit events.

```bash
cd backend
npm install
copy .env.example .env
# Set DATABASE_URL and a unique JWT_SECRET (at least 32 characters) in .env
npm run migrate
npm start
```

`npm run migrate` is idempotent and can also create the first administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The API listens on port `4000` by default; `GET /api/health` confirms both the service and database are available.

---

## 4. Environment Variables (`.env`)

Refer to `.env.example`:
```env
# GEMINI_API_KEY: Optional AI assistant and route analysis
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: Cloud Run / Hosting service URL
APP_URL="http://localhost:3000"

# GOOGLE_MAPS_API_KEY (Optional for production map tiles)
# VITE_GOOGLE_MAPS_API_KEY=""

# RAZORPAY_KEY_ID (Optional for production UPI sandbox)
# VITE_RAZORPAY_KEY_ID=""
```

---

## 5. End-to-End Demonstration Walkthrough

1. Open the top **DEV MODE** bar:
2. Select **Split View** or toggle between **Rider App** and **Captain App**.
3. In **Rider App**, tap **Request Immediate Pickup** or pick a destination (e.g., Kalupur Station).
4. Review the **Transparent Fare Breakdown** (₹68 for M3 Bike) and click **Book M3 Bike**.
5. Switch to **Captain App** (or observe on the right screen): an incoming ride notification appears with a 15-second timer.
6. Click **ACCEPT RIDE**: the Rider screen transitions to **Live Trip Tracking** showing Captain Karan Shah and PIN `4 9 1 6`.
7. In Captain mode, click **I HAVE ARRIVED AT PICKUP SPOT**.
8. Enter PIN `4 9 1 6` (or click Auto-Fill) and tap **VERIFY PIN & START RIDE**.
9. Click **COMPLETE TRIP & COLLECT ₹68**: Captain earnings increase by ₹68 with 0% platform commission deducted.
10. Switch to **Admin Dashboard**: observe the newly completed trip in **Overview**, inspect the fare audit in **Rides Management**, and review captain earnings under **Captains & Fleet**.
