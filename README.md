
# Clear Signal Frontend

A modern React web application for the Clear Signal platform, built with Vite and TailwindCSS. The app features a clean UI, animated hero section, responsive navigation, and routing for main pages.

## Features

- ⚡️ Fast development with Vite
- 🎨 Styled with TailwindCSS and custom color themes
- ⚛️ Built using React 19 and React Router v7
- ✨ Animated hero section with custom canvas particles
- 📱 Responsive navigation bar (mobile & desktop)
- 🏆 Pages for Home, Problems, Collections, Leaderboard, Login, Premium, and 404

## Project Structure

```
frontend/
│
├── public/
│   └── Logo.jpg
├── src/
│   ├── App.jsx              # Main app layout (uses React Router Outlet)
│   ├── main.jsx             # Entry point, sets up router
│   ├── App.css              # (empty, ready for custom styles)
│   ├── index.css            # TailwindCSS and custom theme variables
│   ├── components/
│   │   ├── Hero.jsx         # Hero section with animated particles
│   │   └── Navbar.jsx       # Responsive navigation bar
│   └── pages/
│       ├── Home.jsx         # Home page (uses Navbar and Hero)
│       └── PageNotFound.jsx # 404 page
│
├── index.html               # Main HTML file
├── package.json             # Project metadata and scripts
├── vite.config.js           # Vite configuration (React + Tailwind)
├── eslint.config.js         # ESLint configuration
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Build

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

### Lint

```sh
npm run lint
```

## Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Framer Motion](https://www.framer.com/motion/) (for future animations)
- [React Icons](https://react-icons.github.io/react-icons/)

## Customization

- Update theme colors in `src/index.css`
- Add new pages in `src/pages/` and routes in `src/main.jsx`
- Place static assets in `public/`

## License

MIT
