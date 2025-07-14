import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, User, Mail, Lock, Phone, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/Authcontext";
import axios, { AxiosResponse, isAxiosError } from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1/users";

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

interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

interface ErrorResponse {
  message: string;
}

const RegisterPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    city: "",
    wardNumber: "",
    tole: "",
    gender: "",
    dob: "",
    agreeToTerms: false,
  });
  const [files, setFiles] = useState<{
    profilePic: File | null;
    additionalFile: File | null;
  }>({
    profilePic: null,
    additionalFile: null,
  });
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    capitalLetter: false,
    number: false,
    symbol: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "password" && typeof value === "string") {
      setPasswordValidations({
        minLength: value.length >= 6,
        capitalLetter: /[A-Z]/.test(value),
        number: /\d/.test(value),
        symbol: /[!@#$%^&*]/.test(value),
      });
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const passwordStrengthScore = Object.values(passwordValidations).filter(Boolean).length;
  const strengthColor =
    passwordStrengthScore === 0
      ? "bg-gray-200"
      : passwordStrengthScore <= 2
      ? "bg-red-500"
      : passwordStrengthScore === 3
      ? "bg-yellow-500"
      : "bg-green-500";
  const strengthMessage =
    passwordStrengthScore === 0
      ? t("Password is too short")
      : passwordStrengthScore <= 2
      ? t("Password is weak")
      : passwordStrengthScore === 3
      ? t("Password is moderate")
      : t("Password is strong");

  const wardNumbers = {
    Kathmandu: Array.from({ length: 32 }, (_, i) => `${i + 1}`),
    Lalitpur: Array.from({ length: 29 }, (_, i) => `${i + 1}`),
    Bhaktapur: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullname ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.city ||
      !formData.wardNumber ||
      !formData.gender ||
      !formData.dob ||
      !files.profilePic
    ) {
      toast({
        title: t("Missing Information"),
        description: t("Please fill in all required fields"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.endsWith("@gmail.com")) {
      toast({
        title: t("Invalid Email"),
        description: t("Email must be a valid Gmail address"),
        variant: "destructive",
      });
      return;
    }

    if (Object.values(passwordValidations).some((valid) => !valid)) {
      toast({
        title: t("Invalid Password"),
        description: t("Password must be at least 6 characters long and include at least one capital letter, one number, and one special character"),
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("Password Mismatch"),
        description: t("Passwords do not match"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: t("Terms Required"),
        description: t("Please agree to the terms and conditions"),
        variant: "destructive",
      });
      return;
    }

    const wardNum = parseInt(formData.wardNumber);
    if (formData.city === "Kathmandu" && (wardNum < 1 || wardNum > 32)) {
      toast({
        title: t("Invalid Ward Number"),
        description: t("Ward number for Kathmandu must be between 1 and 32"),
        variant: "destructive",
      });
      return;
    }
    if (formData.city === "Lalitpur" && (wardNum < 1 || wardNum > 29)) {
      toast({
        title: t("Invalid Ward Number"),
        description: t("Ward number for Lalitpur must be between 1 and 29"),
        variant: "destructive",
      });
      return;
    }
    if (formData.city === "Bhaktapur" && (wardNum < 1 || wardNum > 10)) {
      toast({
        title: t("Invalid Ward Number"),
        description: t("Ward number for Bhaktapur must be between 1 and 10"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullname", formData.fullname);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("wardNumber", formData.wardNumber);
      formDataToSend.append("tole", formData.tole);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("dob", formData.dob);
      if (files.profilePic) {
        formDataToSend.append("profilePic", files.profilePic);
      }
      if (files.additionalFile) {
        formDataToSend.append("additionalFile", files.additionalFile);
      }

      const response: AxiosResponse<RegisterResponse> = await axios.post(
        `${API_BASE_URL}/register`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const { user } = response.data.data;
        login(user);
        toast({
          title: t("Registration Successful"),
          description: t("Welcome to Hello Samaj"),
        });
        navigate("/profile");
      }
    } catch (error: unknown) {
      if (isAxiosError<ErrorResponse>(error)) {
        toast({
          title: t("Registration Failed"),
          description: error.response?.data?.message || t("An error occurred"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("Registration Failed"),
          description: t("An error occurred"),
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("Join Hello Samaj")}</h1>
          <p className="text-gray-600">{t("Create your account to get started")}</p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <UserPlus className="w-5 h-5 mr-2 text-primary" />
              {t("Register")}
            </CardTitle>
            <CardDescription className="text-center">{t("Fill in your details to create an account")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">{t("Full Name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="fullname"
                    placeholder={t("Your full name")}
                    value={formData.fullname}
                    onChange={(e) => handleInputChange("fullname", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("Email Address")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("your.email@example.com")}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t("Phone Number")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    placeholder={t("+977-98XXXXXXXX")}
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("Password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("Create a strong password")}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className={`h-full ${strengthColor}`}
                        style={{ width: `${passwordStrengthScore * 25}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{strengthMessage}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${passwordValidations.minLength ? "text-green-500" : "text-gray-400"}`}
                        />
                        <span className="text-sm">{t("At least 6 characters")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${passwordValidations.capitalLetter ? "text-green-500" : "text-gray-400"}`}
                        />
                        <span className="text-sm">{t("At least one capital letter")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${passwordValidations.number ? "text-green-500" : "text-gray-400"}`}
                        />
                        <span className="text-sm">{t("At least one number")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${passwordValidations.symbol ? "text-green-500" : "text-gray-400"}`}
                        />
                        <span className="text-sm">{t("At least one special character")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("Confirm Password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t("Confirm your password")}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-500">{t("Passwords do not match")}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t("City")}</Label>
                <Select
                  onValueChange={(value) => {
                    handleInputChange("city", value);
                    handleInputChange("wardNumber", "");
                  }}
                  value={formData.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select city")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kathmandu">{t("Kathmandu")}</SelectItem>
                    <SelectItem value="Lalitpur">{t("Lalitpur")}</SelectItem>
                    <SelectItem value="Bhaktapur">{t("Bhaktapur")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wardNumber">{t("Ward Number")}</Label>
                <Select
                  onValueChange={(value) => handleInputChange("wardNumber", value)}
                  value={formData.wardNumber}
                  disabled={!formData.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select ward number")} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.city &&
                      wardNumbers[formData.city].map((ward) => (
                        <SelectItem key={ward} value={ward}>
                          {t("Ward")} {ward}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tole">{t("Tole (Optional)")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="tole"
                    placeholder={t("Your tole (e.g., Na Tole)")}
                    value={formData.tole}
                    onChange={(e) => handleInputChange("tole", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t("Gender")}</Label>
                <Select
                  onValueChange={(value) => handleInputChange("gender", value)}
                  value={formData.gender}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("Male")}</SelectItem>
                    <SelectItem value="female">{t("Female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">{t("Date of Birth")}</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange("dob", e.target.value)}
                    className="pl-10"
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePic">{t("Profile Picture")}</Label>
                <Input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("profilePic", e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalFile">{t("Additional File (Optional)")}</Label>
                <Input
                  id="additionalFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => handleFileChange("additionalFile", e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                />
                <Label htmlFor="terms" className="text-sm leading-5">
                  {t("I agree to the")}{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    {t("Terms of Service")}
                  </Link>{" "}
                  {t("and")}{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    {t("Privacy Policy")}
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full py-3" disabled={isLoading}>
                {isLoading ? t("Creating Account") : t("Submit")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t("Already have an account")}{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t("Sign In")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;