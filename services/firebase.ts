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

export interface Course {
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

    return snapshot.docs.map(doc => ({
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

    return snapshot.docs.map(doc => ({
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

    return snapshot.docs.map(doc => ({
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

    return snapshot.docs.map(doc => doc.data()) as UserCourseEnrollment[];
  }

  async updateCourseProgress(courseId: string, progress: number): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const enrollmentId = `${currentUser.uid}_${courseId}`;
    await updateDoc(doc(this.db, this.enrollmentsCollection, enrollmentId), {
      progress,
      completed: progress >= 100,
      lastAccessedAt: new Date(),
    });
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
    if (!currentUser) return false;
    
    const userProfile = await this.getUserProfile();
    return userProfile?.isAdmin || false;
  }

  async checkAdminEmail(email: string): Promise<boolean> {
    // Define admin emails here or fetch from a secure config
    const adminEmails = ['admin@1000banks.com']; // Replace with actual admin email
    return adminEmails.includes(email.toLowerCase());
  }

  // Product management methods
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const productData = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(this.db, this.productsCollection), productData);
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
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  }

  // Course management methods
  async createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) throw new Error('Unauthorized: Admin access required');

    const courseData = {
      ...course,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(this.db, this.coursesCollection), courseData);
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
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Course[];
  }
}

export default new FirebaseService();