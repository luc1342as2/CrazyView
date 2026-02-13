# Netflix Clone

A complete Netflix clone built with React.js featuring login, signup, plan selection, payment flow, profile selection, and a browse experience.

## Features

- **Landing Page** - Hero section, content rows, call-to-action
- **Sign In** - Email/password authentication with validation
- **Sign Up** - Multi-step flow:
  1. Email verification
  2. Password & name
  3. Plan selection (Basic, Standard, Premium)
  4. Payment form (card number, expiry, CVC, ZIP)
- **Profile Selection** - "Who's watching?" Netflix-style profile picker
- **Browse** - Full browse experience with hero carousel and content rows
- **Responsive** - Works on desktop and mobile

## Run the App

```bash
cd netflix-clone
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Demo Accounts

Sign up with any email and password (min 4 chars). Data is stored in `localStorage` for demo purposes—no backend required. Payment is simulated and no real charges are made.

## 2FA Verification Code (Email)

To send verification codes to the account's email when enabling 2FA or changing email:

1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Add an email service (Gmail, etc.) and create a template
3. In the template, use `{{to_email}}` for the recipient and `{{message}}` for the 6-digit code
4. Create `.env` with:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Without these env vars, the code is displayed in the UI (demo mode). SMS requires a backend and is not supported.

## Tech Stack

- React 18 + Vite
- React Router v7
- @emailjs/browser (optional, for 2FA emails)
- CSS (no framework)
