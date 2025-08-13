import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'email' | 'google';
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
  price: string;
  image: string;
  category: string;
  stock: number;
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
  private usersCollection = firestore().collection('users');
  private coursesCollection = firestore().collection('courses');
  private productsCollection = firestore().collection('products');
  private cartsCollection = firestore().collection('carts');
  private purchasesCollection = firestore().collection('purchases');
  private enrollmentsCollection = firestore().collection('enrollments');

  async createUserProfile(user: Partial<User>): Promise<void> {
    const currentUser = auth().currentUser;
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

    await this.usersCollection.doc(currentUser.uid).set(userData);
  }

  async getUserProfile(uid?: string): Promise<User | null> {
    const userId = uid || auth().currentUser?.uid;
    if (!userId) return null;

    const doc = await this.usersCollection.doc(userId).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  async updateUserProfile(updates: Partial<User>): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    await this.usersCollection.doc(currentUser.uid).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async getCourses(): Promise<Course[]> {
    const snapshot = await this.coursesCollection
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Course[];
  }

  async getCourse(courseId: string): Promise<Course | null> {
    const doc = await this.coursesCollection.doc(courseId).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Course) : null;
  }

  async getProducts(): Promise<Product[]> {
    const snapshot = await this.productsCollection
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  }

  async getProduct(productId: string): Promise<Product | null> {
    const doc = await this.productsCollection.doc(productId).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Product) : null;
  }

  async saveUserCart(cartItems: CartItem[]): Promise<void> {
    const currentUser = auth().currentUser;
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

    await this.cartsCollection.doc(currentUser.uid).set(cartData);
  }

  async getUserCart(): Promise<CartItem[]> {
    const currentUser = auth().currentUser;
    if (!currentUser) return [];

    const doc = await this.cartsCollection.doc(currentUser.uid).get();
    if (!doc.exists) return [];

    const cartData = doc.data() as UserCart;
    return cartData.items || [];
  }

  async clearUserCart(): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    await this.cartsCollection.doc(currentUser.uid).delete();
  }

  async createPurchase(cartItems: CartItem[], paymentMethod?: string): Promise<string> {
    const currentUser = auth().currentUser;
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

    const docRef = await this.purchasesCollection.add(purchaseData);
    return docRef.id;
  }

  async getUserPurchases(): Promise<UserPurchase[]> {
    const currentUser = auth().currentUser;
    if (!currentUser) return [];

    const snapshot = await this.purchasesCollection
      .where('uid', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as UserPurchase[];
  }

  async updatePurchaseStatus(purchaseId: string, status: UserPurchase['status']): Promise<void> {
    await this.purchasesCollection.doc(purchaseId).update({
      status,
      updatedAt: new Date(),
    });
  }

  async enrollInCourse(courseId: string): Promise<void> {
    const currentUser = auth().currentUser;
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
    await this.enrollmentsCollection.doc(enrollmentId).set(enrollmentData);
  }

  async getUserEnrollments(): Promise<UserCourseEnrollment[]> {
    const currentUser = auth().currentUser;
    if (!currentUser) return [];

    const snapshot = await this.enrollmentsCollection
      .where('uid', '==', currentUser.uid)
      .orderBy('enrolledAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data()) as UserCourseEnrollment[];
  }

  async updateCourseProgress(courseId: string, progress: number): Promise<void> {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    const enrollmentId = `${currentUser.uid}_${courseId}`;
    await this.enrollmentsCollection.doc(enrollmentId).update({
      progress,
      completed: progress >= 100,
      lastAccessedAt: new Date(),
    });
  }

  async isUserEnrolledInCourse(courseId: string): Promise<boolean> {
    const currentUser = auth().currentUser;
    if (!currentUser) return false;

    const enrollmentId = `${currentUser.uid}_${courseId}`;
    const doc = await this.enrollmentsCollection.doc(enrollmentId).get();
    return doc.exists;
  }

  onAuthStateChanged(callback: (user: any) => void) {
    return auth().onAuthStateChanged(callback);
  }

  subscribeToUserCart(callback: (cartItems: CartItem[]) => void) {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      callback([]);
      return () => {};
    }

    return this.cartsCollection.doc(currentUser.uid).onSnapshot((doc) => {
      if (doc.exists) {
        const cartData = doc.data() as UserCart;
        callback(cartData.items || []);
      } else {
        callback([]);
      }
    });
  }
}

export default new FirebaseService();