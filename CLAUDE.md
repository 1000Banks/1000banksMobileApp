# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native application built with Expo (v53) called "1000Banks" - a fintech educational and e-commerce platform. The app uses:

- **React Native 0.79.5** with **React 19.0.0**
- **Expo Router** for file-based routing
- **TypeScript** with strict mode enabled
- **Firebase Authentication** and **Firestore** for backend services
- **React Native Firebase** modular SDK (v22.4.0)

## Development Commands

### Core Development
- `npm install` - Install dependencies
- `npm start` or `npx expo start` - Start development server with dev client
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS  
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint

### Project Management
- `npm run reset-project` - Reset to blank app structure (moves starter code to app-example/)

## Architecture

### App Structure
- **File-based routing**: Uses Expo Router with `app/` directory for routes
- **Component architecture**: Reusable components in `components/` directory
- **Authentication flow**: Firebase Auth integration with email/password signup/signin

### Key Directories
- `app/` - Screen components and routing using Expo Router file-based routing
- `components/` - Reusable UI components including SplashScreen, ThemedText, ThemedView
- `contexts/` - React Context providers for global state management
- `constants/` - App constants like Colors
- `hooks/` - Custom React hooks (useColorScheme, useThemeColor)
- `assets/` - Images, fonts, and static assets
- `android/` - Android-specific configuration and native code

### Firebase Integration
- **Authentication**: Email/password and Google Sign-In providers
- **Firestore Database**: Real-time data sync for cart, user profiles, courses, and purchases
- **Service Layer**: Complete Firebase service abstraction in `services/firebase.ts`
- **Context Providers**: `AuthContext`, `UserContext`, and `CartContext` for state management
- **Modular SDK**: Uses new Firebase modular API (getFirestore, collection, doc, etc.)

**Required Configuration**:
- Replace `YOUR_WEB_CLIENT_ID` in `/app/auth.tsx` with actual Firebase Web Client ID
- Enable Firestore Database in Firebase Console
- Set security rules as documented in FIREBASE_SETUP.md

### Design System
Based on the dark-themed fintech design inspiration in `mobile app design.webp`:

**Color Palette:**
- **Primary Gold:** #F5B800 (buttons, accents, branding)
- **Dark Background:** #000000 (main background)
- **Card Background:** #1A1A1A (cards, containers)
- **Text Primary:** #FFFFFF (main text)
- **Text Secondary:** #9CA3AF (secondary text, placeholders)
- **Success Green:** #10B981 (positive values, gains)
- **Error Red:** #EF4444 (negative values, losses)

