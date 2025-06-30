import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MapPin, Calendar, Filter, Search } from 'lucide-react';
import ReportMisuseModal from './ReportMisuseModal';
import { useTranslation } from '@/hooks/useTranslation';

const PublicComplaints = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const { t } = useTranslation();

  // Mock complaints data
  const mockComplaints = [
    {
      id: 'HS-123456',
      type: 'Road & Infrastructure',
      ward: 'Ward 5',
      location: 'Near Main Chowk',
      description: 'Large pothole causing traffic issues and vehicle damage.',
      status: 'In Progress',
      submittedDate: '2024-06-25',
      upvotes: 23,
      priority: 'High'
    },
    {
      id: 'HS-123457',
      type: 'Water Supply',
      ward: 'Ward 3',
      location: 'Residential Area Block A',
      description: 'Water supply has been irregular for the past week.',
      status: 'Pending',
      submittedDate: '2024-06-27',
      upvotes: 15,
      priority: 'Medium'
    },
    {
      id: 'HS-123458',
      type: 'Sanitation & Waste',
      ward: 'Ward 7',
      location: 'Market Street',
      description: 'Garbage collection has been delayed for several days.',
      status: 'Resolved',
      submittedDate: '2024-06-20',
      upvotes: 8,
      priority: 'Medium'
    },
    {
      id: 'HS-123459',
      type: 'Public Safety',
      ward: 'Ward 2',
      location: 'School Zone',
      description: 'Broken street lights creating safety concerns.',
      status: 'In Progress',
      submittedDate: '2024-06-26',
      upvotes: 31,
      priority: 'High'
    },
    {
      id: 'HS-123460',
      type: 'Environmental Issues',
      ward: 'Ward 4',
      location: 'Near River Bank',
      description: 'Industrial waste being dumped near the river.',
      status: 'Pending',
      submittedDate: '2024-06-28',
      upvotes: 42,
      priority: 'High'
    }
  ];

  const wards = ['All Wards', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7'];
  const complaintTypes = [
    'All Types',
    'Road & Infrastructure',
    'Water Supply',
    'Sanitation & Waste',
    'Electricity',
    'Public Safety',
    'Environmental Issues'
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800'
    };
    
    return statusConfig[status] || statusConfig['Pending'];
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'Low': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-orange-100 text-orange-800',
      'High': 'bg-red-100 text-red-800'
    };
    
    return priorityConfig[priority] || priorityConfig['Medium'];
  };

  const filteredComplaints = mockComplaints.filter(complaint => {
    const matchesSearch = complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWard = selectedWard === 'all' || complaint.ward === selectedWard;
    const matchesType = selectedType === 'all' || complaint.type === selectedType;
    
    return matchesSearch && matchesWard && matchesType;
  }).sort((a, b) => b.upvotes - a.upvotes);

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
            <CardDescription>
              Search and filter complaints by location, type, or keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={`${t('common.search')} complaints...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.slice(1).map((ward) => (
                    <SelectItem key={ward} value={ward}>
                      {ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {complaintTypes.slice(1).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}
            {(selectedWard !== 'all' || selectedType !== 'all' || searchTerm) && ' (filtered)'}
          </p>
        </div>

        {/* Complaints List */}
        <div className="space-y-6">
          {filteredComplaints.map((complaint, index) => (
            <Card key={complaint.id} className="hover:shadow-lg transition-shadow duration-300 animate-fade-in" 
                  style={{ animationDelay: `${index * 100}ms` }}>
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
                    <CardDescription className="text-base">
                      {complaint.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {complaint.upvotes}
                      </Button>
                      <ReportMisuseModal complaintId={complaint.id} />
                    </div>
                    <span className="text-sm text-gray-500">#{complaint.id}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{complaint.location}, {complaint.ward}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Submitted: {complaint.submittedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredComplaints.length === 0 && (
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
