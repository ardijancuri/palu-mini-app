# PALU React App

A modern React application for token dashboard and community features, built with Vite.

## Features

- **Dashboard**: Real-time token data with market cap, price, liquidity, and volume
- **Community**: Community-driven token discovery
- **Upvoting**: Like/unlike tokens with persistent state
- **Responsive Design**: Mobile-first design with desktop optimization
- **Real-time Data**: Live token data from API
- **Sorting**: Sort tokens by market cap, price, or volume

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **CSS Custom Properties** - Modern styling with CSS variables
- **FontAwesome** - Icons for upvote buttons

## Getting Started

### Prerequisites

- Node.js 20.17.0 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. For full-stack development (React + Backend):
```bash
npm run dev:full
```

The app will be available at `http://localhost:5173`

### Backend API

The React app expects a backend API running on `http://localhost:3000` with the following endpoints:

- `GET /api/token/:address` - Get token data by address

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.jsx       # Navigation header
│   ├── TokenCard.jsx    # Token display card
│   └── UpvoteButton.jsx # Upvote functionality
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard page
│   └── Community.jsx   # Community tokens page
├── hooks/              # Custom React hooks
│   ├── useTokenData.js # Token data fetching
│   └── useCommunityData.js # Community data fetching
├── utils/              # Utility functions
│   └── formatters.js   # Number formatting utilities
├── App.jsx             # Main app component with routing
└── index.css           # Global styles
```

## Features

### Token Cards
- Desktop and mobile layouts
- Ranking system (gold, silver, bronze)
- Real-time price updates
- Upvote functionality with localStorage persistence

### Responsive Design
- Mobile-first approach
- Desktop optimization
- Adaptive layouts for different screen sizes

### Data Management
- Custom hooks for data fetching
- Error handling and loading states
- Local storage for user preferences

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run dev:full` - Start both frontend and backend

### Environment

The app uses Vite's proxy configuration to forward API requests to the backend server running on port 3000.

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the Vite configuration
4. Set environment variables in Vercel dashboard

### Backend (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `server/config/schema.sql` in the Supabase SQL editor
3. Update environment variables with Supabase credentials
4. Deploy server functions to Vercel or your preferred platform

### Environment Variables

Create a `.env` file based on `env.example`:

```bash
cp env.example .env
```

Required variables:
- `DB_HOST` - Supabase database host
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory and ready for deployment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.