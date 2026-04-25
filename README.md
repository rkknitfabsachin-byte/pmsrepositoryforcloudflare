# PMS — Production Management System

A role-based Progressive Web App (PWA) for managing textile manufacturing orders, built on top of a Google Sheet as the source of truth.

## Features

- **Role-based Access Control**: Admin, Planner, Yarn Manager, Production, Dyeing, Dispatch.
- **Google Sheets Integration**: Uses Google Sheets API to read and write directly to the master production sheet.
- **Offline Capable**: PWA setup allows the app to be installed on mobile devices for offline use on the factory floor.
- **WhatsApp Integration**: Deep linking to WhatsApp with pre-filled message templates for quick communication between departments.
- **Industrial-Minimal Design**: Optimized for mobile usage with a dark/light mode adaptable interface.

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Zustand (State Management)
- Google Apps Script (Backend API proxy)
- Next-PWA
- Lucide React (Icons)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Google Apps Script Setup (No Cloud Console / No Credit Card Needed)**
   - Open your master Google Sheet.
   - Click **Extensions > Apps Script**.
   - Copy the contents of the `google-apps-script.js` file from this project and paste it into the script editor (replacing all existing code).
   - Click **Deploy > New deployment**.
   - Select type: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
   - Click **Deploy**, authorize the permissions, and copy the **Web app URL**.
   - Rename `.env.local.example` to `.env.local` and add your URL: `NEXT_PUBLIC_APPS_SCRIPT_URL=your_url_here`.

3. **Users Tab Setup in Google Sheets**
   - In your Master Google Sheet, create a new tab named `USERS`.
   - Setup the columns exactly in this order: `Name | Password | Role | WhatsApp | Active`.
   - Start putting users from row 2.
   - **Roles allowed**: ADMIN, PLANNER, YARN_MANAGER, PRODUCTION, DYEING, DISPATCH, VIEWER.
   - **Active allowed**: TRUE or FALSE.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Modules

1. **Dashboard (Admin)**: KPI overview, machine utilization, and charts.
2. **Orders (Admin)**: Add new Purchase Orders (POs) directly to the sheet.
3. **Planning**: Schedule and plan production orders, add notes.
4. **Yarn**: Manage yarn inventory, track ordered quantities (supports up to 2 yarns).
5. **Production**: Allocate machines, track kora GSM, and mark output completion.
6. **Dyeing**: Assign dyeing houses, select add-ons (silicon, tumble dry, etc.).
7. **Dispatch**: Mark final completion status for the order.

## Notes

- The app uses optimistic UI updates for a fast, responsive feel. API calls are sent in the background to update the Google Sheet.
- PWA features (like installation) are enabled when running the production build (`npm run build && npm start`).
- **User Authentication** is seamlessly linked with the master Google Sheet. Just add a username and password to the `USERS` tab and they will instantly have access.

## Hosting on Cloudflare Pages (Free)

Since this app uses Next.js App Router and APIs, we need to deploy it using Cloudflare's edge runtime. The code has already been configured with `export const runtime = 'edge'` in the API routes!

Follow these exact steps:

1. **Push your code to GitHub**
   - Create a repository on GitHub (make it Private).
   - Push all your project files to that repository.

2. **Connect to Cloudflare**
   - Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and log in.
   - On the left sidebar, click **Workers & Pages**.
   - Click the blue **Create application** button, then select the **Pages** tab.
   - Click **Connect to Git** and authorize your GitHub account.
   - Select your PMS repository from the list and click **Begin setup**.

3. **Configure the Build Settings**
   - **Framework preset**: Select `Next.js`
   - **Build command**: Change this to exactly: `npx @cloudflare/next-on-pages@1`
   - **Build output directory**: Change this to exactly: `.vercel/output/static`

4. **Add Environment Variables**
   - Scroll down to the "Environment variables (advanced)" section.
   - Click "Add variable".
   - Name: `NEXT_PUBLIC_APPS_SCRIPT_URL`
   - Value: `[Paste your Google Apps Script URL here]`

5. **Deploy!**
   - Click **Save and Deploy**.
   - Cloudflare will build the app and give you a live URL (e.g., `https://pms-app.pages.dev`).

### Post-Deployment: Node.js Compatibility Flag
Cloudflare requires a specific compatibility flag for Next.js API routes.
1. Once deployed, go to your project in Cloudflare Workers & Pages.
2. Go to **Settings > Functions**.
3. Under **Compatibility flags**, add `nodejs_compat`.
4. Trigger a new deployment so the setting takes effect.
