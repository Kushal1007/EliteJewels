"use client";

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
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignupTab, setIsSignupTab] = useState(false);

  // ----------------- LOGIN -----------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!loginData.phone) {
      setMessage("❌ Phone is required");
      return;
    }

    const phoneWithCode = "+91" + loginData.phone;

    if (loginData.password) {
      const { error } = await supabase.auth.signInWithPassword({
        phone: phoneWithCode,
        password: loginData.password,
      });
      if (error) setMessage("❌ Login failed: " + error.message);
      else {
        setMessage("✅ Login successful!");
        onLogin();
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneWithCode });
      if (error) setMessage("❌ Login failed: " + error.message);
      else {
        setOtpSent(true);
        setMessage("📩 OTP sent for login to " + loginData.phone);
      }
    }
  };

  const handleVerifyLoginOtp = async () => {
    const phoneWithCode = "+91" + loginData.phone;
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneWithCode,
      token: otpCode,
      type: "sms",
    });
    if (error) {
      setMessage("❌ OTP verification failed: " + error.message);
      return;
    }
    setMessage("✅ Logged in successfully!");
    resetForm();
    onLogin();
    onClose();
  };

  // ----------------- SIGNUP -----------------
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!signupData.phone || !signupData.name || !signupData.password) {
      setMessage("❌ Name, phone, and password are required");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }

    const phoneWithCode = "+91" + signupData.phone;

    const { error: signUpError } = await supabase.auth.signUp({
      phone: phoneWithCode,
      password: signupData.password,
      options: {
        data: {
          name: signupData.name,
          email: signupData.email || null,
        },
      },
    });

    if (signUpError) {
      setMessage("❌ Failed to send OTP: " + signUpError.message);
      return;
    }

    setOtpSent(true);
    setMessage("📩 OTP sent to " + signupData.phone);
  };

  const handleVerifySignupOtp = async () => {
    const phoneWithCode = "+91" + signupData.phone;

    // Step 1: Verify OTP
    const { error: otpError } = await supabase.auth.verifyOtp({
      phone: phoneWithCode,
      token: otpCode,
      type: "sms",
    });

    if (otpError) {
      setMessage("❌ OTP verification failed: " + otpError.message);
      return;
    }

    // Step 2: Fetch authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setMessage("❌ Could not retrieve user info after OTP verification");
      return;
    }

    // Step 3: Upsert profile to guarantee insertion
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: userData.user.id,
        name: signupData.name,
        email: signupData.email || null,
        phone: phoneWithCode,
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      console.error("❌ Profile upsert error:", upsertError.message);
      setMessage("❌ Failed to save profile info: " + upsertError.message);
      return;
    }

    setMessage("✅ Signup complete!");
    resetForm();
    onLogin();
    onClose();
  };

  // ----------------- RESEND OTP -----------------
  const handleResendOtp = async () => {
    setResendDisabled(true);
    setMessage("");

    const phoneWithCode = "+91" + (isSignupTab ? signupData.phone : loginData.phone);

    const { error } = await supabase.auth.signInWithOtp({ phone: phoneWithCode });
    if (error) setMessage("❌ Failed to resend OTP: " + error.message);
    else setMessage("✅ OTP resent to " + phoneWithCode);

    setTimeout(() => setResendDisabled(false), 4000);
  };

  const resetForm = () => {
    setOtpSent(false);
    setSignupData({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
    setLoginData({ phone: "", password: "" });
    setOtpCode("");
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
            <span className="text-xl font-bold text-gray-900">Mohan Jewellers</span>
          </div>
        </div>

        <Tabs
          defaultValue="login"
          className="w-full"
          onValueChange={(val) => {
            setIsSignupTab(val === "signup");
            resetForm();
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            {!otpSent ? (
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
                  <Label htmlFor="login-password">Password (Optional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter password or leave blank for OTP"
                      className="pl-10"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600">
                  Login
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="otp-login">Enter OTP</Label>
                <Input
                  id="otp-login"
                  type="text"
                  placeholder="Enter OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                  onClick={handleVerifyLoginOtp}
                >
                  Verify OTP
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                >
                  Resend OTP
                </Button>
              </div>
            )}
          </TabsContent>

          {/* SIGNUP */}
          <TabsContent value="signup">
            {!otpSent ? (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter full name"
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
                      placeholder="Enter email"
                      className="pl-10"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
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
                        setSignupData({ ...signupData, phone: e.target.value })
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
                        setSignupData({ ...signupData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      className="pl-10"
                      value={signupData.confirmPassword}
                      onChange={(e) =>
                        setSignupData({ ...signupData, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600">
                  Sign Up
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Label htmlFor="otp-signup">Enter OTP</Label>
                <Input
                  id="otp-signup"
                  type="text"
                  placeholder="Enter OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                  onClick={handleVerifySignupOtp}
                >
                  Verify OTP
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOtp}
                  disabled={resendDisabled}
                >
                  Resend OTP
                </Button>
              </div>
            )}
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
