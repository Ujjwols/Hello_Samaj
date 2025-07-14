import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/Authcontext";
import axios, { AxiosResponse, AxiosError } from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1/users";

interface SendOTPResponse {
  success: boolean;
  data: {
    token: string;
    identifier: string;
    deliveryMethod: string;
  };
  message: string;
}

interface User {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  phoneNumber: string;
  city: string;
  wardNumber: string;
  tole: string;
  gender: string;
  dob: string;
  role: string;
  profilePic: string;
  files: { url: string; type: string }[];
  createdAt: string;
  updatedAt: string;
}

interface VerifyOTPResponse {
  success: boolean;
  data: {
    loggedInUser: User;
  };
  message: string;
}

interface ErrorResponse {
  message: string;
}

const LoginPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    otp: "",
    token: "",
    deliveryMethod: "email",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: t("login.missingInfo"),
        description: t("login.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response: AxiosResponse<SendOTPResponse> = await axios.post(`${API_BASE_URL}/send-otp`, {
        email: formData.email,
        password: formData.password,
        deliveryMethod: formData.deliveryMethod,
      });

      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          token: response.data.data.token,
        }));
        setStep("otp");
        toast({
          title: t("login.otpSent"),
          description: t("login.otpSentDescription", { method: formData.deliveryMethod }),
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast({
          title: t("login.error"),
          description: error.response?.data?.message || t("login.genericError"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("login.error"),
          description: t("login.genericError"),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otp || !formData.token) {
      toast({
        title: t("login.missingInfo"),
        description: t("login.enterOTP"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response: AxiosResponse<VerifyOTPResponse> = await axios.post(
        `${API_BASE_URL}/verify-otp`,
        {
          token: formData.token,
          otp: formData.otp,
          deliveryMethod: formData.deliveryMethod,
          rememberMe: formData.rememberMe,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        const { loggedInUser } = response.data.data;
        login(loggedInUser);
        toast({
          title: t("login.success"),
          description: t("login.welcomeBack"),
        });
        navigate("/profile");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast({
          title: t("login.otpVerificationFailed"),
          description: error.response?.data?.message || t("login.invalidOTP"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("login.otpVerificationFailed"),
          description: t("login.invalidOTP"),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">HS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("login.welcomeBack")}</h1>
          <p className="text-gray-600">{t("login.signInMessage")}</p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              {t("nav.login")}
            </CardTitle>
            <CardDescription className="text-center">
              {step === "credentials" ? t("login.enterCredentials") : t("login.otpDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "credentials" ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("login.emailAddress")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("login.emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("login.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("login.passwordPlaceholder")}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      {t("login.rememberMe")} 
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    {t("login.forgotPassword")}
                  </Link>
                </div>

                <Button type="submit" className="w-full py-3" disabled={isLoading}>
                  {isLoading ? t("login.signingIn") : t("login.sendOTP")}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">{t("login.otp")}</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder={t("login.otpPlaceholder")}
                    value={formData.otp}
                    onChange={(e) => handleInputChange("otp", e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-otp"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                  />
                  <Label htmlFor="remember-otp" className="text-sm">
                    {t("login.rememberMe")} <span className="text-gray-500">(Stays logged in for 30 days)</span>
                  </Label>
                </div>

                <Button type="submit" className="w-full py-3" disabled={isLoading}>
                  {isLoading ? t("login.verifyingOTP") : t("login.verifyOTP")}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t("login.noAccount")}{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  {t("login.signUpHere")}
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                {t("login.continueAs")}{" "}
                <Link to="/submit" className="text-primary hover:underline font-medium">
                  {t("login.guestUser")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;