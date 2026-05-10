<div align="center">

# 🎙️ VoiceArbiter

### *Speak. Agree. Settle. — In Any Language, On-Chain.*

**A real-time, AI-powered multilingual voice negotiation platform that automatically extracts deal terms and executes trustless Solana escrow contracts.**

[![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com/)
[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?style=for-the-badge&logo=elevenlabs&logoColor=white)](https://elevenlabs.io/)

---

</div>

## 🌍 The Problem

> Global freelancing and digital trade are exploding — but two friction points still cripple cross-border deals:
>
> 1. **🗣️ Language Barriers** — Misunderstandings in negotiations cost trust, time, and money.
> 2. **🤝 Lack of Payment Guarantees** — Freelancers fear non-payment; clients fear non-delivery.
>
> Existing escrow platforms are slow, expensive, centralized, and require tedious manual form-filling. **VoiceArbiter** removes all of it.

---

## 💡 The Solution

VoiceArbiter lets two parties **speak naturally in their own languages**, while AI listens, translates, and — once both sides verbally agree — **locks the funds on Solana in seconds**. No forms. No middlemen. No language barriers.

```
🎤 Speak  →  🧠 AI Translates  →  📝 LLM Extracts Terms  →  ⛓️ Solana Locks Funds
```

---

## 🚀 Features

| Feature | Description |
| :--- | :--- |
| 🌐 **Real-Time Multilingual Voice** | Parties speak in their native language. Groq's **Whisper** transcribes, **Llama 3** translates, and **ElevenLabs** synthesizes natural speech in the listener's language — all in real-time. |
| 🤖 **AI-Powered Term Extraction** | No forms. **Llama 3** continuously analyzes the conversation and extracts the final agreement terms — `Amount (SOL)`, `Deadline`, and `Scope of Work` — automatically. |
| ⛓️ **Trustless Solana Escrow** | Once both parties verbally confirm, terms are bound to a Solana transaction. Funds are instantly locked via `@solana/web3.js` and signed by the **Phantom Wallet**. |
| 👻 **Phantom Wallet Integration** | Seamless one-click wallet connection. Users sign and approve the on-chain transaction without ever leaving the negotiation. |
| ⚡ **Low-Latency by Design** | Powered by Groq's LPU inference — voice-to-voice translation feels instantaneous, preserving the natural flow of negotiation. |
| 🧠 **Context-Aware Memory** | The LLM tracks the entire conversation, so terms can be revised, refined, and finalized organically — just like a real human negotiation. |

---

## 🛠 Tech Stack

### 🎨 Frontend
| Tech | Role |
| :--- | :--- |
| **Next.js 14** | App Router, Server Actions, API routes |
| **React 18** | Component architecture |
| **Tailwind CSS** | Utility-first styling |
| **Zustand** | Lightweight global state for conversation & wallet |

### ⛓️ Web3
| Tech | Role |
| :--- | :--- |
| **@solana/web3.js** | Building & sending Solana transactions |
| **Phantom Wallet Adapter** | Wallet connection & transaction signing |
| **Solana Devnet/Mainnet** | Settlement layer |

### 🧠 AI Layer
| Tech | Role |
| :--- | :--- |
| **Groq — Whisper API** | Ultra-fast speech-to-text transcription |
| **Groq — Llama 3** | Translation + structured term extraction |
| **ElevenLabs API** | Natural multilingual text-to-speech synthesis |

---

## ⚙️ How It Works

A complete VoiceArbiter negotiation in **6 steps**:

```mermaid
flowchart LR
    A[🎤 Party A speaks<br/>native language] --> B[Groq Whisper<br/>Transcribes]
    B --> C[Llama 3<br/>Translates]
    C --> D[ElevenLabs<br/>Synthesizes voice]
    D --> E[🔊 Party B hears<br/>native language]
    E --> F[Llama 3 extracts<br/>Amount / Deadline / Scope]
    F --> G[👻 Phantom signs]
    G --> H[⛓️ Solana locks SOL]
```

### Step-by-Step User Flow

1. **🔗 Connect Wallet** — The client connects their Phantom wallet. The freelancer's public key is preconfigured.
2. **🎙️ Start Voice Session** — Both parties join a session and select their preferred language.
3. **🗣️ Negotiate Naturally** — Each party speaks in their own tongue. Within ~1 second, the other party hears it spoken in *their* language by ElevenLabs.
4. **📝 Live Term Extraction** — As the conversation evolves, Llama 3 maintains a structured JSON of the deal: `{ amountSOL, deadline, scope }`. The UI shows it updating live.
5. **✅ Verbal Confirmation** — When both parties say "I agree" (in any language), the LLM detects mutual consent and surfaces a **Confirm & Lock Funds** button.
6. **⛓️ On-Chain Settlement** — The client signs via Phantom. `@solana/web3.js` builds and submits the transaction, locking the SOL until the deadline or delivery condition is met.

---

## 💻 Installation & Setup

### 📋 Prerequisites
- Node.js **≥ 18.x**
- npm / yarn / pnpm
- A [Phantom Wallet](https://phantom.app/) browser extension
- API keys from [Groq](https://console.groq.com/) and [ElevenLabs](https://elevenlabs.io/)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/voice-arbiter.git
cd voice-arbiter
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

Add the following variables:

```env
# 🌐 Solana RPC endpoint (Devnet recommended for testing)
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# 👤 Public key of the freelancer (recipient of the escrow)
NEXT_PUBLIC_FREELANCER_PUBKEY=YourFreelancerSolanaPublicKeyHere

# 🧠 Groq API key (for Whisper + Llama 3)
GROQ_API_KEY=your_groq_api_key_here

# 🔊 ElevenLabs API key (for multilingual TTS)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

> ⚠️ **Never commit `.env.local`.** Make sure it is listed in your `.gitignore`.

### 4️⃣ Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

### 5️⃣ Build for Production
```bash
npm run build
npm start
```

---

## 🗺️ Roadmap

- [ ] On-chain dispute resolution via DAO arbitration
- [ ] Support for SPL tokens (USDC, USDT) in addition to SOL
- [ ] Mobile-first PWA with native microphone integration
- [ ] Voice biometrics for additional identity verification
- [ ] Multi-party (3+) negotiation rooms

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License & Hackathon Disclaimer

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

> ⚠️ **Hackathon Disclaimer:** VoiceArbiter was built as a hackathon prototype to demonstrate the convergence of real-time AI and Solana smart contracts. It is **not audited**, **not production-ready**, and **should not be used to handle real funds** without a thorough security review. Use Devnet for all testing. The authors assume no liability for any loss of funds.

---

<div align="center">

### Built with ❤️, ☕, and a lot of `console.log()` during a sleepless hackathon weekend.

**If VoiceArbiter helped you, drop a ⭐ on the repo!**

</div>
