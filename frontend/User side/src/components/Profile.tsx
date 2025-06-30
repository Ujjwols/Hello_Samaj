
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Save, X, Eye, Trash2 } from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+977-9841234567',
    ward: 'Ward 5',
    municipality: 'Kathmandu Metropolitan City'
  });

  // Mock complaints data
  const [complaints] = useState([
    {
      id: 'HS2024001',
      type: 'Road',
      description: 'Large pothole on main road causing traffic issues',
      ward: 'Ward 5',
      status: 'In Progress',
      date: '2024-01-15',
      priority: 'High'
    },
    {
      id: 'HS2024002',
      type: 'Water',
      description: 'Water supply disruption for 3 days',
      ward: 'Ward 5',
      status: 'Resolved',
      date: '2024-01-10',
      priority: 'Medium'
    },
    {
      id: 'HS2024003',
      type: 'Sanitation',
      description: 'Garbage not collected for a week',
      ward: 'Ward 5',
      status: 'Pending',
      date: '2024-01-20',
      priority: 'Medium'
    }
  ]);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Profile updated:', userInfo);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values if needed
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-orange-100 text-orange-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and view your complaints</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ward
                  </label>
                  {isEditing ? (
                    <Input
                      value={userInfo.ward}
                      onChange={(e) => setUserInfo({ ...userInfo, ward: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.ward}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Municipality
                  </label>
                  {isEditing ? (
                    <Input
                      value={userInfo.municipality}
                      onChange={(e) => setUserInfo({ ...userInfo, municipality: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900">{userInfo.municipality}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Complaints History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Complaints</CardTitle>
                <p className="text-sm text-gray-600">
                  Track the status of your submitted complaints
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-medium">
                            {complaint.id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {complaint.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="truncate" title={complaint.description}>
                              {complaint.description}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(complaint.status)}>
                              {complaint.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(complaint.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {complaint.status === 'Pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Delete"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {complaints.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No complaints submitted yet.</p>
                    <Button className="mt-4">
                      Submit Your First Complaint
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
