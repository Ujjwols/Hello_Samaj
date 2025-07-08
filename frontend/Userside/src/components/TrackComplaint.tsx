import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Clock, AlertTriangle, MapPin, Calendar, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000/api/v1/complaints';

const TrackComplaint = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [complaintId, setComplaintId] = useState('');
  const [complaintData, setComplaintData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!complaintId.trim()) {
      toast({
        title: t('error.invalidInput'),
        description: t('error.enterValidComplaintId'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsSearching(true);
    setComplaintData(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/get-complaint/${complaintId.trim()}`);
      setComplaintData(response.data.data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast({
        title: t('error.title'),
        description: error.response?.data?.message || t('error.fetchComplaintFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Submitted: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      'Under Review': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'In Progress': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      Resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    };
    
    const config = statusConfig[status] || statusConfig['Submitted'];
    
    return (
      <Badge className={`${config.color} flex items-center`}>
        <config.icon className="w-3 h-3 mr-1" />
        {t(`status.${status.toLowerCase().replace(' ', '')}`)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('nav.track')}</h1>
          <p className="text-lg text-gray-600">{t('Enter your complaint ID to check the current status')}</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-primary" />
              {t('Search Complaint')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="complaintId" className="sr-only">Complaint ID</Label>
                <Input
                  id="complaintId"
                  placeholder={t('Enter your complaint ID (e.g., HS-123456)')}
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button type="submit" disabled={isSearching} className="px-8">
                {isSearching ? t('common.searching') : t('common.search')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {complaintData && (
          <div className="space-y-6 animate-fade-in">
            {/* Complaint Overview */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Complaint #{complaintData.complaintId}</CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {complaintData.type} - {complaintData.ward}
                    </CardDescription>
                  </div>
                  {getStatusBadge(complaintData.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{complaintData.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Submitted: {new Date(complaintData.submittedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>Priority: {complaintData.priority}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Last Update: {new Date(complaintData.lastUpdate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{t('Description')}</h3>
                  <p className="text-gray-600">{complaintData.description}</p>
                </div>
                
                {complaintData.assignedDepartment && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-1">{t('track.assignedDepartment')}</h3>
                    <p className="text-blue-700">{complaintData.assignedDepartment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Progress Timeline')}</CardTitle>
                <CardDescription>{t('Progress Description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaintData.timeline.map((item, index) => {
                    const statusConfig = {
                      Submitted: { icon: AlertTriangle, color: 'text-blue-600' },
                      'Under Review': { icon: Clock, color: 'text-yellow-600' },
                      'In Progress': { icon: Clock, color: 'text-orange-600' },
                      Resolved: { icon: CheckCircle, color: 'text-green-600' },
                    };
                    const { icon: Icon, color } = statusConfig[item.status] || statusConfig['Submitted'];
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          index === complaintData.timeline.length - 1 ? 'bg-primary' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            index === complaintData.timeline.length - 1 ? 'text-white' : color
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">{item.status}</h3>
                            <time className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</time>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Results */}
        {complaintId && !complaintData && !isSearching && (
          <Card className="text-center animate-fade-in">
            <CardContent className="py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('track.notFound')}</h3>
              <p className="text-gray-600 mb-4">
                {t('track.notFoundDescription', { complaintId })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;