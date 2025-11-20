# FaNect PPV Admin Dashboard - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Core Concepts](#core-concepts)
6. [Setup & Installation](#setup--installation)
7. [Development Guide](#development-guide)
8. [API Integration](#api-integration)
9. [State Management](#state-management)
10. [Authentication Flow](#authentication-flow)
11. [Key Features](#key-features)
12. [Component Architecture](#component-architecture)
13. [Styling & UI](#styling--ui)
14. [Configuration](#configuration)
15. [Best Practices](#best-practices)

---

## Project Overview

**FaNect PPV Admin** is a comprehensive admin dashboard for managing pay-per-view (PPV) streaming events. Built with modern web technologies, it provides administrators with tools to manage events, users, organisers, payments, and analytics for a live streaming platform.

### Purpose
- Administer PPV events and live streams
- Manage users, organisers, and admin accounts
- Track payments and revenue analytics
- Monitor event metrics and streaming health
- Handle customer support and feedback
- Manage system settings and configurations

### Target Users
- System administrators
- Platform operators
- Event managers
- Support team members

---

## Technical Stack

### Frontend Framework & Build Tools
- **React 18.3.1**: UI library for building component-based interfaces
- **TypeScript 5.5.3**: Typed JavaScript for enhanced type safety
- **Vite 5.4.2**: Modern build tool and dev server
- **React Router 7.6.3**: Client-side routing and navigation
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **PostCSS 8.4.35**: CSS transformation tool

### State Management & Data Fetching
- **Zustand 5.0.6**: Lightweight state management library with persistence
- **Axios 1.10.0**: HTTP client for API requests
- **date-fns 4.1.0**: Date manipulation utility library

### UI Components & Icons
- **Radix UI**: Headless UI component library
  - `@radix-ui/react-dialog`: Modal/dialog components
  - `@radix-ui/react-select`: Select dropdown components
  - `@radix-ui/react-slot`: Slot composition components
- **Lucide React 0.344.0**: SVG icon library
- **Recharts 3.0.2**: React charting library for analytics

### Styling Utilities
- **clsx 2.1.1**: Conditional CSS class composition
- **tailwind-merge 3.3.1**: Merges Tailwind CSS classes intelligently
- **class-variance-authority 0.7.1**: Type-safe component variant generation

### Development Tools
- **ESLint 9.9.1**: JavaScript/TypeScript linting
  - eslint-plugin-react-hooks
  - eslint-plugin-react-refresh
- **TypeScript ESLint**: TypeScript-specific linting rules

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Context Providers (ThemeContext,         │   │
│  │             AuthContext)                          │   │
│  └──────────────────────────────────────────────────┘   │
│           ▼                                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │           React Router                            │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │     ProtectedRoute Wrapper               │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│           ▼                                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │         AdminLayout (Layout Component)            │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Sidebar (Desktop)  │  Header  │ Content   │  │   │
│  │  │  MobileSidebar      │ (Pages)  │           │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│           ▼                                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │    Page Components (Dashboard, Events, Users)    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
            ▼
┌─────────────────────────────────────────────────────────┐
│            Zustand Store (State Management)              │
│  - authStore, eventStore, userStore, dashboardStore    │
│  - Persisted in localStorage                            │
└─────────────────────────────────────────────────────────┘
            ▼
┌─────────────────────────────────────────────────────────┐
│           Service Layer (API Integration)               │
│  - authService, eventService, userService, etc.         │
│  - Axios instance with interceptors                     │
└─────────────────────────────────────────────────────────┘
            ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (RESTful)                       │
│  - Authentication, Events, Users, Payments, etc.        │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **Context + Provider Pattern**: For theme and authentication
2. **Store Pattern (Zustand)**: For global state management
3. **Service Layer Pattern**: Abstraction of API calls
4. **Component Composition**: Reusable UI components with variants
5. **Route Protection**: Protected routes for authenticated pages
6. **Interceptor Pattern**: Axios interceptors for token management

---

## Project Structure

```
fanect-ppv-admin/
├── public/                          # Static assets
│   └── icons/                       # Icon files
├── src/
│   ├── App.tsx                      # Main app component with routing
│   ├── main.tsx                     # React DOM entry point
│   ├── index.css                    # Global styles
│   ├── vite-env.d.ts               # Vite environment types
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── activities/              # Activity-related components
│   │   │   └── ActivityTable.tsx    # Activity table display
│   │   ├── auth/                    # Authentication components
│   │   │   └── ProtectedRoute.tsx   # Route protection wrapper
│   │   ├── charts/                  # Chart components
│   │   ├── events/                  # Event-related components
│   │   │   ├── EventMetricsTab.tsx
│   │   │   ├── EventsTable.tsx
│   │   │   ├── LiveStreamPlayer.tsx
│   │   │   └── RevenueReportTab.tsx
│   │   ├── feedback/                # Feedback components
│   │   │   └── FeedbackTable.tsx
│   │   ├── icons/                   # Icon component exports
│   │   ├── layout/                  # Layout components
│   │   │   ├── AdminLayout.tsx      # Main layout wrapper
│   │   │   ├── Header.tsx           # Top navigation header
│   │   │   ├── Sidebar.tsx          # Desktop sidebar navigation
│   │   │   └── MobileSidebar.tsx    # Mobile sidebar navigation
│   │   ├── locations/               # Location management components
│   │   │   ├── LocationModal.tsx
│   │   │   └── LocationsTab.tsx
│   │   ├── organisers/              # Organiser components
│   │   │   └── OrganiserAnalyticsTab.tsx
│   │   ├── transactions/            # Transaction components
│   │   │   └── TransactionTable.tsx
│   │   └── ui/                      # Reusable UI elements
│   │       ├── action-dropdown.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── confirmation-modal.tsx
│   │       ├── create-admin-modal.tsx
│   │       ├── currency-filter-dropdown.tsx
│   │       ├── custom-date-picker.tsx
│   │       ├── custom-date-range-picker.tsx
│   │       ├── custom-time-picker.tsx
│   │       ├── description-modal.tsx
│   │       ├── dialog.tsx
│   │       ├── error-alert.tsx
│   │       ├── feedback-modal.tsx
│   │       ├── filter-bar.tsx
│   │       ├── input.tsx
│   │       ├── loading-spinner.tsx
│   │       └── ... (more UI components)
│   │
│   ├── contexts/                    # React Context for global state
│   │   ├── AuthContext.tsx          # Authentication context provider
│   │   └── ThemeContext.tsx         # Dark mode theme provider
│   │
│   ├── hooks/                       # Custom React hooks
│   │
│   ├── lib/                         # Utility libraries
│   │   └── utils.ts                 # General utilities
│   │
│   ├── pages/                       # Page-level components (routes)
│   │   ├── admins/                  # Admin management pages
│   │   ├── analytics/               # Analytics & reporting pages
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── LoginPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── dashboard/               # Dashboard pages
│   │   ├── events/                  # Event management pages
│   │   ├── organisers/              # Organiser management pages
│   │   ├── payments/                # Payment pages
│   │   ├── settings/                # Settings pages
│   │   ├── support/                 # Support/help pages
│   │   └── users/                   # User management pages
│   │
│   ├── services/                    # API service layer
│   │   ├── activityService.ts       # Activity API calls
│   │   ├── adminService.ts          # Admin management API
│   │   ├── authService.ts           # Authentication API (login, OTP, etc)
│   │   ├── dashboardService.ts      # Dashboard metrics API
│   │   ├── detailedAnalyticsService.ts
│   │   ├── eventMetricsService.ts
│   │   ├── eventService.ts          # Event management API
│   │   ├── feedbackService.ts       # User feedback API
│   │   ├── locationService.ts       # Location management API
│   │   ├── organiserAnalyticsService.ts
│   │   ├── organiserService.ts      # Organiser management API
│   │   ├── profileService.ts        # User profile API
│   │   ├── transactionService.ts    # Transaction/payment API
│   │   └── userService.ts           # User management API
│   │
│   ├── store/                       # Zustand state stores
│   │   ├── activityStore.ts         # Activity state
│   │   ├── adminStore.ts            # Admin management state
│   │   ├── allTransactionStore.ts
│   │   ├── authStore.ts             # Authentication state (persisted)
│   │   ├── dashboardStore.ts        # Dashboard data state
│   │   ├── detailedAnalyticsStore.ts
│   │   ├── eventStore.ts            # Event data state
│   │   ├── eventTransactionStore.ts
│   │   ├── feedbackStore.ts         # Feedback state
│   │   ├── organiserEventStore.ts
│   │   ├── organiserStore.ts        # Organiser data state
│   │   ├── transactionStore.ts      # Transaction state
│   │   ├── userEventStore.ts
│   │   └── userStore.ts             # User data state
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── activity.ts
│   │   ├── admin.ts
│   │   ├── event.ts
│   │   ├── feedback.ts
│   │   ├── index.ts                 # Main types export
│   │   ├── location.ts
│   │   ├── profile.ts
│   │   └── transaction.ts
│   │
│   └── utils/                       # Utility functions
│       └── api.ts                   # Axios instance & interceptors
│
├── Configuration Files
│   ├── package.json                 # Project dependencies
│   ├── tsconfig.json               # TypeScript base configuration
│   ├── tsconfig.app.json           # TypeScript app configuration
│   ├── tsconfig.node.json          # TypeScript Node configuration
│   ├── vite.config.ts              # Vite build configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── eslint.config.js            # ESLint configuration
│   └── index.html                  # HTML entry point
```

---

## Core Concepts

### 1. **Authentication System**
The app uses a multi-step authentication process:
- **Login**: Email and password submission
- **OTP Verification**: Two-factor authentication via OTP
- **Token Management**: JWT tokens (access & refresh) stored in Zustand
- **Session Persistence**: Auth state saved in localStorage

### 2. **Protected Routes**
`ProtectedRoute` component wraps authenticated pages and redirects unauthenticated users to login.

### 3. **State Management**
**Zustand stores** manage global state and persist to localStorage:
- `authStore`: Authentication and user info
- `dashboardStore`: Dashboard metrics
- `eventStore`: Event data
- `userStore`: User data
- `organiserStore`: Organiser data
- Additional domain-specific stores

### 4. **Service Layer**
Services handle all API communication and abstract implementation details:
```typescript
// Example pattern
export const eventService = {
  fetchEvents: async () => { /* API call */ },
  createEvent: async (data) => { /* API call */ },
  updateEvent: async (id, data) => { /* API call */ },
  deleteEvent: async (id) => { /* API call */ },
};
```

### 5. **API Interceptors**
- **Request Interceptor**: Attaches Bearer token to all requests
- **Response Interceptor**: Handles 401 errors by refreshing tokens

### 6. **Theme Context**
Supports light/dark mode switching via React Context.

---

## Setup & Installation

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm or yarn package manager
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/chrisakin/fanect-ppv-admin.git
   cd fanect-ppv-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create environment configuration**
   Create a `.env.local` file in the project root:
   ```env
   VITE_BASE_URL=https://api.example.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at `http://localhost:5173` (or configured Vite port)

5. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```
   Output will be in the `dist/` directory

6. **Preview production build**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

7. **Run linter**
   ```bash
   npm run lint
   # or
   yarn lint
   ```

---

## Development Guide

### Creating a New Page

1. Create a new file in `src/pages/[feature]/FeaturePage.tsx`
2. Use the admin layout with proper structure:
   ```typescript
   import React from 'react';
   import { useFeatureStore } from '../store/featureStore';
   import { Card } from '../components/ui/card';

   export default function FeaturePage() {
     const { data, loading } = useFeatureStore();

     return (
       <div className="space-y-6">
         <h1 className="text-3xl font-bold">Feature Title</h1>
         {loading ? (
           <LoadingSpinner />
         ) : (
           <Card>
             {/* Your content */}
           </Card>
         )}
       </div>
     );
   }
   ```
3. Add the route in `App.tsx`:
   ```typescript
   <Route path="/feature" element={<FeaturePage />} />
   ```
4. Add navigation link in `Sidebar.tsx`

### Creating a New Service

1. Create `src/services/featureService.ts`
2. Define request/response types
3. Export service object with API methods:
   ```typescript
   export const featureService = {
     fetchFeatures: async (params?) => {
       const response = await api.get('/admin/features', { params });
       return response.data;
     },
     createFeature: async (data) => {
       const response = await api.post('/admin/features', data);
       return response.data;
     },
     // ... more methods
   };
   ```

### Creating a New Zustand Store

1. Create `src/store/featureStore.ts`
2. Define state interface and store:
   ```typescript
   import { create } from 'zustand';
   
   interface FeatureState {
     features: Feature[];
     loading: boolean;
     error: string | null;
     
     setFeatures: (features: Feature[]) => void;
     setLoading: (loading: boolean) => void;
     setError: (error: string | null) => void;
   }
   
   export const useFeatureStore = create<FeatureState>((set) => ({
     features: [],
     loading: false,
     error: null,
     
     setFeatures: (features) => set({ features }),
     setLoading: (loading) => set({ loading }),
     setError: (error) => set({ error }),
   }));
   ```

### Creating a New UI Component

1. Create component in `src/components/ui/component-name.tsx`
2. Use Radix UI + Tailwind for styling
3. Support dark mode using dark: prefix
4. Export component:
   ```typescript
   interface ComponentProps {
     // Define props
   }
   
   export function Component({ ...props }: ComponentProps) {
     return (
       <div className="...dark:...">
         {/* Component content */}
       </div>
     );
   }
   ```

---

## API Integration

### Axios Configuration

**File**: `src/utils/api.ts`

The axios instance is configured with:
- **Base URL**: From `VITE_BASE_URL` environment variable
- **Timeout**: 10000ms (10 seconds)
- **Request Interceptor**: Adds Bearer token to headers
- **Response Interceptor**: Handles token refresh on 401 errors

```typescript
// Usage in services
import api from '../utils/api';

const response = await api.get('/admin/events');
const data = await api.post('/admin/events', { title: '...' });
```

### Token Management

The `tokenManager` utility handles tokens:
```typescript
tokenManager.getAccessToken()     // Retrieve access token
tokenManager.setTokens(a, r)      // Update tokens
tokenManager.clearTokens()        // Clear on logout
tokenManager.isAuthenticated()    // Check auth status
```

### API Endpoints Structure

```
Base URL: /admin/

Auth Endpoints:
  POST   /auth/login                 # Login
  POST   /auth/verify                # Verify OTP
  POST   /auth/resend-otp            # Resend OTP
  POST   /auth/forgot-password       # Request password reset
  POST   /auth/reset/{token}         # Reset password
  GET    /auth/profile               # Get user profile
  POST   /auth/logout                # Logout
  POST   /auth/refresh               # Refresh tokens

Event Endpoints:
  GET    /events                     # List events
  GET    /events/{id}                # Get event details
  POST   /events                     # Create event
  PUT    /events/{id}                # Update event
  DELETE /events/{id}                # Delete event

User Endpoints:
  GET    /users                      # List users
  GET    /users/{id}                 # Get user details
  POST   /users                      # Create user
  PUT    /users/{id}                 # Update user
  DELETE /users/{id}                 # Delete user

Organiser Endpoints:
  GET    /organisers                 # List organisers
  GET    /organisers/{id}            # Get organiser details
  POST   /organisers                 # Create organiser
  PUT    /organisers/{id}            # Update organiser
  DELETE /organisers/{id}            # Delete organiser

Transaction Endpoints:
  GET    /transactions               # List transactions
  GET    /transactions/{id}          # Get transaction details

(More endpoints for admins, feedback, locations, analytics, etc.)
```

---

## State Management

### Zustand Store Pattern

All stores follow the Zustand pattern:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  // State properties
  data: DataType[];
  loading: boolean;
  error: string | null;
  
  // Action methods
  setData: (data: DataType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      data: [],
      loading: false,
      error: null,
      
      setData: (data) => set({ data }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'store-name',
      partialize: (state) => ({
        // Only persist these fields
        data: state.data,
      }),
    }
  )
);
```

### Using Stores in Components

```typescript
import { useFeatureStore } from '../store/featureStore';

function MyComponent() {
  const { data, loading, setData } = useFeatureStore();
  
  return <div>...</div>;
}
```

---

## Authentication Flow

### Login Process

```
User enters credentials
         ▼
authService.login(email, password)
         ▼
API returns: { message: "...", data?: any }
         ▼
User prompted to verify OTP
         ▼
User enters OTP code
         ▼
authService.verifyOTP(email, code)
         ▼
API returns: { accessToken, refreshToken }
         ▼
Tokens stored in authStore (persisted to localStorage)
         ▼
User profile fetched and stored
         ▼
User redirected to dashboard
```

### Protected Route Flow

```
User navigates to protected route
         ▼
ProtectedRoute component checks isAuthenticated
         ▼
If authenticated: render protected content
If not authenticated: redirect to /login
         ▼
useAuthStore provides auth state globally
```

### Token Refresh Flow

```
API request made with existing access token
         ▼
If response is 401 (Unauthorized)
         ▼
Response interceptor catches error
         ▼
Refresh token sent to /admin/auth/refresh
         ▼
New access token received
         ▼
Original request retried with new token
         ▼
If refresh fails: user redirected to /login
```

---

## Key Features

### 1. Dashboard
- Real-time metrics (live events, tickets sold, revenue)
- Stream health monitoring
- User activity overview
- Recent transactions display

### 2. Event Management
- Create, edit, and delete events
- Event status tracking (Draft, Pending, Live, Completed)
- Event metrics and analytics
- Revenue reports per event
- Live stream player
- Event history

### 3. User Management
- View all users
- User profiles and details
- User status (Active/Inactive)
- Track user activity and events joined
- Lock/unlock user accounts

### 4. Organiser Management
- Manage event organisers
- KYC status tracking
- Organiser analytics and metrics
- Revenue per organiser

### 5. Admin Management
- Create and manage admin accounts
- Role assignments
- Admin activity tracking

### 6. Payment & Transactions
- Transaction history
- Multiple payment gateway support (Paystack, Stripe)
- Transaction filtering by status, gateway, type
- Revenue analytics
- Currency support

### 7. Analytics & Reporting
- Event performance metrics
- Revenue trends
- User engagement analytics
- Stream health metrics
- Detailed analytics dashboards

### 8. Support & Feedback
- Support ticket management
- User feedback tracking
- Ticket status and priority management
- Resolution tracking

### 9. Settings
- Platform configuration
- System settings
- Admin profile management

### 10. Responsive Design
- Desktop navigation (sidebar)
- Mobile-responsive layout
- Mobile sidebar navigation
- Dark/light theme support

---

## Component Architecture

### Layout Components

**AdminLayout** (`src/components/layout/AdminLayout.tsx`)
- Main wrapper for authenticated pages
- Manages sidebar visibility
- Passes layout context to child routes
- Responsive design (desktop sidebar + mobile sidebar)

**Header** (`src/components/layout/Header.tsx`)
- Top navigation bar
- User profile menu
- Notifications
- Mobile menu toggle

**Sidebar** (`src/components/layout/Sidebar.tsx`)
- Desktop navigation
- Menu items for all admin features
- Active route highlighting
- Theme toggle

**MobileSidebar** (`src/components/layout/MobileSidebar.tsx`)
- Mobile-optimized navigation
- Slide-out drawer
- Touch-friendly menu items

### Page Components

Page components are located in `src/pages/[feature]/` and typically:
1. Fetch data from stores or services
2. Handle data transformations
3. Render feature-specific UI
4. Handle page-level state

### UI Components

Located in `src/components/ui/`, these are reusable components:
- **Card**: Container with consistent styling
- **Button**: Multiple variants and sizes
- **Input**: Text input fields
- **Dialog/Modal**: Modal windows
- **Dropdown**: Select menus
- **Date Picker**: Date selection
- **Loading Spinner**: Loading state indicator
- **Error Alert**: Error messages
- **Tables**: Data display
- **Filters**: Data filtering controls

---

## Styling & UI

### Tailwind CSS

The project uses **Tailwind CSS** for styling with:
- Utility-first approach
- Dark mode support (prefixed with `dark:`)
- Responsive breakpoints (sm, md, lg, xl, 2xl)
- Custom theme configurations

### Class Composition

Use **clsx** for conditional classes and **tailwind-merge** to merge classes intelligently:

```typescript
import clsx from 'clsx';

<div className={clsx(
  'base-classes',
  isActive && 'active-classes',
  isDisabled && 'disabled-classes'
)}>
  Content
</div>
```

### Dark Mode

Dark mode classes are prefixed with `dark:`:

```tsx
<div className="bg-white dark:bg-gray-950">
  Content that adapts to dark mode
</div>
```

### Color Scheme

- **Primary**: Blue shades
- **Success**: Green shades
- **Warning**: Yellow/Orange shades
- **Error**: Red shades
- **Neutral**: Gray shades

### Responsive Design

Breakpoints follow Tailwind defaults:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Example:
```tsx
<div className="hidden lg:block">Desktop only</div>
<div className="lg:hidden">Mobile only</div>
```

---

## Configuration

### Environment Variables

Create `.env.local` with:
```env
VITE_BASE_URL=https://api.example.com
```

The app will use this for API requests.

### Vite Configuration

**File**: `vite.config.ts`

- React plugin enabled
- Lucide React excluded from optimization
- Hot module replacement enabled

### TypeScript Configuration

**Files**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

- Strict mode enabled
- ES2020 target
- JSX support

### Tailwind Configuration

**File**: `tailwind.config.js`

- Extended theme with custom colors
- Dark mode support
- Custom spacing and sizes

### ESLint Configuration

**File**: `eslint.config.js`

- JavaScript and TypeScript linting
- React hooks rules
- React refresh rules

---

## Best Practices

### Code Organization

1. **Keep components focused**: Each component should have a single responsibility
2. **Extract reusable logic**: Use custom hooks for shared logic
3. **Use service layer**: All API calls go through services
4. **Type everything**: Use TypeScript extensively
5. **Organize by feature**: Group related files by feature

### State Management

1. **Use Zustand stores** for global state
2. **Persist only necessary data**: Use `partialize` to persist specific fields
3. **Keep stores focused**: One store per domain (auth, events, users, etc.)
4. **Actions should be simple**: Complex logic belongs in services

### Performance

1. **Lazy load pages**: Use React Router's lazy loading for pages
2. **Memoize expensive operations**: Use `useMemo` and `useCallback`
3. **Optimize renders**: Use proper dependency arrays in hooks
4. **Image optimization**: Use appropriate formats and sizes

### Error Handling

1. **Try-catch in services**: All API calls should handle errors
2. **Error boundaries**: Wrap page components with error boundaries
3. **User feedback**: Show meaningful error messages
4. **Logging**: Use console for development, integrate logging service for production

### Security

1. **JWT token storage**: Tokens stored in Zustand (persisted to localStorage)
2. **HTTPS only**: Always use HTTPS in production
3. **Token refresh**: Implement proper token refresh logic
4. **XSS prevention**: Sanitize user input, use React's built-in escaping
5. **CSRF protection**: Backend should implement CSRF tokens if needed

### Accessibility

1. **Semantic HTML**: Use proper HTML elements
2. **ARIA attributes**: Add aria labels where needed
3. **Keyboard navigation**: Ensure all controls are keyboard accessible
4. **Color contrast**: Maintain adequate color contrast
5. **Focus management**: Manage focus for modals and dynamic content

### Code Quality

1. **ESLint**: Run `npm run lint` regularly
2. **TypeScript strict mode**: Enable strict checks
3. **Code reviews**: Review PRs for quality
4. **Testing**: Add unit and integration tests
5. **Documentation**: Keep code and docs in sync

### Git Workflow

1. **Feature branches**: Create branches for new features
2. **Meaningful commits**: Write descriptive commit messages
3. **Pull requests**: Create PRs for code review
4. **Version tags**: Use semantic versioning for releases

---

## Troubleshooting

### Common Issues

**Q: Build fails with TypeScript errors**
A: Run `npm run lint` to identify issues, fix errors, then rebuild

**Q: API requests return 401 Unauthorized**
A: Check if tokens are properly stored in authStore. Verify `VITE_BASE_URL` is correct.

**Q: Dark mode not working**
A: Ensure ThemeProvider wraps the app and theme classes are applied correctly

**Q: Components not rendering**
A: Check console for errors, verify imports, ensure all props are passed correctly

**Q: Styling looks different**
A: Clear browser cache, run `npm install` again to ensure Tailwind is up to date

### Debug Tips

1. Use React DevTools browser extension
2. Use Redux DevTools for store inspection (Zustand compatible)
3. Check Network tab in DevTools for API calls
4. Use `console.log` for debugging
5. Check browser console for errors and warnings

---

## Future Enhancements

Potential areas for improvement:

1. **Testing**: Add comprehensive unit and integration tests
2. **E2E Testing**: Implement E2E tests with Cypress or Playwright
3. **Performance Monitoring**: Integrate performance monitoring service
4. **Analytics**: Add analytics tracking
5. **Internationalization**: Support multiple languages
6. **Advanced Caching**: Implement advanced caching strategies
7. **Offline Support**: Add offline capabilities
8. **Real-time Updates**: Implement WebSocket for real-time data
9. **Advanced Search**: Add full-text search capabilities
10. **Export Features**: Add export to CSV/PDF functionality

---

## Support & Contributing

For issues or questions:
1. Check existing issues on GitHub
2. Create detailed bug reports with reproduction steps
3. Follow code style guidelines
4. Submit pull requests with clear descriptions

---

## License

[Add appropriate license information]

---

## Changelog

### Version 0.0.0
- Initial project setup
- Authentication system
- Dashboard implementation
- Event management
- User management
- Payment tracking
- Analytics dashboards

---

**Last Updated**: November 20, 2025
**Project Name**: FaNect PPV Admin Dashboard
**Repository**: https://github.com/chrisakin/fanect-ppv-admin
