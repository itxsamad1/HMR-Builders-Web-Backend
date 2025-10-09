# HMR Builders Frontend

A modern React-based frontend for the HMR Builders Real Estate Tokenization Platform.

## Features

- 🏠 **Property Browsing**: Browse and filter real estate properties
- 💰 **Investment Management**: Track investments and portfolio performance
- 🔐 **Authentication**: Secure user authentication with JWT
- 💳 **Payment Integration**: Manage payment methods and wallet
- 📱 **Responsive Design**: Mobile-first responsive design
- 🎨 **Modern UI**: Clean, modern interface with Tailwind CSS

## Tech Stack

- **React 18** - Frontend framework
- **React Router 6** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

The application will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card, etc.)
│   ├── Layout/         # Layout components (Header, Layout)
│   ├── PropertyCard.js # Property display component
│   └── InvestmentCard.js # Investment display component
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication context
├── pages/              # Page components
│   ├── Home.js         # Landing page
│   ├── Properties.js   # Properties listing
│   ├── Login.js        # Login page
│   ├── Register.js     # Registration page
│   └── Dashboard.js    # User dashboard
├── services/           # API services
│   └── api.js          # API client configuration
├── utils/              # Utility functions
│   └── cn.js           # Class name utility
├── App.js              # Main app component
└── index.js            # App entry point
```

## API Integration

The frontend integrates with the backend API through the `services/api.js` file. All API calls are centralized and include:

- Authentication endpoints
- Properties management
- Investment tracking
- User profile management
- Payment methods
- Wallet transactions

## Authentication

The app uses JWT-based authentication with:
- Automatic token refresh
- Protected routes
- Persistent login state
- Secure token storage

## Styling

The application uses Tailwind CSS for styling with:
- Custom color palette
- Responsive design utilities
- Component-based styling
- Dark mode support (planned)

## State Management

- **React Query**: Server state management and caching
- **React Context**: Global state (authentication, user data)
- **React Hook Form**: Form state management
- **Local State**: Component-level state with useState/useReducer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
