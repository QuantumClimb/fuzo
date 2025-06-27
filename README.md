# 🍜 FUZO - Intelligent Food Discovery Platform

> **Discover, Connect, and Explore** - Your AI-powered food discovery companion that learns your preferences and connects you with the perfect dining experiences.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-teal.svg)](https://tailwindcss.com/)

## 🌟 Features

### 🤖 **AI-Powered Intelligence**
- **Behavioral Learning Engine** - Learns from your swipes, saves, and visits
- **Smart Recommendations** - Personalized suggestions based on your taste profile
- **Preference Analytics** - Deep insights into your food discovery patterns
- **Time-Based Learning** - Adapts recommendations based on meal times

### 🗺️ **Smart Map Discovery**
- **Interactive Restaurant Map** - Explore nearby dining options with smart filters
- **Route Planning** - Find the best food stops along your journey
- **Location Intelligence** - GPS-based discovery with distance optimization
- **Live Updates** - Real-time restaurant data and availability

### 📱 **Social Food Network**
- **Group Chat System** - Connect with fellow food enthusiasts
- **Friend Activity Tracking** - See where your friends are dining
- **Review & Rating System** - Share and discover authentic reviews
- **Photo Sharing** - Capture and share your food experiences

### 🔒 **Enterprise-Grade Security**
- **End-to-End Encryption** - Secure data storage and transmission
- **CSRF Protection** - Advanced security against cross-site attacks
- **Session Management** - Secure user authentication and session handling
- **Privacy Controls** - Complete data export and deletion capabilities

## 🛠️ Tech Stack

### **Frontend Core**
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe development experience
- **Vite 5.4.1** - Lightning-fast build tool and dev server
- **React Router DOM 6.26.2** - Client-side routing

### **UI & Styling**
- **Shadcn/UI** - Modern, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons

### **State & Data Management**
- **TanStack React Query 5.56.2** - Powerful data fetching and caching
- **React Hook Form 7.53.0** - Performant forms with easy validation
- **Zod 3.23.8** - Schema validation for TypeScript

### **Security & Encryption**
- **CryptoJS 4.2.0** - Cryptographic functions for data security
- **Custom Security Layer** - CSRF protection, session management
- **Encrypted Storage** - Secure local data persistence

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd fuzo-food-discovery

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/UI component library
│   ├── onboarding/      # User onboarding flow
│   ├── FoodCard.tsx     # Food discovery cards
│   ├── MapExplorer.tsx  # Interactive map component
│   └── ...
├── pages/               # Application pages/routes
│   ├── Index.tsx        # Main app container
│   ├── FoodFeed.tsx     # Discovery feed
│   ├── SwipeFeed.tsx    # Tinder-style swiping
│   ├── MapExplorer.tsx  # Map-based discovery
│   ├── AIAssistant.tsx  # AI chat interface
│   └── ...
├── data/                # Mock data (ready for API replacement)
│   ├── mockData.ts      # Core application data
│   ├── restaurants.json # Restaurant database
│   ├── users.json       # User profiles
│   └── ...
├── utils/               # Utility functions
│   ├── behavioralEngine.ts  # AI learning engine
│   ├── security/        # Security utilities
│   │   ├── encryption.ts
│   │   ├── csrf.ts
│   │   └── storage.ts
│   └── validation.ts    # Input validation
├── types/               # TypeScript definitions
│   ├── index.ts         # Core data models
│   └── onboarding.ts    # Onboarding types
└── hooks/               # Custom React hooks
    ├── use-toast.ts     # Toast notifications
    └── use-mobile.tsx   # Mobile detection
```

## 🧠 AI & Machine Learning

### Behavioral Learning Engine

The app includes a sophisticated AI engine that learns from user behavior:

```typescript
// User behavior tracking
interface UserBehavior {
  swipeHistory: SwipeEvent[];      // Food preference learning
  mapInteractions: MapInteraction[]; // Location-based patterns  
  savedPreferences: UserPreferences; // Explicit preferences
  learningProfile: LearningProfile;  // AI-generated insights
}

// Smart recommendation scoring
calculateRecommendationScore(item, userProfile) {
  // Cuisine affinity scoring (2x weight)
  // Time-based preference scoring
  // Location relevance scoring
  // Social influence scoring
}
```

### Key Learning Features

- **Swipe Pattern Analysis** - Learn food preferences from user interactions
- **Time-Based Recommendations** - Adapt suggestions based on meal times
- **Location Intelligence** - Remember preferred restaurant types by area
- **Social Learning** - Incorporate friend recommendations and reviews

## 🔐 Security Architecture

### Multi-Layer Security

```typescript
// Encrypted storage with CSRF protection
secureStorage.setItem(key, data) {
  const encryptedData = encryptData({
    value: data,
    timestamp: Date.now(),
    csrfToken: csrfManager.getToken()
  });
  localStorage.setItem(key, encryptedData);
}

// Session management with timeout
sessionManager.validateSession() {
  // Check session expiry
  // Validate CSRF tokens
  // Audit security events
}
```

### Security Features

- **🔒 AES Encryption** - All sensitive data encrypted before storage
- **🛡️ CSRF Protection** - Prevents cross-site request forgery attacks
- **⏰ Session Timeout** - Automatic session expiry for security
- **📊 Security Logging** - Comprehensive audit trail
- **🗑️ Data Privacy** - GDPR-compliant data export/deletion

## 🌐 API Architecture

### Current Implementation
The app uses a sophisticated mock data system that's ready for real API integration:

```typescript
// Data sources ready for API replacement
src/data/
├── mockData.ts      # → REST API endpoints
├── restaurants.json # → Restaurant database API
├── users.json       # → User management API
└── routes.json      # → Navigation API
```

### Ready for Integration

**Restaurant APIs**
- Google Places API
- Yelp Fusion API
- Foursquare Places API

**Mapping Services**
- Google Maps Platform
- Mapbox GL JS
- OpenStreetMap

**AI/ML Services**
- Custom recommendation engine
- Natural language processing
- Image recognition for food photos

**Real-time Features**
- WebSocket for live chat
- Push notifications
- Live location sharing

## 📱 Key Features Deep Dive

### 1. **Smart Discovery Feed**
- Tinder-style swiping interface
- AI-powered content curation
- Real-time preference learning
- Social activity integration

### 2. **Interactive Map Explorer**
- GPS-based restaurant discovery
- Advanced filtering (cuisine, price, rating)
- Smart route planning
- Friend activity overlay

### 3. **Social Network**
- Group chat for food enthusiasts
- Friend recommendation system
- Review and rating platform
- Photo sharing with location tags

### 4. **AI Assistant**
- Natural language food queries
- Personalized recommendations
- Dietary restriction handling
- Local cuisine expertise

## 🚀 Deployment

### Development Deployment
```bash
npm run build
npm run preview
```

### Production Deployment

**Using Lovable Platform:**
1. Open [Lovable Project](https://lovable.dev/projects/58fa9c8f-bb31-4f3a-9179-5b8392b5e8a0)
2. Click Share → Publish
3. Optional: Connect custom domain in Project → Settings → Domains

**Manual Deployment:**
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting platform
# Supports: Vercel, Netlify, AWS S3, GitHub Pages
```

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and test thoroughly
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Code Standards

- **TypeScript** - All code must be properly typed
- **ESLint** - Follow the configured linting rules
- **Component Structure** - Use functional components with hooks
- **Security** - Always validate inputs and sanitize data

### Testing

```bash
# Run linting
npm run lint

# Build test
npm run build

# Preview build
npm run preview
```

## 📄 License

This project is part of the Lovable development platform. See the [Lovable Terms](https://lovable.dev/terms) for details.

## 👥 Authors

- **Onomatix** - *Initial work* - [juncando@gmail.com](mailto:juncando@gmail.com)

## 🙏 Acknowledgments

- **Shadcn/UI** - For the beautiful component library
- **Radix UI** - For accessible UI primitives  
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the comprehensive icon library
- **Lovable Platform** - For the development infrastructure

---

<div align="center">

**Built with ❤️ using React, TypeScript, and modern web technologies**

[🌐 Live Demo](https://lovable.dev/projects/58fa9c8f-bb31-4f3a-9179-5b8392b5e8a0) • [📖 Documentation](./docs/) • [🐛 Report Bug](./issues/) • [💡 Request Feature](./issues/)

</div>
