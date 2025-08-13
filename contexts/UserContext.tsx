import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import firebaseService, { User, UserCourseEnrollment, UserPurchase } from '../services/firebase';
import { getAuth } from '@react-native-firebase/auth';

interface UserContextType {
  user: User | null;
  loading: boolean;
  enrollments: UserCourseEnrollment[];
  purchases: UserPurchase[];
  updateProfile: (updates: Partial<User>) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  updateCourseProgress: (courseId: string, progress: number) => Promise<void>;
  isEnrolledInCourse: (courseId: string) => boolean;
  refreshUserData: () => Promise<void>;
  createUserProfile: (userData: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<UserCourseEnrollment[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged(async (authUser) => {
      setLoading(true);
      
      if (authUser) {
        try {
          const userProfile = await firebaseService.getUserProfile(authUser.uid);
          setUser(userProfile);
          
          if (userProfile) {
            const [userEnrollments, userPurchases] = await Promise.all([
              firebaseService.getUserEnrollments(),
              firebaseService.getUserPurchases(),
            ]);
            setEnrollments(userEnrollments);
            setPurchases(userPurchases);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUser(null);
        setEnrollments([]);
        setPurchases([]);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createUserProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      await firebaseService.createUserProfile(userData);
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userProfile = await firebaseService.getUserProfile(currentUser.uid);
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      await firebaseService.updateUserProfile(updates);
      
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      await firebaseService.enrollInCourse(courseId);
      
      const updatedEnrollments = await firebaseService.getUserEnrollments();
      setEnrollments(updatedEnrollments);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  };

  const updateCourseProgress = async (courseId: string, progress: number) => {
    try {
      await firebaseService.updateCourseProgress(courseId, progress);
      
      const updatedEnrollments = await firebaseService.getUserEnrollments();
      setEnrollments(updatedEnrollments);
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  };

  const isEnrolledInCourse = (courseId: string): boolean => {
    return enrollments.some(enrollment => enrollment.courseId === courseId);
  };

  const refreshUserData = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      const [userProfile, userEnrollments, userPurchases] = await Promise.all([
        firebaseService.getUserProfile(),
        firebaseService.getUserEnrollments(),
        firebaseService.getUserPurchases(),
      ]);
      
      setUser(userProfile);
      setEnrollments(userEnrollments);
      setPurchases(userPurchases);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        enrollments,
        purchases,
        updateProfile,
        enrollInCourse,
        updateCourseProgress,
        isEnrolledInCourse,
        refreshUserData,
        createUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};