# Firebase Authentication Setup Guide

## 🔥 Current Status
Your app already has:
- ✅ Firebase Authentication configured (`@react-native-firebase/auth`)
- ✅ Google Services files in place (`google-services.json`, `GoogleService-Info.plist`)
- ✅ Google Sign-In package installed (`@react-native-google-signin/google-signin`)
- ✅ Email/Password authentication working
- ✅ Google Sign-In UI implemented

## 🚨 Required Configuration Steps

### 1. Firebase Console Setup
1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `1000banks`
3. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password** provider
   - Enable **Google** provider

### 2. Google Sign-In Configuration
**CRITICAL**: You need to replace the placeholder in `/app/auth.tsx`:

```typescript
// CURRENT (Line 17):
webClientId: 'YOUR_WEB_CLIENT_ID', // You'll need to replace this

// REPLACE WITH:
webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID_FROM_FIREBASE',
```

**To get your Web Client ID:**
1. Firebase Console → Project Settings → General tab
2. Scroll to "Your apps" section
3. Find your web app or create one
4. Copy the "Web client ID"

### 3. Android Configuration
Your `android/app/google-services.json` should contain:
```json
{
  "project_info": {
    "project_id": "your-project-id"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "your-app-id",
        "android_client_info": {
          "package_name": "com.example.banks1000"
        }
      }
    }
  ]
}
```

### 4. iOS Configuration
Your `GoogleService-Info.plist` should contain your iOS app configuration.

## 🗄️ Database Setup Recommendations

### Firestore Database Structure
```
/users/{userId}
  ├── profile/
  │   ├── email: string
  │   ├── displayName: string
  │   ├── photoURL: string
  │   ├── provider: 'google' | 'email'
  │   └── createdAt: timestamp
  ├── courses/
  │   └── {courseId}: { enrolledAt: timestamp, progress: number }
  ├── purchases/
  │   └── {orderId}: { items: array, total: number, date: timestamp }
  └── preferences/
      ├── notifications: boolean
      └── theme: string
```

### Security Rules Example
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Courses are readable by all authenticated users
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
    
    // Products are readable by all authenticated users  
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only
    }
  }
}
```

## 📦 Additional Firebase Services to Consider

### 1. Cloud Firestore (Database)
```bash
npm install @react-native-firebase/firestore
```

### 2. Cloud Storage (File uploads)
```bash
npm install @react-native-firebase/storage
```

### 3. Cloud Messaging (Push notifications)
```bash
npm install @react-native-firebase/messaging
```

### 4. Analytics
```bash
npm install @react-native-firebase/analytics
```

### 5. Crashlytics
```bash
npm install @react-native-firebase/crashlytics
```

## 🔧 Next Steps for You

### Immediate (Required):
1. **Replace `YOUR_WEB_CLIENT_ID`** in `/app/auth.tsx` with actual Web Client ID from Firebase
2. **Enable Google Sign-In** in Firebase Console Authentication settings
3. **Test authentication** on both email/password and Google sign-in

### Recommended (Next Phase):
1. **Install Firestore**: `npm install @react-native-firebase/firestore`
2. **Create user profiles** in Firestore after authentication
3. **Set up database security rules**
4. **Implement user data persistence** for courses and purchases

## 🧪 Testing Authentication

### Test Scenarios:
- ✅ Email/Password sign up with new account
- ✅ Email/Password sign in with existing account  
- ✅ Google sign-in with new Google account
- ✅ Google sign-in with existing Google account
- ✅ Error handling for invalid credentials
- ✅ Error handling for network issues

## 🚀 Production Checklist

### Before Launch:
- [ ] Replace all placeholder IDs with actual Firebase project IDs
- [ ] Set up proper Firestore security rules
- [ ] Enable only necessary authentication providers
- [ ] Set up proper error tracking (Crashlytics)
- [ ] Test authentication on physical devices
- [ ] Set up backup authentication methods
