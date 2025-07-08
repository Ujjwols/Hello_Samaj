import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, User, Mail, Lock, Phone, Calendar, MapPin } from "lucide-react";
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

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
        title: t("register.missingInfo"),
        description: t("register.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("register.passwordMismatch"),
        description: t("register.passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: t("register.termsRequired"),
        description: t("register.agreeToTerms"),
        variant: "destructive",
      });
      return;
    }

    const wardNum = parseInt(formData.wardNumber);
    if (formData.city === "Kathmandu" && (wardNum < 1 || wardNum > 32)) {
      toast({
        title: t("register.invalidWardNumber"),
        description: t("register.invalidWardKathmandu"),
        variant: "destructive",
      });
      return;
    }
    if (formData.city === "Lalitpur" && (wardNum < 1 || wardNum > 29)) {
      toast({
        title: t("register.invalidWardNumber"),
        description: t("register.invalidWardLalitpur"),
        variant: "destructive",
      });
      return;
    }
    if (formData.city === "Bhaktapur" && (wardNum < 1 || wardNum > 10)) {
      toast({
        title: t("register.invalidWardNumber"),
        description: t("register.invalidWardBhaktapur"),
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
          title: t("register.registrationSuccessful"),
          description: t("register.welcome"),
        });
        navigate("/profile");
      }
    } catch (error: unknown) {
      if (isAxiosError<ErrorResponse>(error)) {
        toast({
          title: t("register.registrationFailed"),
          description: error.response?.data?.message || t("register.errorOccurred"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("register.registrationFailed"),
          description: t("register.errorOccurred"),
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("register.welcome")}</h1>
          <p className="text-gray-600">{t("register.subtitle")}</p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <UserPlus className="w-5 h-5 mr-2 text-primary" />
              {t("register.title")}
            </CardTitle>
            <CardDescription className="text-center">{t("register.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">{t("register.fullName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="fullname"
                    placeholder={t("register.fullNamePlaceholder")}
                    value={formData.fullname}
                    onChange={(e) => handleInputChange("fullname", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("register.emailAddress")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("register.emailPlaceholder")}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t("register.phoneNumber")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    placeholder={t("register.phoneNumberPlaceholder")}
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("register.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("register.passwordPlaceholder")}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("register.confirmPassword")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t("register.city")}</Label>
                <Select
                  onValueChange={(value) => {
                    handleInputChange("city", value);
                    handleInputChange("wardNumber", "");
                  }}
                  value={formData.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("register.selectCity")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kathmandu">{t("register.kathmandu")}</SelectItem>
                    <SelectItem value="Lalitpur">{t("register.lalitpur")}</SelectItem>
                    <SelectItem value="Bhaktapur">{t("register.bhaktapur")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wardNumber">{t("register.wardNumber")}</Label>
                <Select
                  onValueChange={(value) => handleInputChange("wardNumber", value)}
                  value={formData.wardNumber}
                  disabled={!formData.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("register.selectWardNumber")} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.city &&
                      wardNumbers[formData.city].map((ward) => (
                        <SelectItem key={ward} value={ward}>
                          {t("register.ward")} {ward}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tole">{t("register.tole")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="tole"
                    placeholder={t("register.tolePlaceholder")}
                    value={formData.tole}
                    onChange={(e) => handleInputChange("tole", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t("register.gender")}</Label>
                <Select
                  onValueChange={(value) => handleInputChange("gender", value)}
                  value={formData.gender}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("register.selectGender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("register.male")}</SelectItem>
                    <SelectItem value="female">{t("register.female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">{t("register.dob")}</Label>
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
                <Label htmlFor="profilePic">{t("register.profilePic")}</Label>
                <Input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("profilePic", e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalFile">{t("register.additionalFile")}</Label>
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
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm leading-5">
                  {t("register.agreeTo")}{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    {t("footer.terms")}
                  </Link>{" "}
                  {t("register.and")}{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    {t("footer.privacy")}
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full py-3" disabled={isLoading}>
                {isLoading ? t("register.creatingAccount") : t("common.submit")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t("register.alreadyHaveAccount")}{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t("login.signIn")}
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