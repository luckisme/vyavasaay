# 🌾 Vyavasaay – India's Farming Ally

**Vyavasaay** is an AI-powered agriculture assistant that supports Indian farmers across their entire journey from crop planning and disease diagnosis to market analysis and government scheme discovery. With multilingual, voice-first, and offline capabilities, Vyavasaay is a one-stop, accessible ally for every farmer, on every acre.

---

## 🚀 Why Vyavasaay?

>  India's farming ally.
>  Ask Vyavasaay anything — even without internet.  
>  Maximize yield, minimize risk, and grow smarter.

---

## Features

### 1. Discover (Home)
- Personalized crop suggestions based on weather, season, and location
- Weather alerts, cost calculator, crop selector
- Voice and text-based query input via “Ask Vyavasaay”
- Voice-friendly and multilingual

### 2. Crop Diagnosis
- Upload crop images to detect diseases or pests
- Gemini API gives accurate results
- Treatment recommendations using locally available solutions

### 3. Market Analysis
- Real-time mandi prices via government APIs
- Predictive market trends

### 🏛 4. Government Schemes
- Natural language queries 
- Explains eligibility + provides application links
  

### 🧰 5. Grow Hub
- Farming articles, seasonal guides, how-to videos
- Community content and marketplace (seeds, tools – coming soon)

### 📞 Bonus: Offline Mode
- “Call AI” lets users talk to Vyavasaay via phone in low-connectivity areas (Exotel)

---

## 🧱 Tech Stack

Vyavasaay is built on a modern, scalable tech stack optimized for AI-first, multilingual, and mobile-friendly agriculture tools:

| Layer         | Technology |
|---------------|------------|
| **Framework** | Next.js (App Router) |
| **Language**  | TypeScript |
| **UI Library**| ShadCN UI |
| **Styling**   | Tailwind CSS |
| **AI Services** | Google Genkit (Gemini), Vertex AI Vision, TTS |
| **Weather API** | OpenWeatherMap |
| **STT** | Web Speech API (runs locally in browser) |
| **Deployment** | Firebase Hosting / Vercel |
| **Backend Logic** | Firebase Functions & Firestore |
| **Voice Call (Offline)** | Exotel integration |


---

## 💡 Future Scope

-  Smart Drones + sensor Intergration
-  WhatsApp bot + IVR extension
-  Credit, Insurance & NGO Integration
-  Hyperlocal agri e-commerce integration
-  Solar Suitability Advisory & Subsidy Linker

---

##  Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/vyavasaay.git

# Navigate into the folder
cd vyavasaay

# Install dependencies
npm install

# Start development server
npm run dev



This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
