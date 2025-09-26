import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, addDoc, query, where, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google';
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleContent {
  id: string;
  type: 'video' | 'text' | 'image' | 'audio' | 'pdf';
  title: string;
  description?: string;
  url?: string;
  content?: string;
  duration?: string;
  fileSize?: string;
  isLocked: boolean;
  order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  contents: ModuleContent[];
  isLocked?: boolean; // Module-level lock
}

export interface CourseCurriculum {
  id: string;
  title: string;
  description: string;
  objectives?: string[];
  totalDuration?: string;
  modules: CourseModule[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  objectives?: string[];
  curriculum?: CourseCurriculum; // New structured curriculum
  oldCurriculum?: string[]; // Keep for backward compatibility
  modules?: CourseModule[]; // Keep for backward compatibility
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  instructor: string;
  rating: number;
  studentsCount: number;
  students?: number;
  benefits?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription?: string;
  price: string;
  image: string;
  imageUrl?: string;
  category: string;
  stock: number;
  features?: string[];
  specifications?: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  type: 'product' | 'course';
  quantity: number;
  image?: string;
  description?: string;
}

export interface UserCart {
  uid: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  updatedAt: Date;
}

export interface UserPurchase {
  id: string;
  uid: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCourseEnrollment {
  uid: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  completed: boolean;
  lastAccessedAt: Date;
  completedContents?: string[]; // Array of completed content IDs
}

export interface PaymentMethod {
  id: string;
  uid: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export interface AppSettings {
  general: {
    appName: string;
    appVersion: string;
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
    requireEmailVerification: boolean;
  };
  payment: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    taxRate: number;
    currency: string;
    minimumOrderAmount: number;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    orderConfirmations: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireStrongPasswords: boolean;
    twoFactorRequired: boolean;
  };
  content: {
    autoApproveReviews: boolean;
    moderateComments: boolean;
    allowGuestCheckout: boolean;
    showOutOfStock: boolean;
  };
}

class FirebaseService {
  private db = getFirestore();
  private auth = getAuth();
  private usersCollection = 'users';
  private coursesCollection = 'courses';
  private productsCollection = 'products';
  private cartsCollection = 'carts';
  private purchasesCollection = 'purchases';
  private enrollmentsCollection = 'enrollments';
  private paymentMethodsCollection = 'paymentMethods';
  private auditLogsCollection = 'auditLogs';
  private appSettingsCollection = 'appSettings';

  async createUserProfile(user: Partial<User>): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const userData: User = {
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: user.displayName || currentUser.displayName || '',
      photoURL: user.photoURL || currentUser.photoURL || '',
      provider: user.provider || 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(this.db, this.usersCollection, currentUser.uid), userData);
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async getUserProfile(uid?: string): Promise<User | null> {
    const userId = uid || this.auth.currentUser?.uid;
    if (!userId) return null;

    const docSnap = await getDoc(doc(this.db, this.usersCollection, userId));
    return docSnap.exists() ? (docSnap.data() as User) : null;
  }

  async updateUserProfile(updates: Partial<User>): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    await updateDoc(doc(this.db, this.usersCollection, currentUser.uid), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async getCourses(): Promise<Course[]> {
    const q = query(
      collection(this.db, this.coursesCollection),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Course[];
  }

  async getCourse(courseId: string): Promise<Course | null> {
    const docSnap = await getDoc(doc(this.db, this.coursesCollection, courseId));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Course) : null;
  }

  async getProducts(): Promise<Product[]> {
    const q = query(
      collection(this.db, this.productsCollection),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  }

  async getProduct(productId: string): Promise<Product | null> {
    const docSnap = await getDoc(doc(this.db, this.productsCollection, productId));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Product) : null;
  }

  async saveUserCart(cartItems: CartItem[]): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const total = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return sum + (price * item.quantity);
    }, 0);

    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const cartData: UserCart = {
      uid: currentUser.uid,
      items: cartItems,
      total,
      itemCount,
      updatedAt: new Date(),
    };

    await setDoc(doc(this.db, this.cartsCollection, currentUser.uid), cartData);
  }

  async getUserCart(): Promise<CartItem[]> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return [];

    const docSnap = await getDoc(doc(this.db, this.cartsCollection, currentUser.uid));
    if (!docSnap.exists()) return [];

