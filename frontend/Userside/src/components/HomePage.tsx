import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Search, FileText, Users, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import axios from 'axios';

const HomePage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState([
    { label: t('home.totalComplaints'), value: '0', icon: FileText },
    { label: t('home.resolvedIssues'), value: '0', icon: CheckCircle },
    { label: t('home.inProgress'), value: '0', icon: Clock },
    { label: t('home.activeUsers'), value: '0', icon: Users },
  ]);
  const [error, setError] = useState(null);

  const quickActions = [
    {
      title: t('home.submitComplaint'),
      description: t('home.submitComplaintDesc'),
      icon: MessageSquare,
      href: '/submit',
      color: 'bg-primary hover:bg-primary-600',
    },
    {
      title: t('home.trackComplaint'),
      description: t('home.trackComplaintDesc'),
      icon: Search,
      href: '/track',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: t('home.viewPublic'),
      description: t('home.viewPublicDesc'),
      icon: FileText,
      href: '/public',
      color: 'bg-green-600 hover:bg-green-700',
    },
  ];

  // Function to fetch community impact statistics
  const fetchCommunityStats = async () => {
    try {
      // Fetch complaints
      const complaintsResponse = await axios.get('http://localhost:5000/api/v1/complaints/get-all-complaints', {
        withCredentials: true,
      });

      const complaints = complaintsResponse.data.data; // Assuming ApiResponse structure: { statusCode, data, message }
      const totalComplaints = complaints.length;
      const resolvedIssues = complaints.filter(complaint => complaint.status === 'Resolved').length;
      const inProgress = complaints.filter(complaint => complaint.status === 'In Progress').length;

      // Fetch users (only for super_admin)
      let activeUsers = 'N/A'; // Fallback for non-admins
      try {
        const usersResponse = await axios.get('http://localhost:5000/api/v1/users/get-all-users', {
          withCredentials: true,
        });
        activeUsers = usersResponse.data.data.length.toString();
      } catch (userError) {
        console.warn('Failed to fetch users (possibly not super_admin):', userError.response?.data?.message || userError.message);
        // Keep 'N/A' or fallback value if unauthorized
      }

      // Update stats with fetched data
      setStats([
        { label: t('home.totalComplaints'), value: totalComplaints.toString(), icon: FileText },
        { label: t('home.resolvedIssues'), value: resolvedIssues.toString(), icon: CheckCircle },
        { label: t('home.inProgress'), value: inProgress.toString(), icon: Clock },
        { label: t('home.activeUsers'), value: activeUsers, icon: Users },
      ]);
    } catch (err) {
      console.error('Error fetching community stats:', err.response?.data?.message || err.message);
      setError(t('home.errorFetchingStats') || 'Failed to load community statistics');
    }
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchCommunityStats();
  }, [t]); // Re-run if translation changes

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {t('home.welcome')}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/submit">{t('home.submitComplaint')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link to="/track">{t('home.trackComplaint')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.quickActions')}</h2>
            <p className="text-lg text-gray-600">{t('home.quickActionsDesc')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <Card key={action.title} className="hover:shadow-lg transition-shadow duration-300 animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full ${action.color} flex items-center justify-center mx-auto mb-4`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{action.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild className="w-full">
                    <Link to={action.href}>{t('common.getStarted')}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.communityImpact')}</h2>
            <p className="text-lg text-gray-600">{t('home.communityImpactDesc')}</p>
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.howItWorks')}</h2>
            <p className="text-lg text-gray-600">{t('home.howItWorksDesc')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step1Title')}</h3>
              <p className="text-gray-600">{t('home.step1Desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step2Title')}</h3>
              <p className="text-gray-600">{t('home.step2Desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('home.step3Title')}</h3>
              <p className="text-gray-600">{t('home.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;