import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Auth = () => {
  const { loginWithOtp, signupWithOtp } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!otpSent) {
        const sent = await loginWithOtp.send(formData.phone); // Send OTP
        if (sent) setOtpSent(true);
      } else {
        const verified = await loginWithOtp.verify(formData.phone, formData.otp); // Verify OTP
        if (verified) setOtpSent(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER HANDLER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!otpSent) {
        const sent = await signupWithOtp.send(
          formData.username,
          formData.email,
          formData.password,
          formData.phone
        ); // Send OTP
        if (sent) setOtpSent(true);
      } else {
        const verified = await signupWithOtp.verify(formData.phone, formData.otp); // Verify OTP
        if (verified) setOtpSent(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 px-4 py-12">
      <Card className="w-full max-w-md shadow-custom-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Welcome</CardTitle>
          <CardDescription className="text-muted-foreground"> Join the Sign Language Corpus Collection community </CardDescription>
         </CardHeader> 
        <CardContent>
          <Tabs
            defaultValue="login"
            onValueChange={(val) => {
              setOtpSent(false);
              setIsLogin(val === "login");
            }}
          >
            <TabsList className="grid grid-cols-2 w-full mb-4 ">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>

                {otpSent && (
                  <div>
                    <Label htmlFor="otp">OTP</Label>
                    <Input id="otp" name="otp" value={formData.otp} onChange={handleInputChange} />
                    <Button type="button" onClick={() => loginWithOtp.resend(formData.phone)}>Resend OTP</Button>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? "Verify OTP" : "Send OTP"}
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {!otpSent && (
                  <>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" value={formData.username} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </>
                )}

                {otpSent && (
                  <div>
                    <Label htmlFor="otp">OTP</Label>
                    <Input id="otp" name="otp" value={formData.otp} onChange={handleInputChange} />
                    <Button type="button" onClick={() => signupWithOtp.resend(formData.phone)}>Resend OTP</Button>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : otpSent ? "Verify OTP" : "Send OTP"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
