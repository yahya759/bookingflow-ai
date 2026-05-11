## Overview

Build a premium SaaS platform for salon/clinic booking automation — a no-code booking flow builder. Business owners sign up, configure services/staff/hours, customize a booking flow, and share a public booking link. Customers book via a chat-style assistant UI.

The landing page will be in **Arabic (RTL)**, while the dashboard remains in English (can be localized later).

## Tech & Backend

- TanStack Start + React 19 + TypeScript + Tailwind v4 (template default — Next.js is not supported here, but the architecture matches).
- **Lovable Cloud** (Supabase under the hood) for auth, Postgres, RLS.
- shadcn/ui components, lucide-react icons, sonner for toasts.

## Database Schema (Lovable Cloud)

- `profiles` — user profile (id → auth.users, full_name, created_at)
- `businesses` — owner_id, name, slug (unique, public URL), description, welcome_message, confirmation_message, allow_staff_selection (bool), instant_confirmation (bool)
- `services` — business_id, name, price, duration_minutes, description
- `staff` — business_id, name, image_url, bio
- `staff_services` — many-to-many (staff_id, service_id)
- `working_hours` — business_id OR staff_id, day_of_week (0–6), open_time, close_time, break_start, break_end, is_closed
- `flow_steps` — business_id, step_key (welcome/service/staff/date/time/confirm), position, enabled, custom_label
- `bookings` — business_id, service_id, staff_id, customer_name, customer_phone, booking_date, start_time, end_time, status (pending/confirmed/completed/cancelled), notes

RLS: owners can only access their own business rows; public booking page reads via security-definer functions exposing only what the slug needs; bookings can be inserted by anyone for a given business slug (with server-side double-booking check).

## Routes

```text
/                              Arabic landing page (RTL)
/login, /signup                Auth pages
/booking/$slug                 Public chat-style booking assistant
/_authenticated/dashboard      Overview + analytics cards
/_authenticated/services       CRUD services
/_authenticated/staff          CRUD staff + assign services
/_authenticated/hours          Working hours editor
/_authenticated/flow           Visual flow builder (reorder/toggle steps)
/_authenticated/settings       Business + booking settings, copy public link
/_authenticated/bookings       Upcoming / Completed / Cancelled tabs + calendar
```

Auth gate via `_authenticated` layout route (`beforeLoad` redirect to `/login`).

## Key Features

1. **Auth** — Email/password via Lovable Cloud. On signup, trigger creates `profiles` + a default `businesses` row with auto-generated slug.
2. **Services / Staff / Hours** — clean CRUD with shadcn forms + dialogs.
3. **Flow Builder** — vertical card list with up/down reorder + enable toggle + editable label per step. (Lightweight DnD via simple buttons; visual & polished.)
4. **Public booking page** — chat/assistant UI: bot bubbles ask welcome → service → staff → date (calendar) → time slot grid → confirm with name/phone. Slot generation derives from working hours minus existing confirmed bookings (server function).
5. **Bookings management** — tabs, status update actions, calendar month view.
6. **Landing page (Arabic, RTL)** — Hero, Features, How it works, Dashboard preview, Assistant preview, Pricing, CTA. `dir="rtl"`, Arabic typography (Tajawal/Cairo via Google Fonts).

## Design System

- Premium minimal SaaS — black/white/neutral grays + a single elegant accent (deep indigo-violet `oklch(~0.55 0.18 270)`).
- Glassmorphism cards, subtle gradients, rounded-2xl, soft shadows, smooth Tailwind transitions.
- Dark + light mode via `.dark` class with token overrides already in `styles.css` — extend tokens for accent, glass, gradient.
- Sidebar dashboard layout (shadcn sidebar) with collapsible icon mode.

## Server Functions

- `getBusinessBySlug` — public, returns business + enabled services + staff + flow.
- `getAvailableSlots` — public, given business/service/staff/date returns free time slots.
- `createBooking` — public, validates and inserts; rejects overlaps.
- Dashboard CRUD via authenticated server functions using `requireSupabaseAuth`.

## Out of Scope (stubs / future)

WhatsApp, payments, notifications, AI assistant, multi-language toggle, subscriptions — code structured to add later, not implemented now.

## Deliverable

A polished v1: working auth, dashboard CRUD for services/staff/hours/flow/settings, bookings list, public chat booking page, Arabic RTL landing page. Mobile responsive, dark/light mode, premium look.
