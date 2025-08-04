# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native application built with Expo (v53) called "1000Banks" - a fintech mobile application for banking and financial services. The app uses:

- **React Native 0.79.5** with **React 19.0.0**
- **Expo Router** for file-based routing
- **TypeScript** with strict mode enabled
- **Firebase Authentication** for user management
- **React Native Firebase** for backend services

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
- `app/` - Screen components and routing (index.tsx = home, auth.tsx = authentication)
- `components/` - Reusable UI components including SplashScreen, ThemedText, ThemedView
- `constants/` - App constants like Colors
- `hooks/` - Custom React hooks (useColorScheme, useThemeColor)
- `assets/` - Images, fonts, and static assets
- `android/` - Android-specific configuration and native code

### Firebase Integration
- Authentication configured with email/password providers
- Google Services files present for both iOS (`GoogleService-Info.plist`) and Android (`google-services.json`)
- Uses `@react-native-firebase/app` and `@react-native-firebase/auth`

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

## Important Design Guidelines

When working with this codebase, ensure all new screens and components follow the established design system:

1. **Use AppColors constants** from `constants/Colors.ts` instead of hardcoded colors
2. **Follow the dark theme** - all backgrounds should use `AppColors.background.dark` or `AppColors.background.card`
3. **Use golden yellow (#F5B800)** for primary actions, buttons, and accents
4. **Maintain consistent spacing** - use multiples of 8px (8, 16, 24, 32)
5. **Round corners** - use 12-24px border radius for cards and buttons
6. **High contrast text** - white (#FFFFFF) on dark backgrounds, gray (#9CA3AF) for secondary text