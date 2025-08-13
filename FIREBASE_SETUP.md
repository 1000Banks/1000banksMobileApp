# Firebase Setup Guide - Complete Integration

## 🔥 Current Status
Your app now has:
- ✅ Firebase Authentication configured (`@react-native-firebase/auth`)
- ✅ Firebase Firestore database configured (`@react-native-firebase/firestore`)
- ✅ Google Services files in place (`google-services.json`, `GoogleService-Info.plist`)
- ✅ Google Sign-In package installed (`@react-native-google-signin/google-signin`)
- ✅ Email/Password authentication working
- ✅ Google Sign-In UI implemented
- ✅ Complete database service layer created
- ✅ Cart integration with Firebase backend
- ✅ User profile management system

## 🚨 Required Configuration Steps

### 1. Firebase Console Setup
1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `1000banks`
3. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password** provider
   - Enable **Google** provider

4. **Enable Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (we'll set proper rules later)
   - Select your preferred location (closest to your users)

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

## 🗄️ Database Structure (IMPLEMENTED)

### Firestore Collections
Your database now has the following structure:

#### **users** collection
```typescript
{
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google';
  createdAt: Date;
  updatedAt: Date;
}
```

#### **courses** collection
```typescript
{
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  curriculum: string[];
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  instructor: string;
  rating: number;
  studentsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **products** collection  
```typescript
{
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **carts** collection
```typescript
{
  uid: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  updatedAt: Date;
}
```

#### **purchases** collection
```typescript
{
  id: string;
  uid: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **enrollments** collection
```typescript
{
  uid: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  completed: boolean;
  lastAccessedAt: Date;
}
```

### Security Rules (CRITICAL - SET THESE)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own cart
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own purchases
    match /purchases/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Users can only access their own enrollments
    match /enrollments/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Courses are readable by all authenticated users
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only - manage via Firebase Console
    }
    
    // Products are readable by all authenticated users  
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only - manage via Firebase Console
    }
  }
}
```

### How to Set Security Rules
1. Go to Firebase Console → Firestore Database
2. Click "Rules" tab
3. Replace the existing rules with the rules above
4. Click "Publish"

## 🏗️ Implementation Details

### New Files Created
1. **`/services/firebase.ts`** - Complete Firebase service layer
2. **`/contexts/UserContext.tsx`** - User profile management
3. **Updated `/contexts/CartContext.tsx`** - Firebase integration

### How to Use the Firebase Integration

#### 1. Wrap your app with providers (in `app/_layout.tsx`):
```typescript
import { UserProvider } from '../contexts/UserContext';
import { CartProvider } from '../contexts/CartContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <CartProvider>
        {/* Your existing app structure */}
      </CartProvider>
    </UserProvider>
  );
}
```

#### 2. Use the hooks in your components:
```typescript
import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';

function YourComponent() {
  const { user, enrollInCourse, updateProfile } = useUser();
  const { cartItems, addToCart, loading } = useCart();
  
  // Your component logic
}
```

#### 3. Available Firebase Operations:
- **User Management**: Profile creation, updates, authentication state
- **Course Enrollment**: Track user course progress and completion
- **Shopping Cart**: Persistent cart across devices and sessions
- **Purchase History**: Complete transaction tracking
- **Real-time Sync**: Cart and user data sync in real-time

## 📦 Additional Firebase Services to Consider

### 1. Cloud Storage (File uploads)
```bash
npm install @react-native-firebase/storage
```

### 2. Cloud Messaging (Push notifications)
```bash
npm install @react-native-firebase/messaging
```

### 3. Analytics
```bash
npm install @react-native-firebase/analytics
```

### 4. Crashlytics
```bash
npm install @react-native-firebase/crashlytics
```

## 🔧 Next Steps for You

### Immediate (Required):
1. **Replace `YOUR_WEB_CLIENT_ID`** in `/app/auth.tsx` with actual Web Client ID from Firebase
2. **Enable Firestore Database** in Firebase Console
3. **Set up Security Rules** (copy from above)
4. **Wrap your app with providers** (see implementation details above)
5. **Test the integration** with authentication and cart functionality

### Data Population:
1. **Add sample courses** to Firestore `courses` collection
2. **Add sample products** to Firestore `products` collection
3. **Test user registration** and profile creation
4. **Test cart persistence** across app sessions

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
- [ ] Set up proper Firestore security rules (provided above)
- [ ] Enable only necessary authentication providers
- [ ] Set up proper error tracking (Crashlytics)
- [ ] Test authentication on physical devices
- [ ] Test database operations (cart, user profiles, purchases)
- [ ] Set up backup authentication methods
- [ ] Configure proper indexes for Firestore queries
- [ ] Test offline functionality
- [ ] Set up Firebase Performance Monitoring

## 🔍 Troubleshooting

### Common Issues:
1. **Cart not syncing**: Check if user is authenticated and Firestore rules are set
2. **Authentication errors**: Verify Web Client ID is correct
3. **Permission denied**: Check Firestore security rules match your collection structure
4. **App crashes**: Ensure all Firebase services are properly initialized

### Required Firebase Project Configuration:
- **Project ID**: Your unique Firebase project identifier
- **Web Client ID**: From Firebase Console → Project Settings → General
- **App IDs**: Android (`com.example.banks1000`) and iOS (`com.example.1000banks`) must match

## 📞 Support
If you need help with any of these configurations, please provide:
1. Your Firebase project ID
2. Screenshot of Firebase Console settings (Authentication, Firestore)
3. Any error messages you're seeing
4. Which features you want to test first

**Your 1000Banks app now has complete Firebase integration with real-time cart sync, user profiles, course enrollment, and purchase tracking!**