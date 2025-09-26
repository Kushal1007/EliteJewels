import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ShoppingBag, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onDemoLogin: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onDemoLogin,
}: AuthModalProps) {
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  // Login with phone + password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const phoneWithCode = "+91" + loginData.phone;

    const { data, error } = await supabase.auth.signInWithPassword({
      phone: phoneWithCode,
      password: loginData.password,
    });

    if (error) {
      setMessage("❌ Login failed: " + error.message);
    } else {
      setMessage("✅ Login successful!");
      onLogin();
      onClose();
    }
  };

  // Signup with phone + password
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (signupData.password !== signupData.confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }

    const phoneWithCode = "+91" + signupData.phone;

    const { data, error } = await supabase.auth.signUp({
      phone: phoneWithCode,
      password: signupData.password,
      options: {
        data: {
          name: signupData.name,
          email: signupData.email || null,
        },
      },
    });

    if (error) {
      setMessage("❌ Signup failed: " + error.message);
    } else {
      setMessage("✅ Account created successfully! You can now log in.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Authentication</DialogTitle>

        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EliteJewels</span>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value="login">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">Welcome Back</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="Enter phone without +91"
                        className="pl-10"
                        value={loginData.phone}
                        onChange={(e) =>
                          setLoginData({ ...loginData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 mb-3"
                  >
                    Login
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 mb-3"
                    onClick={onDemoLogin}
                  >
                    Demo Login (Try Now)
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup */}
          <TabsContent value="signup">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">Create Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signupData.name}
                        onChange={(e) =>
                          setSignupData({ ...signupData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter phone without +91"
                        className="pl-10"
                        value={signupData.phone}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={signupData.confirmPassword}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600"
                  >
                    Sign Up
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {message && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
            {message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