    const cartData = docSnap.data() as UserCart;
    return cartData.items || [];
  }

  async clearUserCart(): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    await deleteDoc(doc(this.db, this.cartsCollection, currentUser.uid));
  }

  async createPurchase(cartItems: CartItem[], paymentMethod?: string): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const total = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return sum + (price * item.quantity);
    }, 0);

    const purchaseData: Omit<UserPurchase, 'id'> = {
      uid: currentUser.uid,
      items: cartItems,
      total,
      status: 'pending',
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(this.db, this.purchasesCollection), purchaseData);
    return docRef.id;
  }

  async getUserPurchases(): Promise<UserPurchase[]> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return [];

    const q = query(
      collection(this.db, this.purchasesCollection),
      where('uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserPurchase[];
  }

  async updatePurchaseStatus(purchaseId: string, status: UserPurchase['status']): Promise<void> {
    await updateDoc(doc(this.db, this.purchasesCollection, purchaseId), {
      status,
      updatedAt: new Date(),
    });
  }

  async enrollInCourse(courseId: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const enrollmentData: UserCourseEnrollment = {
      uid: currentUser.uid,
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      completed: false,
      lastAccessedAt: new Date(),
    };

    const enrollmentId = `${currentUser.uid}_${courseId}`;
    await setDoc(doc(this.db, this.enrollmentsCollection, enrollmentId), enrollmentData);
  }

  async getUserEnrollments(): Promise<UserCourseEnrollment[]> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return [];

    const q = query(
      collection(this.db, this.enrollmentsCollection),
      where('uid', '==', currentUser.uid),
      orderBy('enrolledAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc: any) => doc.data()) as UserCourseEnrollment[];
  }

  async updateCourseProgress(courseId: string, progress: number, completedContents?: string[]): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const enrollmentId = `${currentUser.uid}_${courseId}`;
    const updateData: any = {
      progress,
      completed: progress >= 100,
      lastAccessedAt: new Date(),
    };
    
    if (completedContents !== undefined) {
      updateData.completedContents = completedContents;
    }
    
    await updateDoc(doc(this.db, this.enrollmentsCollection, enrollmentId), updateData);
  }

  async getEnrollmentDetails(courseId: string): Promise<UserCourseEnrollment | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    const enrollmentId = `${currentUser.uid}_${courseId}`;
    const docSnap = await getDoc(doc(this.db, this.enrollmentsCollection, enrollmentId));
    
    if (docSnap.exists()) {
      return docSnap.data() as UserCourseEnrollment;
    }
    return null;
  }

  async isUserEnrolledInCourse(courseId: string): Promise<boolean> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return false;

    const enrollmentId = `${currentUser.uid}_${courseId}`;
    const docSnap = await getDoc(doc(this.db, this.enrollmentsCollection, enrollmentId));
    return docSnap.exists();
  }

  onAuthStateChanged(callback: (user: any) => void) {
    return onAuthStateChanged(this.auth, callback);
  }

  subscribeToUserCart(callback: (cartItems: CartItem[]) => void) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      callback([]);
      return () => {};
    }

    return onSnapshot(doc(this.db, this.cartsCollection, currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const cartData = docSnap.data() as UserCart;
        callback(cartData.items || []);
      } else {
        callback([]);
      }
    });
  }

  // Admin methods
  async isAdmin(): Promise<boolean> {
    const currentUser = this.auth.currentUser;
    console.log('isAdmin check - currentUser:', currentUser?.email);
    
    if (!currentUser) {
      console.log('isAdmin check - no current user');
      return false;
    }
    
    // SECURITY: Both email AND Firestore profile must confirm admin status
    const isAdminEmail = await this.checkAdminEmail(currentUser.email || '');
    console.log('isAdmin check - isAdminEmail:', isAdminEmail);
    
    // If email is not in admin list, immediately return false
    if (!isAdminEmail) {
      console.log('isAdmin check - email not in admin list');
      return false;
    }
    
    // Email is admin, now check Firestore profile
    try {
      const userProfile = await this.getUserProfile();
      console.log('isAdmin check - userProfile:', userProfile);
      
      if (!userProfile) {
        console.log('isAdmin check - no user profile found');
        return false;
      }
      
      const isAdminInProfile = userProfile.isAdmin === true;
      console.log('isAdmin check - isAdmin in profile:', isAdminInProfile);
      
      // BOTH email and profile must confirm admin status
      const result = isAdminEmail && isAdminInProfile;
      console.log('isAdmin check - final result (email AND profile):', result);
      return result;
      
    } catch (error) {
      console.log('isAdmin check - error getting profile:', error);
      return false; // If we can't verify profile, deny access
    }
  }

  async checkAdminEmail(email: string): Promise<boolean> {
    // Define admin emails here or fetch from a secure config
    const adminEmails = ['admin@1000banks.com']; // Replace with actual admin email
    return adminEmails.includes(email.toLowerCase());
  }

  // Product management methods
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('createProduct called');
    
    // SECURITY: Proper admin verification required
    const isAdmin = await this.isAdmin();
    console.log('createProduct - isAdmin:', isAdmin);
    
    if (!isAdmin) {
      console.log('createProduct - access denied');
      throw new Error('Unauthorized: Admin access required');
    }

    const productData = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('createProduct - about to create product:', productData);
    const docRef = await addDoc(collection(this.db, this.productsCollection), productData);
    console.log('createProduct - product created with ID:', docRef.id);
    return docRef.id;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    await updateDoc(doc(this.db, this.productsCollection, productId), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    await deleteDoc(doc(this.db, this.productsCollection, productId));
  }

  async getAllProducts(): Promise<Product[]> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const snapshot = await getDocs(collection(this.db, this.productsCollection));
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  }

  // Course management methods
  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    console.log('createCourse called');
    
    // SECURITY: Proper admin verification required
    const isAdmin = await this.isAdmin();
    console.log('createCourse - isAdmin:', isAdmin);
    
    if (!isAdmin) {
      console.log('createCourse - access denied');
      throw new Error('Unauthorized: Admin access required');
    }

    const courseData = {
      ...course,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('createCourse - about to create course:', courseData);
    const docRef = await addDoc(collection(this.db, this.coursesCollection), courseData);
    console.log('createCourse - course created with ID:', docRef.id);
    return docRef.id;
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    await updateDoc(doc(this.db, this.coursesCollection, courseId), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteCourse(courseId: string): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    await deleteDoc(doc(this.db, this.coursesCollection, courseId));
  }

  async getAllCourses(): Promise<Course[]> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const snapshot = await getDocs(collection(this.db, this.coursesCollection));
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Course[];
  }

  // Media upload methods - simplified version without Firebase Storage
  // In production, you would integrate with a cloud storage service like Cloudinary, AWS S3, etc.
  async uploadMediaFile(uri: string, type: ModuleContent['type'], fileName?: string): Promise<string> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    // For now, we'll store the local URI or use placeholder URLs
    // In production, you would upload to a cloud storage service here
    console.log('Media upload requested for:', type, fileName);
    
    // Return the URI for now - in production this would be a cloud URL
    return uri;
  }

  async deleteMediaFile(url: string): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    // In production, you would delete from cloud storage here
    console.log('Media delete requested for:', url);
  }

  // Module content management
  async addModuleContent(
    courseId: string,
    moduleId: string,
    content: Omit<ModuleContent, 'id'>
  ): Promise<string> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const course = await this.getCourse(courseId);
    if (!course) throw new Error('Course not found');

    const contentId = `content_${Date.now()}`;
    const newContent: ModuleContent = {
      ...content,
      id: contentId,
    };

    const modules = course.modules || [];
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    modules[moduleIndex].contents.push(newContent);
    
    await this.updateCourse(courseId, { modules });
    return contentId;
  }

  async updateModuleContent(
    courseId: string,
    moduleId: string,
    contentId: string,
    updates: Partial<ModuleContent>
  ): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const course = await this.getCourse(courseId);
    if (!course) throw new Error('Course not found');

    const modules = course.modules || [];
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    const contentIndex = modules[moduleIndex].contents.findIndex(c => c.id === contentId);
    
    if (contentIndex === -1) {
      throw new Error('Content not found');
    }

    modules[moduleIndex].contents[contentIndex] = {
      ...modules[moduleIndex].contents[contentIndex],
      ...updates,
    };
    
    await this.updateCourse(courseId, { modules });
  }

  async deleteModuleContent(courseId: string, moduleId: string, contentId: string): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const course = await this.getCourse(courseId);
    if (!course) throw new Error('Course not found');

    const modules = course.modules || [];
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    const contentIndex = modules[moduleIndex].contents.findIndex(c => c.id === contentId);
    
    if (contentIndex === -1) {
      throw new Error('Content not found');
    }

    // Delete media file if it exists
    const content = modules[moduleIndex].contents[contentIndex];
    if (content.url && content.type !== 'text') {
      try {
        await this.deleteMediaFile(content.url);
      } catch (error) {
        console.warn('Failed to delete media file:', error);
      }
    }

    modules[moduleIndex].contents.splice(contentIndex, 1);
    await this.updateCourse(courseId, { modules });
  }

  async addCourseModule(courseId: string, module: Omit<CourseModule, 'id'>): Promise<string> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const course = await this.getCourse(courseId);
    if (!course) throw new Error('Course not found');

    const moduleId = `module_${Date.now()}`;
    const newModule: CourseModule = {
      ...module,
      id: moduleId,
      contents: module.contents || [],
    };

    const modules = course.modules || [];
    modules.push(newModule);
    modules.sort((a, b) => a.order - b.order);
    
    await this.updateCourse(courseId, { modules });
    return moduleId;
  }

  async updateCourseModule(
    courseId: string,
    moduleId: string,
    updates: Partial<CourseModule>
  ): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const course = await this.getCourse(courseId);
    if (!course) throw new Error('Course not found');

    const modules = course.modules || [];
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    modules[moduleIndex] = {
      ...modules[moduleIndex],
      ...updates,
    };
    
    if (updates.order !== undefined) {
      modules.sort((a, b) => a.order - b.order);
    }
    
    await this.updateCourse(courseId, { modules });
  }

  async deleteCourseModule(courseId: string, moduleId: string): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const course = await this.getCourse(courseId);
    if (!course) throw new Error('Course not found');

    const modules = course.modules || [];
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    // Delete all media files in the module
    const moduleContents = modules[moduleIndex].contents;
    for (const content of moduleContents) {
      if (content.url && content.type !== 'text') {
        try {
          await this.deleteMediaFile(content.url);
        } catch (error) {
          console.warn('Failed to delete media file:', error);
        }
      }
    }

    modules.splice(moduleIndex, 1);
    await this.updateCourse(courseId, { modules });
  }

  // Payment Methods management
  async getUserPaymentMethods(): Promise<PaymentMethod[]> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return [];

    try {
      const q = query(
        collection(this.db, this.paymentMethodsCollection),
        where('uid', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      })) as PaymentMethod[];
    } catch (error: any) {
      // If user has no payment methods or permission denied, return empty array
      if (error.code === 'firestore/permission-denied' || error.code === 'firestore/not-found') {
        console.log('No payment methods found or user has no access');
        return [];
      }
      throw error; // Re-throw other errors
    }
  }

  async savePaymentMethod(paymentData: Omit<PaymentMethod, 'id' | 'uid' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const paymentMethod: Omit<PaymentMethod, 'id'> = {
      ...paymentData,
      uid: currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // If this is the first card or set as default, update other cards
    if (paymentData.isDefault) {
      await this.clearDefaultPaymentMethods();
    }

    const docRef = await addDoc(collection(this.db, this.paymentMethodsCollection), paymentMethod);
    return docRef.id;
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    // Clear all defaults first
    await this.clearDefaultPaymentMethods();

    // Set the selected payment method as default
    await updateDoc(doc(this.db, this.paymentMethodsCollection, paymentMethodId), {
      isDefault: true,
      updatedAt: new Date(),
    });
  }

  async clearDefaultPaymentMethods(): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(this.db, this.paymentMethodsCollection),
      where('uid', '==', currentUser.uid),
      where('isDefault', '==', true)
    );
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isDefault: false, updatedAt: new Date() })
    );
    await Promise.all(updates);
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    // Get the payment method to check if it's default
    const docSnap = await getDoc(doc(this.db, this.paymentMethodsCollection, paymentMethodId));
    if (!docSnap.exists()) throw new Error('Payment method not found');

    const paymentMethod = docSnap.data() as PaymentMethod;
    
    // Delete the payment method
    await deleteDoc(doc(this.db, this.paymentMethodsCollection, paymentMethodId));

    // If it was default, make the next available card default
    if (paymentMethod.isDefault) {
      const remainingMethods = await this.getUserPaymentMethods();
      if (remainingMethods.length > 0) {
        await this.setDefaultPaymentMethod(remainingMethods[0].id);
      }
    }
  }

  async getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    const q = query(
      collection(this.db, this.paymentMethodsCollection),
      where('uid', '==', currentUser.uid),
      where('isDefault', '==', true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as PaymentMethod;
  }

  // Admin User Management Functions
  async getAllUsers(): Promise<User[]> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const snapshot = await getDocs(collection(this.db, this.usersCollection));
    return snapshot.docs.map((doc: any) => ({
      uid: doc.id,
      ...doc.data(),
    })) as User[];
  }

  async getUserEnrollmentsById(uid: string): Promise<UserCourseEnrollment[]> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const q = query(
      collection(this.db, this.enrollmentsCollection),
      where('uid', '==', uid),
      orderBy('enrolledAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => doc.data()) as UserCourseEnrollment[];
  }

  async getUserPurchasesById(uid: string): Promise<UserPurchase[]> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const q = query(
      collection(this.db, this.purchasesCollection),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserPurchase[];
  }

  async updateUserRole(uid: string, updates: { isAdmin?: boolean; isBlocked?: boolean }): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    await updateDoc(doc(this.db, this.usersCollection, uid), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteUser(uid: string): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    // Delete user data from all collections
    await Promise.all([
      deleteDoc(doc(this.db, this.usersCollection, uid)),
      deleteDoc(doc(this.db, this.cartsCollection, uid)).catch(() => {}), // May not exist
      // Delete user's purchases
      this.deleteUserPurchases(uid),
      // Delete user's enrollments
      this.deleteUserEnrollments(uid),
      // Delete user's payment methods
      this.deleteUserPaymentMethods(uid),
    ]);
  }

  private async deleteUserPurchases(uid: string): Promise<void> {
    const q = query(collection(this.db, this.purchasesCollection), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  private async deleteUserEnrollments(uid: string): Promise<void> {
    const q = query(collection(this.db, this.enrollmentsCollection), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  private async deleteUserPaymentMethods(uid: string): Promise<void> {
    const q = query(collection(this.db, this.paymentMethodsCollection), where('uid', '==', uid));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }

  // Analytics Functions
  async getAllPurchases(): Promise<UserPurchase[]> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const snapshot = await getDocs(collection(this.db, this.purchasesCollection));
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserPurchase[];
  }

  async getAllEnrollments(): Promise<UserCourseEnrollment[]> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const snapshot = await getDocs(collection(this.db, this.enrollmentsCollection));
    return snapshot.docs.map((doc: any) => doc.data()) as UserCourseEnrollment[];
  }

  // App Settings Functions
  async getAppSettings(): Promise<AppSettings | null> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const docSnap = await getDoc(doc(this.db, this.appSettingsCollection, 'main'));
    return docSnap.exists() ? (docSnap.data() as AppSettings) : null;
  }

  async updateAppSettings(settings: AppSettings): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    await setDoc(doc(this.db, this.appSettingsCollection, 'main'), {
      ...settings,
      updatedAt: new Date(),
    });
  }

  // Audit Log Functions
  async createAuditLog(logData: Omit<AuditLog, 'id' | 'adminUid' | 'adminEmail' | 'timestamp'>): Promise<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const auditLog: Omit<AuditLog, 'id'> = {
      adminUid: currentUser.uid,
      adminEmail: currentUser.email || '',
      timestamp: new Date(),
      ...logData,
    };

    const docRef = await addDoc(collection(this.db, this.auditLogsCollection), auditLog);
    return docRef.id;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const q = query(
      collection(this.db, this.auditLogsCollection),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.slice(0, limit).map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as AuditLog[];
  }

  // System Functions
  async createDataBackup(): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    // In a real implementation, this would create a backup of all data
    // For now, we'll just log the action
    console.log('Creating data backup...');
    
    // You could implement actual backup logic here:
    // 1. Export all collections to JSON
    // 2. Upload to cloud storage
    // 3. Store backup metadata
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate backup time
  }

  async clearCache(): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    // In a real implementation, this would clear various caches
    // For now, we'll just simulate the action
    console.log('Clearing cache...');

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, collectionName, docId));
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Data Export Functions
  async exportUsersData(): Promise<string> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const users = await this.getAllUsers();
    return JSON.stringify(users, null, 2);
  }

  async exportPurchasesData(): Promise<string> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const purchases = await this.getAllPurchases();
    return JSON.stringify(purchases, null, 2);
  }

  async exportCoursesData(): Promise<string> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const courses = await this.getAllCourses();
    return JSON.stringify(courses, null, 2);
  }

  async exportAllData(): Promise<{
    users: string;
    purchases: string;
    courses: string;
    products: string;
    enrollments: string;
  }> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const [users, purchases, courses, products, enrollments] = await Promise.all([
      this.getAllUsers(),
      this.getAllPurchases(),
      this.getAllCourses(),
      this.getAllProducts(),
      this.getAllEnrollments(),
    ]);

    return {
      users: JSON.stringify(users, null, 2),
      purchases: JSON.stringify(purchases, null, 2),
      courses: JSON.stringify(courses, null, 2),
      products: JSON.stringify(products, null, 2),
      enrollments: JSON.stringify(enrollments, null, 2),
    };
  }

  // Trading Days Functions
  async getTradingDays(): Promise<Array<{date: string; isLive: boolean; description?: string}>> {
    try {
      const snapshot = await getDocs(collection(this.db, 'tradingDays'));
      return snapshot.docs.map((doc: any) => ({
        date: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting trading days:', error);
      // Return empty array if permission denied or collection doesn't exist
      if (error instanceof Error && error.message.includes('permission-denied')) {
        console.log('Permission denied - returning empty array');
      }
      return [];
    }
  }

  async setTradingDay(date: string, isLive: boolean, description?: string): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    await setDoc(doc(this.db, 'tradingDays', date), {
      isLive,
      description: description || '',
      updatedAt: new Date(),
      updatedBy: this.auth.currentUser?.uid || '',
    });

    // Create audit log
    await this.createAuditLog({
      action: isLive ? 'ENABLE_TRADING_DAY' : 'DISABLE_TRADING_DAY',
      resource: 'tradingDays',
      resourceId: date,
      details: `Trading day ${isLive ? 'enabled' : 'disabled'} for ${date}`,
    });
  }

  async getPublicTradingDays(): Promise<Array<{date: string; isLive: boolean}>> {
    // Public method for non-admin users to view trading days
    try {
      const snapshot = await getDocs(
        query(collection(this.db, 'tradingDays'), where('isLive', '==', true))
      );
      return snapshot.docs.map((doc: any) => ({
        date: doc.id,
        isLive: doc.data().isLive,
      }));
    } catch (error) {
      console.error('Error getting public trading days:', error);
      // Return empty array if permission denied or collection doesn't exist
      if (error instanceof Error && error.message.includes('permission-denied')) {
        console.log('Permission denied - returning empty array');
      }
      return [];
    }
  }

  // Notification Functions
  async createNotification(userId: string, notification: {
    title: string;
    message: string;
    type: 'trading' | 'order' | 'system';
    channelId?: string;
  }): Promise<void> {
    await addDoc(collection(this.db, 'notifications'), {
      userId,
      ...notification,
      timestamp: serverTimestamp(),
      read: false,
    });
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    const notificationsRef = collection(this.db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(this.db, 'notifications', notificationId), {
      read: true
    });
  }

  // Listen to unread notifications count
  onUnreadNotificationsCount(userId: string, callback: (count: number) => void): () => void {
    const notificationsRef = collection(this.db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      callback(snapshot.size);
    }, (error) => {
      console.error('Error listening to notifications:', error);
      callback(0);
    });

    return unsubscribe;
  }

  // Telegram Channel Functions
  async getTelegramSettings(): Promise<any> {
    const settings = await this.getAppSettings();
    return settings?.telegram || null;
  }


  async updateTelegramSettings(telegramSettings: any): Promise<void> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const currentSettings = await this.getAppSettings();
    await this.updateAppSettings({
      ...currentSettings,
      telegram: telegramSettings
    });
  }
}

export default new FirebaseService();