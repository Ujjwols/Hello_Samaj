
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Mail } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const LoginPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: t('login.missingInfo'),
        description: t('login.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: t('login.success'),
      description: t('login.welcomeBack'),
    });
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">HS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.welcomeBack')}</h1>
          <p className="text-gray-600">{t('login.signInMessage')}</p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              {t('nav.login')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('login.enterCredentials')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('login.emailAddress')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('login.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
                    onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">{t('login.rememberMe')}</Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('login.forgotPassword')}
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3"
                disabled={isLoading}
              >
                {isLoading ? t('login.signingIn') : t('login.signIn')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {t('login.noAccount')}{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  {t('login.signUpHere')}
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                {t('login.continueAs')}{' '}
                <Link to="/submit" className="text-primary hover:underline font-medium">
                  {t('login.guestUser')}
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
