
import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../services/storageService";

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: User | null;
  token?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to clean up auth state
  const cleanupAuthState = () => {
    storage.remove("auth.token");
    storage.remove("auth.user");
  };

  useEffect(() => {
    // Check for existing session
    const storedUser = storage.get<User>("auth.user");
    const storedToken = storage.get<string>("auth.token");
    
    if (storedUser && storedToken) {
      const currentSession = { user: storedUser, token: storedToken };
      setSession(currentSession);
      setUser(storedUser);
    }
    
    setIsLoading(false);
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clean up auth state
      cleanupAuthState();
      
      // Reset context state
      setSession(null);
      setUser(null);
      
      // Force page reload for a clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