**Design Principles:**
- Dark theme throughout the application
- Golden yellow (#F5B800) as primary brand color
- Rounded corners (12-24px border radius)
- Card-based layouts with subtle backgrounds
- Clean typography with high contrast
- Consistent spacing and padding

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured: `@/*` maps to project root
- Expo TypeScript base configuration extended

## Platform Configuration

### iOS
- Bundle ID: `com.example.1000banks`
- Supports tablets
- Uses static frameworks via expo-build-properties

### Android
- Package: `com.example.banks1000`
- Edge-to-edge enabled
- Uses new React Native architecture (newArchEnabled: true)

### Testing
No dedicated test setup configured - uses default Expo/React Native testing capabilities.

## Firebase Database Architecture

### Collections Structure
- **users**: User profiles with auth provider info
- **courses**: Course catalog with curriculum and pricing
- **products**: E-commerce product listings
- **carts**: User shopping carts (real-time sync)
- **purchases**: Transaction history
- **enrollments**: Course enrollment and progress tracking

### Real-time Features
- Cart syncs across devices when user is authenticated
- User profile updates reflect immediately
- Course enrollments tracked with progress

## Important Design Guidelines

When working with this codebase, ensure all new screens and components follow the established design system:

1. **Use AppColors constants** from `constants/Colors.ts` instead of hardcoded colors
2. **Follow the dark theme** - all backgrounds should use `AppColors.background.dark` or `AppColors.background.card`
3. **Use golden yellow (#F5B800)** for primary actions, buttons, and accents
4. **Maintain consistent spacing** - use multiples of 8px (8, 16, 24, 32)
5. **Round corners** - use 12-24px border radius for cards and buttons
6. **High contrast text** - white (#FFFFFF) on dark backgrounds, gray (#9CA3AF) for secondary text

## Application Architecture

### E-commerce & Educational Platform
The app combines fintech education with e-commerce functionality:

**Core Features:**
- **Course Catalog**: Browse and purchase financial education courses with detailed curriculum
- **Product Shop**: Merchandise and financial products with cart functionality
- **Investment Programs**: Information about 1000Streams and other investment opportunities
- **Educational Content**: Trading signals, coaching programs, and financial planning services

### State Management Architecture

**Provider Hierarchy** (in `app/_layout.tsx`):
```
AuthProvider
  └── UserProvider
      └── CartProvider
          └── App Content
```

- **AuthContext**: Firebase authentication state and methods
- **UserContext**: User profile, enrollments, purchases, and Firestore sync
- **CartContext**: Shopping cart with Firebase backend integration
  - Automatic cart persistence for authenticated users
  - Real-time cart sync across devices
  - Supports both 'product' and 'course' item types
  
### Navigation Architecture
- **File-based routing** with Expo Router
- **Bottom tab navigation** (Home, Courses, Shop, Trading, Account)
- **AppHeader Component**: Consistent header across all tabs with:
  - Hamburger menu with navigation options
  - User profile icon (shows initials when logged in)
  - Shopping cart with badge count
  - Dynamic auth state handling
- **Splash Screen**: Only shows on initial app load (uses `useSplashScreen` hook)

### Screen Organization
**Main Screens:**
- `index.tsx` - Multi-tab home screen with embedded navigation
- `courses.tsx` - Course catalog with filtering and search
- `course-detail.tsx` - Individual course information and enrollment
- `checkout.tsx` - Unified checkout for both courses and products

**Information Pages:**
- `about.tsx` - Company information, mission, values, team
- `services.tsx` - Detailed service offerings and programs
- `contact.tsx` - Contact form, business information, social links
- `faq.tsx` - Searchable FAQ with categories and expandable answers
- `hiring.tsx` - Job listings with department filtering and application flow

**Utility Screens:**
- `auth.tsx` - Firebase authentication flow
- `+not-found.tsx` - 404/error page

### Data Architecture
- **Firebase Backend**: Full Firestore integration for dynamic data with admin management
- **Hybrid Data**: Courses and products fetch from Firebase first, fallback to static data
- **Real-time Sync**: Cart and user data sync across devices
- **Offline Support**: Firebase handles offline caching automatically

### Component Patterns
- **Reusable UI Components**: Consistent styling and behavior across screens  
- **Context Providers**: Wrap entire app for global state access
- **TypeScript Interfaces**: Strong typing for data structures (Course, CartItem, FAQItem, JobListing)
- **Responsive Design**: Adapts to different screen sizes using Dimensions API

### Key Development Patterns
- Use `useRouter()` from expo-router for navigation
- Access authentication via `useAuth()` hook
- Access user data via `useUser()` hook  
- Access cart functionality via `useCart()` hook
- Follow AppColors constants for consistent theming
- Use AppHeader component with `showMenuAndCart={true}` for main screens
- Implement smooth animations using React Native's Animated API
- Use SafeAreaView for proper screen boundaries
- Handle form validation with Alert feedback

## Common Development Tasks

### Running on Android with Firebase
If you encounter Firebase configuration issues:
1. Ensure `google-services.json` is in the `android/app/` directory
2. Clean and rebuild: `cd android && ./gradlew clean && cd .. && npm run android`

### Running on iOS with Firebase  
1. Ensure `GoogleService-Info.plist` is linked in Xcode
2. Run `cd ios && pod install && cd ..`
3. Then `npm run ios`

### Debugging Firebase Issues
- Check Firebase Console for proper service enablement
- Verify authentication providers are enabled
- Ensure Firestore security rules match the app's data structure
- Use React Native Debugger to inspect context values

## Admin System

### Admin Authentication & Access
- **Dual Admin Check**: Requires both email whitelist (`admin@1000banks.com`) AND Firestore `isAdmin: true` flag
- **Access Methods**: 
  - Dialog choice during admin email login
  - "Admin Dashboard" button in Account settings for admin users
- **Security**: Two-factor verification prevents unauthorized admin access

### Admin Features
- **Product Management** (`/admin-products`): Full CRUD operations with image picker, features, specifications
- **Course Management** (`/admin-courses`): Full CRUD operations with curriculum builder, categories, levels  
- **Dashboard** (`/admin-dashboard`): Statistics overview and quick actions
- **Real-time Updates**: Admin changes immediately reflect in user-facing screens

### Required Firebase Setup for Admin
- **Firestore Indexes**: Composite indexes required for products/courses queries (see ADMIN_SETUP.md)
- **Security Rules**: Admin verification function in Firestore rules
- **Admin User Document**: Must have `isAdmin: true` boolean field in users collection
- **Admin Email**: Configured in `services/firebase.ts` checkAdminEmail method

### Admin Data Flow
- All screens fetch from Firebase first, fallback to static data
- Admin-created content appears immediately in courses/shop screens
- Course detail screen supports both Firebase and static course formats
- Products support extended fields (fullDescription, features, specifications)