
import React, { createContext, useContext, useState, useEffect } from "react";
import { storage } from "@/services/storageService";

// Define the User type
interface User {
  id: string;
  email: string;
  name?: string;
}

// Define the AuthContext type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      // Get stored user from localStorage
      const storedUser = storage.get<User>("user");
      
      if (storedUser) {
        setUser(storedUser);
      }
      
      setIsLoading(false);
    };
    
    checkSession();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In a real app, this would validate against a backend
      // For now, mock a successful login
      
      // Simple validation
      if (!email || !password) {
        return false;
      }
      
      // Mock user creation
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: email,
        name: email.split('@')[0] // Use part of email as name
      };
      
      // Store in localStorage
      storage.set("user", mockUser);
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error("Error signing in:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In a real app, this would create a user in the backend
      // For now, mock a successful registration
      
      // Simple validation
      if (!email || !password) {
        return false;
      }
      
      // Mock user creation
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email: email,
        name: name || email.split('@')[0] // Use provided name or part of email
      };
      
      // Store in localStorage
      storage.set("user", mockUser);
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error("Error signing up:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      // Remove user from localStorage
      storage.remove("user");
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
