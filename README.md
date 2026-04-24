Here is a fully detailed, production-ready `README.md` for your KrewOS Frontend repository. You can copy and paste this directly into your project.

```markdown
# 🏗️ KrewOS Frontend

Welcome to the frontend repository for **KrewOS**, the ultimate all-in-one operating system for modern construction teams. This application provides tailored experiences for field workers, project managers, company owners, and platform super-admins, all within a blazing-fast, strictly-typed Next.js architecture.

---

## 🚀 Tech Stack

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v3/v4](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) + [Radix Primitives](https://www.radix-ui.com/)
- **State Management & Data Fetching:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Animations:** [GSAP](https://gsap.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)

---

## 🌟 Key Features by Role

### 🌍 Public & Marketing
- **Auth-Aware Landing Page:** Dynamic routing that detects active sessions and smoothly transitions CTAs to Dashboard shortcuts.
- **GSAP 3D Hero Section:** Interactive, animated 3D card stacks representing core platform features (Timesheets, Incidents, Projects).
- **Pricing & Plans:** Real-time fetching of platform pricing directly from the Super Admin database configurations.

### 👑 Super Admin (Platform Owner)
- **Global Settings:** Dynamically update SaaS pricing tiers (Free, Pro, Enterprise) and system limits (Max Projects/Members) directly from the UI.
- **Global Transaction Log:** Platform-wide view of all successful Stripe payments and subscription renewals.
- **Workspace Directory:** Manage all registered companies, including 1-click suspension and reactivation.

### 🏢 Admin & Company Owner
- **Automated Timesheets & Payroll:** Aggregates worker clock-ins over selected date ranges and calculates estimated payroll using dynamic hourly rates, with 1-click CSV exports.
- **Subscription Management:** Stripe-integrated checkout portals for upgrading, downgrading, or safely canceling plans at the end of the billing period.
- **Team & Project Management:** Invite new workers via secure tokens and assign them to active construction sites.

### 👷 Member (Field Worker)
- **Incident Reporting:** Submit real-time safety hazard reports directly from the field, utilizing `FormData` for multi-image uploads (via Multer).
- **Project Tracking:** View assigned projects and daily responsibilities.

---

## 📁 Architecture & Folder Structure

This project heavily utilizes Next.js **Route Groups** `(...)` to cleanly separate layouts without affecting the URL structure.

```text
src/
├── app/
│   ├── (auth)/                 # Route Group: Authentication
│   │   ├── layout.tsx          # Clean layout with shared KrewOS logo
│   │   ├── login/page.tsx      # Sign in
│   │   ├── register/page.tsx   # Workspace creation
│   │   └── join/page.tsx       # Accept employee invite token
│   │
│   ├── (dashboardLayout)/      # Route Group: Authenticated App
│   │   ├── layout.tsx          # Includes DashboardSidebar & DashboardNavbar
│   │   ├── admin/              # Company Owner & Admin routes (Timesheets, Billing)
│   │   ├── member/             # Field worker routes (Incident Reporting)
│   │   └── super-admin/        # Platform owner routes (Global Settings)
│   │
│   ├── (public)/               # Route Group: Marketing Website
│   │   ├── layout.tsx          # Public Navbar and Footer
│   │   ├── page.tsx            # GSAP-powered Landing Page
│   │   ├── pricing/page.tsx    # Pricing Plans
│   │   └── about/page.tsx      # About Us
│   │
│   └── globals.css             # Shadcn CSS variables and Tailwind directives
│
├── components/
│   ├── public/                 # Extracted Landing Page sections (Hero, CTA, Features)
│   ├── shared/                 # Reusable global elements (Logo, Loaders)
│   └── ui/                     # Shadcn components + GSAP CardSwap
│
├── lib/
│   ├── httpClient.ts           # Axios instance with Interceptors (Injects JWT)
│   ├── navItems.ts             # Dynamic sidebar links based on User Role
│   └── utils.ts                # Tailwind merge (cn) utilities
│
└── services/                   # React Query fetcher functions
    ├── auth.services.ts
    ├── billing.services.ts
    ├── attendance.services.ts
    └── incident.services.ts
```

---

## ⚙️ Theming & Styling

KrewOS uses **CSS Variables** via Shadcn UI for seamless Light/Dark mode switching.

* **Colors:** All theme tokens (e.g., `--primary`, `--background`, `--muted`) are located in `src/app/globals.css`.
* **Format:** We use modern `oklch()` color formats for vibrant, consistent rendering across different color gamuts.
* **Dark Mode:** Handled automatically by overriding tokens inside the `.dark` selector.

---

## 🔧 Setup & Installation

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm, yarn, or pnpm

### 2. Clone and Install
```bash
git clone <repository-url>
cd krewos-frontend
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory. This tells the frontend where your Node.js backend is running.

```env
# Point this to your backend API route
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Used for Stripe redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Integration Strategy

This project uses **Axios** combined with **TanStack React Query**.

1.  **Axios Interceptors (`src/lib/httpClient.ts`):** Automatically intercepts every outgoing request and attaches the `accessToken` from `localStorage` to the `Authorization` header. It also handles global 401 Unauthorized errors by clearing local storage and kicking the user back to `/login`.
2.  **React Query (`useQuery` / `useMutation`):** Handles all caching, loading states (`isLoading`), background refetching, and pagination state. 

### Example API Flow:
```typescript
// 1. Service Definition (services/billing.services.ts)
export const BillingService = {
  getPlans: async () => await httpClient.get("/billing/plans"),
};

// 2. Component Usage
const { data, isLoading } = useQuery({
  queryKey: ["global-plans"],
  queryFn: BillingService.getPlans,
});
```

---

## 📜 Available Scripts

- `npm run dev` - Starts the development server with Turbopack.
- `npm run build` - Compiles and optimizes the application for production deployment.
- `npm run start` - Starts the production server (must run build first).
- `npm run lint` - Runs ESLint to check for code quality and formatting issues.

---
© KrewOS Inc. All rights reserved.
```