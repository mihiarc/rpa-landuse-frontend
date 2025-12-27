<div align="center">

# RPA Land Use Analytics

### Web Application

[![Launch App](https://img.shields.io/badge/Launch%20App-rpalanduse.org-0066cc?style=for-the-badge&logo=rocket&logoColor=white)](https://rpalanduse.org)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## Features

| Feature | Description |
|:--------|:------------|
| **AI Chat** | Natural language queries with streaming responses |
| **Analytics Dashboard** | Interactive Plotly.js visualizations for land use trends |
| **Data Explorer** | SQL query interface with schema browser |
| **Data Export** | Bulk download with predefined templates and custom filters |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** Tailwind CSS + shadcn/ui components
- **State:** Zustand
- **Data Fetching:** TanStack React Query
- **Charts:** Plotly.js with react-plotly.js
- **Language:** TypeScript

---

## Development

### Prerequisites

- Node.js 18+
- Backend API running (see [rpa-landuse-backend](https://github.com/mihiarc/rpa-landuse-backend))

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |

### Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

---

## Deployment

This frontend is deployed on **Netlify** with auto-deploy from the `main` branch.

| Environment | URL |
|-------------|-----|
| Production | [rpalanduse.org](https://rpalanduse.org) |
| Preview | [rpa-landuse-frontend.netlify.app](https://rpa-landuse-frontend.netlify.app) |

---

## Project Structure

```
app/
├── login/          # Authentication
├── dashboard/
│   ├── chat/       # AI chat interface
│   ├── analytics/  # Visualization dashboard
│   ├── explorer/   # SQL query tool
│   └── extraction/ # Data export
components/
├── ui/             # shadcn/ui components
├── chat/           # Chat interface components
└── dashboard/      # Dashboard components
lib/
├── api.ts          # API client
└── hooks/          # React Query hooks
stores/             # Zustand state
types/              # TypeScript definitions
```

---

<div align="center">

**[rpalanduse.org](https://rpalanduse.org)** | [Core Repository](https://github.com/mihiarc/rpa-landuse) | [Backend API](https://github.com/mihiarc/rpa-landuse-backend)

MIT License

</div>
