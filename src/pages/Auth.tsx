
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import AutommerceLogo from "@/components/AutommerceLogo";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Registration successful! Please check your email for verification.");
      setActiveTab("login");
    } catch (error: any) {
      toast.error(error.message || "Error during signup");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Auth listener will handle redirection
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="mb-6">
            <AutommerceLogo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Autommerce.ai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email"
                    type="email" 
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="login-password">Password</Label>
                  </div>
                  <Input 
                    id="login-password"
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input 
                    id="signup-name"
                    type="text" 
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email"
                    type="email" 
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          © 2025 Autommerce.ai - AI-powered eCommerce optimization
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
