# RichMail - Email Client

A modern, feature-rich email client built with React and TypeScript. RichMail provides an intuitive interface for managing your emails with real-time synchronization and a beautiful user experience.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
```

2. Navigate to the project directory:
```sh
cd RichMail/client
```

3. Install dependencies:
```sh
npm install
```

4. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest

## Project Structure

```
src/
├── components/      # Reusable UI components
│   ├── ui/         # shadcn-ui components
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── ...
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── store/          # Redux state management
├── lib/            # Utilities and helpers
├── api.ts          # API client configuration
└── App.tsx         # Main app component
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

To build the project for production:

```sh
npm run build
```

The build output will be in the `dist` directory. You can deploy this to any static hosting service like Vercel, Netlify, GitHub Pages, or your preferred hosting provider.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is proprietary and confidential.
