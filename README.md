# Vaani (वाणी) — AI-Powered Multilingual Digital Form Assistant

> *"Speak your language. Complete forms with confidence."*

[![Build & Typecheck](https://img.shields.io/badge/Build-Passing-emerald)](https://vite.dev)
[![Tests](https://img.shields.io/badge/Tests-19%20Passed-indigo)](https://vitest.dev)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20Compliant-purple)](https://w3.org/WAI)

---

## 1. Project Overview

Over 60% of rural, semi-urban, and elderly citizens in India encounter severe barriers when attempting to complete digital government or scholarship applications. Complicated legal terminology, unfamiliar keyboard interfaces, and mandatory English language forms often lead to reliance on intermediaries or outright application rejection.

**Vaani** is an accessibility-first, AI-powered web application that enables citizens to speak naturally in their preferred native language—**Hindi (हिन्दी)**, **English (India)**, or **Assamese (অসমীয়া)**. 

### How It Works:
1. **Speak Naturally**: The user clicks the large microphone button and speaks their information in colloquial everyday sentences.
2. **AI Information Extraction**: The speech transcript is processed securely server-side using **Google Gemini 1.5 Flash**, extracting target fields, standardizing 10-digit Indian mobile numbers, detecting applicant age, and flagging uncertain or missing fields in structured JSON.
3. **Voice-Guided Missing Field Assistance**: If a required field is missing, Vaani's voice assistant speaks out loud using browser speech synthesis and invites the user to provide just that single piece of information without starting over.
4. **Explicit Human Review**: All mapped values are displayed with clear source badges (`AI-filled`, `Needs review`, `User edited`). The user can edit or delete any field manually.
5. **Secure Database Storage**: Form submissions are stored in **Supabase PostgreSQL** protected by strict **Row Level Security (RLS)**, generating a unique verifiable reference receipt (`VN-2026-XXXXX`).

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS 4, Lucide React icons, Canvas Confetti.
- **Voice Recognition**: Browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) configured for `hi-IN`, `en-IN`, and `as-IN` with honest capability detection.
- **Voice Assistance (TTS)**: Web SpeechSynthesis API with natural Hindi and Indian English voice selection and accessibility speed tuning.
- **AI Intelligence**: Google Gemini 1.5 Flash structured output extraction (`responseMimeType: "application/json"`).
- **Backend & Security**: Secure server middleware and Supabase Edge Functions. Private API keys (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are never exposed to browser code.
- **Database**: Supabase PostgreSQL with custom schema and strict Row Level Security (RLS) policies.
- **Testing**: Vitest automated unit and integration tests.

---

## 3. Supported Languages & Browser Considerations

| Language | Locale Code | Speech Recognition | Voice Assistance (TTS) | AI LLM Understanding |
| :--- | :--- | :---: | :---: | :---: |
| **Hindi (हिन्दी)** | `hi-IN` | ✅ Full Support | ✅ Native Hindi Voice | ✅ Native Fluency |
| **English (India)** | `en-IN` | ✅ Full Support | ✅ Indian English Voice | ✅ Native Fluency |
| **Assamese (অসমীয়া)** | `as-IN` | ⚠️ Browser Dependent | ⚠️ English/Hindi Fallback | ✅ Native Fluency |

> **Assamese Support Notice**: Most browser speech engines (such as standard desktop Chrome or Edge) lack an offline or cloud acoustic model for `as-IN`. Vaani handles this transparently by notifying the user, allowing Hindi/English voice input, and offering a dedicated **Manual Text Mode** where Assamese text can be entered directly.

---

## 4. Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on v24.13.0)
- **npm**: v9.0.0 or higher
- A modern browser with microphone access (Google Chrome or Microsoft Edge recommended)

### 1. Installation
Clone or navigate to the repository directory:
```bash
cd vaani-app
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and supply your keys:
```env
# Google Gemini API key (Get free at https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase PostgreSQL Configuration (From https://supabase.com)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

*(Note: If you do not have a Gemini key immediately, Vaani includes an intelligent local heuristic pattern extractor that executes cleanly so you can test the full user flow offline.)*

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Run Automated Tests
```bash
npm test
```
All 19 automated tests for validation, phone normalization, state preservation, and server API endpoints will execute.

### 5. Production Build
```bash
npm run build
```

---

## 5. Supabase Database Setup & Row Level Security

### 1. Run the Database Migration
Navigate to your **Supabase Dashboard -> SQL Editor** and execute the SQL script in:
`supabase/migrations/20261019_create_form_submissions.sql`

```sql
-- 1. Create table
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL UNIQUE,
    form_type TEXT NOT NULL,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 10 AND age <= 130),
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    address TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'Hindi',
    additional_details TEXT,
    fields_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Strict Security Policies:
-- Allow anonymous citizens to INSERT valid applications
CREATE POLICY "Allow public anonymous insert"
ON public.form_submissions
FOR INSERT TO anon, authenticated
WITH CHECK (
    length(trim(full_name)) >= 2 AND
    length(trim(phone)) >= 10 AND
    length(trim(city)) >= 1 AND
    length(trim(state)) >= 1
);

-- Deny public reading to protect citizen privacy
CREATE POLICY "Deny public select"
ON public.form_submissions
FOR SELECT TO anon
USING (false);

-- Service Role (backend operations) has full access
CREATE POLICY "Service role full access"
ON public.form_submissions
TO service_role
USING (true)
WITH CHECK (true);
```

### 2. Deploying Supabase Edge Functions (Optional Production Step)
If you prefer deploying the server-side extraction logic directly on Supabase's global edge network:
```bash
# Login to Supabase CLI
supabase login

# Set Gemini API key secret
supabase secrets set GEMINI_API_KEY=your_gemini_api_key

# Deploy the extraction edge function
supabase functions deploy extract-form

# Deploy the submission edge function
supabase functions deploy submit-form
```

---

## 6. Live Hackathon Demonstration Guide

Follow this step-by-step flow in front of judges:

1. **Open Vaani**: Open the application at `http://localhost:5173`.
2. **Observe Accessibility & Theme**:
   - Point out the **Voice ON/Muted** toggle, **Text Size (1x, 1.2x, 1.4x)** switcher, and **High Contrast** mode.
3. **Select Language**: Select **हिन्दी (Hindi)** from the top language bar.
4. **Click "Start Voice Form"**:
   - Notice the spoken welcoming instruction: *"वाणी में आपका स्वागत है। माइक बटन दबाएं और अपनी जानकारी बोलें।"*
5. **Speech Recognition**:
   - Click the prominent central microphone button (or click **"Try Demo Speech Phrase"**).
   - Natural Hindi Phrase:
     > *"मेरा नाम राहुल शर्मा है। मेरी उम्र 24 साल है। मेरा मोबाइल नंबर 9876543210 है। मैं गुवाहाटी, असम में रहता हूँ। मुझे राशन सहायता चाहिए।"*
   - Watch the live speech transcript stream in real-time.
6. **Click "Extract & Map to Form Fields"**:
   - Google Gemini AI analyzes the transcript and returns structured JSON.
   - Watch the form fields populate with badges: `AI-filled` (indigo), `Verified` phone number.
7. **Missing Field Prompting**:
   - Notice that the street address was omitted in the phrase.
   - The interactive **Missing Fields Assistant** appears:
     > *"We found 4 pieces of information. Next: घर का पूरा पता is missing"*
   - Click **"Ask Aloud"** to hear Vaani speak the prompt.
   - Click **"Speak घर का पूरा पता"** or type `मकान नंबर 42, जू रोड` to fill just that field!
8. **Inspect & Edit**:
   - Manually edit any value (e.g. change age or phone).
   - Notice the badge changes to `User edited` (green). User edits are never overwritten!
9. **Review and Confirm**:
   - Click **"Review and Submit Application"**.
   - Inspect the summary modal.
   - Check the explicit consent checkbox: *"I verify that this information is correct..."*
10. **Confirm Submission**:
    - Click **"Confirm & Submit Application"**.
    - Watch the celebratory confetti and inspect the verified **Application Reference Number** (e.g., `VN-2026-XXXXX`), PostgreSQL storage confirmation, and Print Receipt capability!

---

## 7. Troubleshooting & Common Questions

### Microphone Permission Denied
- Click the camera/microphone icon in your browser's address bar.
- Select "Always allow" for `http://localhost:5173`.
- Reload the page.

### Gemini API Key Missing
- Open the **Settings & Connectivity** dialog (gear icon in the top navbar).
- Paste your Gemini API key in the input box and click **"Apply Key"**.
- Extraction will immediately switch to live Google Gemini 1.5 Flash.

### Browser Speech Engine Unsupported
- Use Google Chrome or Microsoft Edge for optimal Web Speech API speech-to-text accuracy.
- If using an unsupported browser or quiet environment, use the **Manual Text Mode** tab anytime.

---

## 8. License

This project is licensed under the MIT License. Developed for digital inclusion and accessible citizen services.
