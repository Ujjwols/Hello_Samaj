// src/components/Layout.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe, User, FileText, Search, MessageSquare, UserCircle, HelpCircle, MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/Authcontext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, t, toggleLanguage } = useTranslation();
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: t('nav.home'), href: '/', icon: FileText },
    { name: t('nav.submit'), href: '/submit', icon: MessageSquare },
    { name: t('nav.track'), href: '/track', icon: Search },
    { name: t('nav.public'), href: '/public', icon: FileText },
    { name: t('nav.help'), href: '/help', icon: HelpCircle },
    { name: t('nav.feedback'), href: '/feedback', icon: MessageSquare },
    {
      name: isLoggedIn ? t('nav.profile') : t('nav.login'),
      href: isLoggedIn ? '/profile' : '/login',
      icon: isLoggedIn ? UserCircle : User,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Hello Samaj</span>
            </Link>

            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="hidden sm:flex items-center"
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === 'en' ? 'नेपाली' : 'English'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="ml-3 mt-2 flex items-center"
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === 'en' ? 'नेपाली' : 'English'}
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HS</span>
                </div>
                <span className="text-xl font-bold">Hello Samaj</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t('footer.description')}
              </p>
            </div>

            <div className="md:col-span-1">
              <h3 className="font-semibold text-lg mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">{t('nav.home')}</Link></li>
                <li><Link to="/submit" className="text-gray-300 hover:text-white transition-colors">{t('nav.submit')}</Link></li>
                <li><Link to="/track" className="text-gray-300 hover:text-white transition-colors">{t('nav.track')}</Link></li>
                <li><Link to="/public" className="text-gray-300 hover:text-white transition-colors">{t('nav.public')}</Link></li>
              </ul>
            </div>

            <div className="md:col-span-1">
              <h3 className="font-semibold text-lg mb-4">{t('footer.support')}</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors">{t('nav.help')}</Link></li>
                <li><Link to="/feedback" className="text-gray-300 hover:text-white transition-colors">{t('nav.feedback')}</Link></li>
              </ul>
            </div>

            <div className="md:col-span-1">
              <h3 className="font-semibold text-lg mb-4">{t('footer.contact')}</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-gray-300 text-sm">
                    <p>Kathmandu Metropolitan City</p>
                    <p>Ward 1, Kathmandu, Nepal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-gray-300 text-sm">+977-1-4221234</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-gray-300 text-sm">support@hellosamaj.gov.np</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Hello Samaj. {t('footer.rights')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;