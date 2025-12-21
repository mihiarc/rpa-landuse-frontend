# RPA Land Use Analytics Frontend

Modern Next.js frontend for the RPA Land Use Analytics platform. Built with Next.js 16, React 19, and Tailwind CSS.

## Features

- **AI Chat Interface** - Natural language queries about land use data with streaming responses
- **Analytics Dashboard** - Interactive visualizations with Plotly.js charts
  - Land use distribution overview
  - Climate scenario comparisons
  - Urbanization source analysis
  - Forest transition tracking
  - Agricultural impact assessment
- **Data Explorer** - SQL query interface with schema browser
- **Data Extraction** - Bulk export with predefined templates and custom filters

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Charts**: Plotly.js with react-plotly.js
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:8000` (see [rpa-landuse](https://github.com/mihiarc/rpa-landuse))

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── chat/              # AI chat interface
│   ├── analytics/         # Analytics dashboard
│   ├── explorer/          # SQL query explorer
│   └── extraction/        # Data extraction tools
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── api.ts            # API client
│   └── hooks/            # React Query hooks
├── stores/               # Zustand state stores
└── types/                # TypeScript type definitions
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Backend API

This frontend requires the FastAPI backend from the main [rpa-landuse](https://github.com/mihiarc/rpa-landuse) repository. Start the backend with:

```bash
cd backend
PYTHONPATH=/path/to/rpa-landuse/src uvicorn app.main:app --reload
```

## License

MIT
