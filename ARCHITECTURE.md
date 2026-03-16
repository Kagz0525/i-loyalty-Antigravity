# i-loyalty App Architecture & Developer Guide

Welcome to the i-loyalty app! This document serves as a guide for any developer or AI agent (like Google Antigravity) picking up this project. It outlines the application's purpose, tech stack, database schema, and key architectural decisions.

## 1. App Overview
**i-loyalty** is a digital loyalty card system designed for two types of users:
*   **Vendors (e.g., Hair Salons, Car Washes):** Can manage their customers, assign loyalty points, and redeem rewards.
*   **Customers:** Can log in to view their accumulated loyalty points across different vendors.

## 2. Tech Stack
*   **Frontend Framework:** React 18 with TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Backend / Database / Auth:** Supabase (PostgreSQL, GoTrue Auth)
*   **Routing:** React Router DOM
*   **Animations:** Framer Motion

## 3. Database Schema (Supabase)
The application relies on the following core tables in Supabase:

### `profiles`
Stores extended user data for both vendors and customers.
*   `id` (uuid, primary key, references `auth.users`)
*   `email` (string)
*   `role` (string: 'vendor' | 'customer')
*   `name` (string) - Full name of the user
*   `business_name` (string, nullable) - Only applicable for vendors
*   `max_points` (integer, nullable) - The threshold for a reward (vendor specific)
*   `phone` (string, nullable)
*   `plan_type` (string, nullable) - e.g., 'Starter', 'Pro'

### `customers`
Stores customer details added by vendors.
*   `id` (uuid, primary key)
*   `name` (string)
*   `email` (string)
*   `phone` (string)
*   `joined_date` (timestamp)
*   `birthday` (string, nullable)

### `loyalty_records`
Maps the relationship between a vendor and a customer, tracking their points.
*   `id` (uuid, primary key)
*   `vendor_id` (uuid, references `profiles.id`)
*   `customer_id` (uuid, references `customers.id`)
*   `points` (integer) - Current accumulated points
*   `max_points` (integer) - Threshold to reach for a reward
*   `visits` (integer) - Total number of visits
*   `reward_code` (string, nullable)

### `point_history`
Audit log of points earned or redeemed.
*   `id` (uuid, primary key)
*   `record_id` (uuid, references `loyalty_records.id`)
*   `date` (timestamp)
*   `type` (string: 'earned' | 'redeemed')

## 4. Key Architectural Decisions & Complexities

### Authentication Flow & Race Conditions (`src/context/AuthContext.tsx`)
We use Supabase Auth (Email/Password & Google OAuth). There is a known complexity with the Google OAuth sign-up flow for Vendors:
*   **The Problem:** When a user signs up via Google, Supabase often fires a database trigger to automatically create a default `profile` record. However, our app needs to capture specific vendor details (like `business_name` and `max_points`) *before* the Google redirect, and save them to the profile *after* the redirect.
*   **The Solution:** We temporarily store the vendor's `signup_role`, `signup_businessName`, and `signup_maxPoints` in `localStorage`. In `AuthContext.tsx`, when the session is established, we use an `upsert` operation (instead of `insert`) to save the profile. If the database trigger beat us to it, we overwrite the default profile with the correct vendor details from `localStorage`. We also implemented a promise lock (`fetchProfilePromise`) to prevent concurrent profile fetches during the rapid sequence of auth state changes.

### State Management (`src/context/DataContext.tsx`)
Data is managed globally using React Context (`DataContext.tsx`). It fetches `vendors`, `customers`, `loyaltyRecords`, and `pointHistory` from Supabase and provides helper functions (`addCustomer`, `addPoint`, `redeemReward`, etc.) to mutate the data and keep the UI in sync.

### Routing & Layout (`src/App.tsx` & `src/components/Layout.tsx`)
*   The app uses a protected route pattern. Unauthenticated users are redirected to `/login`.
*   The `Layout` component provides the top navigation bar and handles the responsive sidebar/menu.
*   Depending on the user's `role` (vendor vs. customer), different dashboards are rendered (`VendorDashboard.tsx` vs `CustomerDashboard.tsx`).

## 5. Next Steps / Picking up the work
If you are an AI agent picking up this codebase:
1.  Read this `ARCHITECTURE.md` file.
2.  Review `src/context/AuthContext.tsx` to understand the auth and profile syncing logic.
3.  Review `src/context/DataContext.tsx` to understand how data is fetched and mutated.
4.  Check `src/pages/Login.tsx` for the UI implementation of the custom Google OAuth flow.

Good luck building!
