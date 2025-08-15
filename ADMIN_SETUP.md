# Admin Panel Setup Guide

## Firebase Configuration Required

### 1. Firestore Database Indexes

The admin system requires composite indexes for queries. You'll need to create these indexes in the Firebase Console:

#### Products Collection Indexes
Navigate to: [Firebase Console > Firestore Database > Indexes](https://console.firebase.google.com/project/app1000banks/firestore/indexes)

**Required Index 1: Products Active Query**
- Collection ID: `products`
- Fields to index:
  - `isActive` (Ascending)
  - `createdAt` (Descending)
  - `__name__` (Ascending)

**Required Index 2: Products Admin Query**
- Collection ID: `products`
- Fields to index:
  - `createdAt` (Descending)
  - `__name__` (Ascending)

#### Courses Collection Indexes

**Required Index 1: Courses Active Query**
- Collection ID: `courses`
- Fields to index:
  - `isActive` (Ascending)
  - `createdAt` (Descending)
  - `__name__` (Ascending)

**Required Index 2: Courses Admin Query**
- Collection ID: `courses`
- Fields to index:
  - `createdAt` (Descending)
  - `__name__` (Ascending)

### 2. Firestore Security Rules

Update your Firestore security rules to allow admin operations:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && isAdmin();
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && isAdmin();
    }
    
    // Courses collection
    match /courses/{courseId} {
      allow read: if true; // Public read
      allow write: if request.auth != null && isAdmin();
    }
    
    // Carts collection
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Purchases collection
    match /purchases/{purchaseId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.uid || isAdmin());
    }
    
    // Enrollments collection
    match /enrollments/{enrollmentId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.uid || isAdmin());
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 3. Admin Account Setup

1. **Create Admin User in Firebase Auth:**
   - Go to Firebase Console > Authentication > Users
   - Add user with email: `admin@1000banks.com`
   - Set password: `admin@1000banks` (or your preferred secure password)

2. **Mark User as Admin in Firestore:**
   - Go to Firestore Database > users collection
   - Create/update document with the admin user's UID
   - Add field: `isAdmin: true`

### 4. Firestore Collections Structure

The admin system will create the following collections:

#### Products Collection
```javascript
{
  id: "auto-generated",
  name: "string",
  description: "string",
  fullDescription: "string (optional)",
  price: "string",
  image: "string (emoji)",
  imageUrl: "string (optional)",
  category: "string",
  stock: "number",
  features: ["array of strings"],
  specifications: {"key": "value"} object,
  isActive: "boolean",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

#### Courses Collection
```javascript
{
  id: "auto-generated",
  title: "string",
  description: "string",
  price: "string",
  image: "string (emoji)",
  curriculum: ["array of strings"],
  duration: "string",
  level: "Beginner|Intermediate|Advanced",
  category: "string",
  instructor: "string",
  rating: "number",
  studentsCount: "number",
  isActive: "boolean",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

## How to Access Admin Panel

### Method 1: During Login
1. Sign in with admin email: `admin@1000banks.com`
2. You'll see a dialog asking to choose between "Normal Account" or "Admin Account"
3. Select "Admin Account" to go to the admin dashboard

### Method 2: From Account Screen
1. Sign in with admin email normally
2. Go to Account tab
3. You'll see "Admin Dashboard" option in the settings
4. Tap to access admin panel

## Admin Features Available

### Product Management (`/admin-products`)
- View all products (active and inactive)
- Add new products with:
  - Name, description, full description
  - Price and stock quantity
  - Category selection
  - Image upload from camera/gallery
  - Emoji icon selection
  - Features list (add/remove)
  - Specifications (key-value pairs)
  - Active/inactive toggle
- Edit existing products
- Delete products

### Course Management (`/admin-courses`)
- View all courses
- Add new courses with:
  - Title and description
  - Price and duration
  - Instructor name
  - Category and level selection
  - Image upload from camera/gallery
  - Emoji icon selection
  - Curriculum builder (add/remove modules)
  - Active/inactive toggle
- Edit existing courses
- Delete courses

### Dashboard Features
- Statistics overview (total/active products and courses)
- Quick action buttons for adding products/courses
- Navigation to all admin features
- Back to main app functionality

## Troubleshooting

### Index Creation
If you see errors about missing indexes, click the links in the error messages to automatically create them in Firebase Console.

### Permission Issues
Make sure:
1. The admin user has `isAdmin: true` in their Firestore user document
2. Firestore security rules are properly configured
3. The admin email is correctly set in `firebase.ts` (checkAdminEmail method)

### Image Upload
Currently using expo-image-picker for local images. In production, you may want to:
1. Set up Firebase Storage
2. Upload images to Storage
3. Store download URLs in Firestore

## Security Considerations

1. **Admin Email Configuration**: Update the admin email list in `firebase.ts` for production
2. **Firestore Rules**: Ensure admin checks are properly implemented
3. **Image Storage**: Consider proper image storage solution for production
4. **Backup Strategy**: Regular backup of Firestore data recommended

## Development vs Production

### Development
- Uses local image picker
- Single admin email hardcoded
- Basic security rules

### Production Recommendations
- Implement Firebase Storage for images
- Use environment variables for admin configuration
- Enhanced security rules
- Audit logging for admin actions
- Multi-factor authentication for admin accounts