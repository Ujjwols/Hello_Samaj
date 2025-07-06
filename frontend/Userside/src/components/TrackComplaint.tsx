
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Clock, AlertTriangle, MapPin, Calendar, User } from 'lucide-react';

const TrackComplaint = () => {
  const [complaintId, setComplaintId] = useState('');
  const [complaintData, setComplaintData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Mock complaint data
  const mockComplaint = {
    id: 'HS-123456',
    type: 'Road & Infrastructure',
    ward: 'Ward 5',
    location: 'Near Main Chowk',
    description: 'Large pothole causing traffic issues and vehicle damage. The road has been in poor condition for several weeks.',
    status: 'In Progress',
    submittedDate: '2024-06-25',
    lastUpdate: '2024-06-28',
    submittedBy: 'Ram Sharma',
    phone: '+977-98********',
    priority: 'High',
    assignedTo: 'Road Maintenance Department',
    timeline: [
      {
        date: '2024-06-25',
        status: 'Submitted',
        description: 'Complaint received and logged into system',
        icon: AlertTriangle,
        color: 'text-blue-600'
      },
      {
        date: '2024-06-26',
        status: 'Under Review',
        description: 'Complaint reviewed by concerned department',
        icon: Clock,
        color: 'text-yellow-600'
      },
      {
        date: '2024-06-28',
        status: 'In Progress',
        description: 'Site inspection completed. Work scheduled to begin.',
        icon: Clock,
        color: 'text-orange-600'
      }
    ]
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!complaintId.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, show mock data if ID matches
    if (complaintId.toUpperCase() === 'HS-123456') {
      setComplaintData(mockComplaint);
    } else {
      setComplaintData(null);
    }
    
    setIsSearching(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': { color: 'bg-gray-100 text-gray-800', icon: Clock },
      'In Progress': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Resolved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    
    return (
      <Badge className={`${config.color} flex items-center`}>
        <config.icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Complaint</h1>
          <p className="text-lg text-gray-600">Enter your complaint ID to check the current status</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-primary" />
              Search Complaint
            </CardTitle>
            <CardDescription>
              Enter your complaint ID (e.g., HS-123456). Try "HS-123456" for a demo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="complaintId" className="sr-only">Complaint ID</Label>
                <Input
                  id="complaintId"
                  placeholder="Enter complaint ID (e.g., HS-123456)"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button type="submit" disabled={isSearching} className="px-8">
                {isSearching ? 'Searching...' : 'Search'}
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
                    <CardTitle className="text-2xl">Complaint #{complaintData.id}</CardTitle>
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
                    <span>Submitted: {complaintData.submittedDate}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>Priority: {complaintData.priority}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Last Update: {complaintData.lastUpdate}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{complaintData.description}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-1">Assigned Department</h3>
                  <p className="text-blue-700">{complaintData.assignedTo}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Timeline</CardTitle>
                <CardDescription>Track the progress of your complaint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaintData.timeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        index === complaintData.timeline.length - 1 ? 'bg-primary' : 'bg-gray-100'
                      }`}>
                        <item.icon className={`w-4 h-4 ${
                          index === complaintData.timeline.length - 1 ? 'text-white' : item.color
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{item.status}</h3>
                          <time className="text-sm text-gray-500">{item.date}</time>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Complaint Not Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find a complaint with ID "{complaintId}". Please check the ID and try again.
              </p>
              <p className="text-sm text-gray-500">
                Try "HS-123456" for a demo complaint.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;
