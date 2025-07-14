import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MapPin, Calendar, Filter, Search } from 'lucide-react';
import ReportMisuseModal from './ReportMisuseModal';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000/api/v1/complaints';

const PublicComplaints = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('all wards');
  const [selectedType, setSelectedType] = useState('all types');
  const [selectedCity, setSelectedCity] = useState('all cities');
  const [complaintIdSearch, setComplaintIdSearch] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [singleComplaint, setSingleComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const wards = ['All Wards', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10'];
  const complaintTypes = [
    'All Types',
    'Road & Infrastructure',
    'Water Supply',
    'Sanitation & Waste',
    'Electricity',
    'Public Safety',
    'Healthcare',
    'Education',
    'Environmental Issues',
    'Other',
  ];
  const cities = ['All Cities', 'Kathmandu', 'Lalitpur', 'Bhaktapur'];

  // Fetch all complaints
  const fetchAllComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/get-all-complaints`);
      setComplaints(response.data.data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.response?.data?.message || 'Failed to fetch complaints');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch complaints',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch complaint by ID
  const fetchComplaintById = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setSingleComplaint(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/get-complaint/${id}`);
      setSingleComplaint(response.data.data);
      setComplaints([]); // Clear other complaints to show only the single result
    } catch (err) {
      console.error('Error fetching complaint by ID:', err);
      setError(err.response?.data?.message || 'Failed to fetch complaint');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch complaint',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all complaints on component mount
  useEffect(() => {
    fetchAllComplaints();
  }, [toast]);

  // Handle search by complaint ID
  const handleIdSearch = (e) => {
    e.preventDefault();
    if (complaintIdSearch.trim()) {
      fetchComplaintById(complaintIdSearch.trim());
    } else {
      fetchAllComplaints(); // Reset to all complaints if ID search is cleared
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Submitted: 'bg-gray-100 text-gray-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      Resolved: 'bg-green-100 text-green-800',
    };
    return statusConfig[status] || statusConfig['Submitted'];
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      Low: 'bg-blue-100 text-blue-800',
      Medium: 'bg-orange-100 text-orange-800',
      High: 'bg-red-100 text-red-800',
    };
    return priorityConfig[priority] || priorityConfig['Medium'];
  };

  const filteredComplaints = singleComplaint
    ? [singleComplaint]
    : complaints.filter((complaint) => {
        const matchesSearch = searchTerm === '' || 
          (complaint.description && complaint.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (complaint.location && complaint.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (complaint.type && complaint.type.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesWard = selectedWard === 'all wards' || 
          (complaint.ward && complaint.ward.toLowerCase() === selectedWard.toLowerCase());
        
        const matchesType = selectedType === 'all types' || 
          (complaint.type && complaint.type.toLowerCase() === selectedType.toLowerCase());
        
        const matchesCity = selectedCity === 'all cities' || 
          (complaint.city && complaint.city.toLowerCase() === selectedCity.toLowerCase());
        
        return matchesSearch && matchesWard && matchesType && matchesCity;
      }).sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('nav.public')}</h1>
          <p className="text-lg text-gray-600">View and support community issues in your area</p>
        </div>

        {/* Filters */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-primary" />
              {t('common.filter')} Complaints
            </CardTitle>
            <CardDescription>Search and filter complaints by city, ward, or type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={`${t('common.search')} complaints...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select 
                value={selectedCity} 
                onValueChange={setSelectedCity}
                defaultValue="all cities"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem 
                      key={city} 
                      value={city.toLowerCase()}
                    >
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={selectedWard} 
                onValueChange={setSelectedWard}
                defaultValue="all wards"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward) => (
                    <SelectItem 
                      key={ward} 
                      value={ward.toLowerCase()}
                    >
                      {ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={selectedType} 
                onValueChange={setSelectedType}
                defaultValue="all types"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {complaintTypes.map((type) => (
                    <SelectItem 
                      key={type} 
                      value={type.toLowerCase()}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="text-center animate-fade-in">
            <CardContent className="py-12">
              <p className="text-lg text-gray-600">Loading complaints...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="text-center animate-fade-in">
            <CardContent className="py-12">
              <p className="text-lg text-red-600">{error}</p>
              <p className="text-gray-600 mt-2">Please try again later.</p>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
              {(selectedCity !== 'all cities' || selectedWard !== 'all wards' || selectedType !== 'all types' || searchTerm) && ' (filtered)'}
            </p>
          </div>
        )}

        {/* Complaints List */}
        {!loading && !error && (
          <div className="space-y-6">
            {filteredComplaints.map((complaint, index) => (
              <Card
                key={complaint.complaintId}
                className="hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusBadge(complaint.status)}>
                          {t(`status.${complaint.status.toLowerCase().replace(' ', '')}`)}
                        </Badge>
                        <Badge className={getPriorityBadge(complaint.priority)}>
                          {t(`priority.${complaint.priority.toLowerCase()}`)} Priority
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{complaint.type}</CardTitle>
                      <CardDescription className="text-base">{complaint.description}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                            onClick={async () => {
                              try {
                                await axios.post(`${API_BASE_URL}/upvote/${complaint.complaintId}`);
                                fetchAllComplaints(); // Refresh complaints
                              } catch (err) {
                                toast({
                                  title: t('error.title'),
                                  description: t('error.upvoteFailed'),
                                  variant: 'destructive',
                                });
                              }
                            }}>
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {complaint.upvotes || 0}
                          </Button>
                        <ReportMisuseModal complaintId={complaint.complaintId} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>
                        {complaint.location}, {complaint.ward}, {complaint.city}
                        {complaint.latitude && complaint.longitude
                          ? ` (${complaint.latitude}, ${complaint.longitude})`
                          : ''}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Submitted: {new Date(complaint.submittedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {complaint.files && complaint.files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Attachments:</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {complaint.files.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {file.type === 'image' ? (
                              <img
                                src={file.url}
                                alt="Attachment"
                                className="w-20 h-20 object-cover rounded"
                              />
                            ) : (
                              `View ${file.type}`
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredComplaints.length === 0 && (
          <Card className="text-center animate-fade-in">
            <CardContent className="py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or check back later for new complaints.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicComplaints;