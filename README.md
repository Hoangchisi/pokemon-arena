# 🎮 Pokémon Battle Simulator (Web-Based)

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Built%20With-Next.js%20%7C%20TypeScript%20%7C%20Tailwind-blue)

A modern, high-performance **Pokémon Battle Simulator** built directly for the web. This project recreates the intense strategy of Pokémon battles with a focus on cross-platform compatibility, advanced combat mechanics, and a seamless user experience.

> **Live Demo:** [https://pokemon-arena-beige.vercel.app]

---

## ✨ Key Features

### ⚔️ Advanced Combat Engine
- **Turn-Based Strategy:** Complete battle logic including damage calculation, speed tiers, and status effects.
- **Modern Mechanics:** Full support for **Mega Evolution**, **Gigantamax**, and **Terastallization**.
- **Move Categories:** Distinct handling for Physical, Special, and Status moves.

### 📱 Cross-Platform UX (Mobile-First)
- **Responsive Design:** Adaptive interface that switches between `DesktopArena` and `MobileArena` layouts.
- **Touch-Optimized:** Custom **Touch & Hold** tooltips for mobile users (view stats by holding, dismiss by releasing).
- **Smooth Animations:** CSS sprites and transitions for an immersive feel.

### 🛠️ System & Progression
- **Team Builder:** Customize your team with moves, abilities, and items.
- **Switch System:** Dynamic Pokémon switching logic with live HP updates.
- **Cloud Save:** Integrated database synchronization to save player progress (Stage/Level unlocking) automatically upon victory.

---

## 🏗️ Tech Stack

This project leverages the latest web technologies for performance and scalability:

- **Core:** [Next.js 14 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing for robust battle logic)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with Persist Middleware)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## 📸 Screenshots

| Desktop View | Mobile View |
|:---:|:---:|
| *[Place Desktop Screenshot Here]* | *[Place Mobile Screenshot Here]* |
| *Strategic dashboard with detailed metrics* | *Optimized touch controls & tooltips* |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name
   
2. **Install dependencies**
npm install
# or
yarn install

3. **Environment Setup**
Create a .env.local file in the root directory and configure your database variables:
DATABASE_URL="your_database_connection_string"
# Add other API keys if necessary

4. **Run the development server**
Bash
npm run dev

6. **Open your browser**
Navigate to http://localhost:3000 to see the app running.

📂 Project Structure
A quick look at the core structure:

src/
├── app/
│   ├── arena/           # Battle routes (Active battle, Lobby)
│   ├── api/             # Server-side API routes (User progress, Team data)
│   └── page.tsx         # Home page
├── components/
│   ├── battle/          # Battle-specific components (HealthBar, HUD, Tooltips)
│   ├── ui/              # Reusable UI elements (TypeBadge, Buttons)
│   └── mobile-arena.tsx # Mobile specific layout logic
├── hooks/
│   ├── useBattleStore.ts # Core battle logic & state (Zustand)
│   └── useUserStore.ts   # User data & persistence
├── lib/
│   └── constants.ts     # Game constants (Type charts, Move data)
└── types/               # TypeScript interfaces
🤝 Contributing
Contributions are welcome! If you have ideas for new features (e.g., PvP multiplayer, new Gen 9 Pokémon), feel free to fork the repository and submit a Pull Request.

1. Fork the Project

2. Create your Feature Branch (git checkout -b feature/AmazingFeature)

3. Commit your Changes (git commit -m 'Add some AmazingFeature')

4. Push to the Branch (git push origin feature/AmazingFeature)

5. Open a Pull Request
