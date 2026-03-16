# i-loyalty

A digital loyalty card system built with React, Vite, Tailwind CSS, and Supabase.

## Developer Guide

If you are a developer or an AI agent (like Google Antigravity) picking up this project, please read the [ARCHITECTURE.md](./ARCHITECTURE.md) file first. It contains a comprehensive overview of the application's purpose, tech stack, database schema, and key architectural decisions (including the complex Google OAuth sign-up flow).

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Set up your `.env` file with your Supabase credentials (see `.env.example`).
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Features
*   **Vendors:** Manage customers, assign loyalty points, and redeem rewards.
*   **Customers:** View accumulated loyalty points across different vendors.
*   **Authentication:** Email/Password and Google OAuth via Supabase.
*   **Responsive Design:** Mobile-first UI using Tailwind CSS.
