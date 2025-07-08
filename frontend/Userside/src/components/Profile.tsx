import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Save, X, Eye, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '@/context/Authcontext';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:5000/api/v1';

const Profile = () => {
  const { user, accessToken, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
    city: '',
    wardNumber: '',
    tole: '',
    gender: '',
    dob: '',
  });
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || !user._id || !accessToken) {
      console.log('No user, user._id, or accessToken found, redirecting to login:', { user, accessToken });
      navigate('/login');
      return;
    }

    // Fetch user details
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching user with ID:', user._id);
        console.log('Access Token:', accessToken);
        const response = await axios.get(`${API_URL}/users/get-user/${user._id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log('User fetch response:', response.data);
        const { fullname, email, phoneNumber, city, wardNumber, tole, gender, dob } = response.data.data;
        setUserInfo({
          fullname: fullname || '',
          email: email || '',
          phoneNumber: phoneNumber || '',
          city: city || '',
          wardNumber: wardNumber ? wardNumber.toString() : '',
          tole: tole || '',
          gender: gender || '',
          dob: dob ? new Date(dob).toISOString().split('T')[0] : '',
        });
      } catch (error) {
        console.error('Fetch user error:', error.response?.data || error.message);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to fetch user details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch user complaints
      const fetchComplaints = async () => {
      try {
        const response = await axios.get(`${API_URL}/complaints/get-all-complaints`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const userComplaints = response.data.data.filter(
          (complaint) => complaint.userId === user._id // or complaint.createdBy === user._id depending on backend schema
        );
        setComplaints(userComplaints);
      } catch (error) {
        console.error('Fetch complaints error:', error.response?.data || error.message);
      }
    };

    fetchUser();
    fetchComplaints();
  }, [user, accessToken, navigate, toast]);

  const handleSave = async () => {
    try {
      console.log('Saving user info:', userInfo);
      const response = await axios.patch(
        `${API_URL}/users/update-user/${user._id}`,
        userInfo,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('Update user response:', response.data);
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved.',
      });
      setUserInfo({
        fullname: response.data.data.fullname || '',
        email: response.data.data.email || '',
        phoneNumber: response.data.data.phoneNumber || '',
        city: response.data.data.city || '',
        wardNumber: response.data.data.wardNumber ? response.data.data.wardNumber.toString() : '',
        tole: response.data.data.tole || '',
        gender: response.data.data.gender || '',
        dob: response.data.data.dob ? new Date(response.data.data.dob).toISOString().split('T')[0] : '',
      });
    } catch (error) {
      console.error('Update user error:', error.response?.data || error.message);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogout = () => {
    console.log('Logging out user');
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Submitted':
        return 'bg-gray-100 text-gray-800';
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information and view your complaints</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.fullname}
                        onChange={(e) => setUserInfo({ ...userInfo, fullname: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{userInfo.fullname || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{userInfo.email || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.phoneNumber}
                        onChange={(e) => setUserInfo({ ...userInfo, phoneNumber: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{userInfo.phoneNumber || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.city}
                        onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{userInfo.city || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Number</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.wardNumber}
                        onChange={(e) => setUserInfo({ ...userInfo, wardNumber: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{userInfo.wardNumber || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tole</label>
                    {isEditing ? (
                      <Input
                        value={userInfo.tole}
                        onChange={(e) => setUserInfo({ ...userInfo, tole: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{userInfo.tole || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    {isEditing ? (
                      <select
                        value={userInfo.gender}
                        onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{userInfo.gender || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={userInfo.dob}
                        onChange={(e) => setUserInfo({ ...userInfo, dob: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{userInfo.dob || 'N/A'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Complaints</CardTitle>
                  <p className="text-sm text-gray-600">Track the status of your submitted complaints</p>
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
                          <TableRow key={complaint.complaintId}>
                            <TableCell className="font-medium">{complaint.complaintId}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{complaint.type}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate" title={complaint.description}>
                                {complaint.description}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                            </TableCell>
                            <TableCell>{new Date(complaint.submittedDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="View Details"
                                  onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {complaint.status === 'Submitted' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    title="Delete"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={async () => {
                                      try {
                                        await axios.delete(`${API_URL}/delete-complaint/${complaint.complaintId}`, {
                                          headers: {
                                            Authorization: `Bearer ${accessToken}`,
                                          },
                                        });
                                        setComplaints(complaints.filter((c) => c.complaintId !== complaint.complaintId));
                                        toast({
                                          title: 'Complaint Deleted',
                                          description: 'The complaint has been deleted successfully.',
                                        });
                                      } catch (error) {
                                        console.error('Delete complaint error:', error.response?.data || error.message);
                                        toast({
                                          title: 'Error',
                                          description: error.response?.data?.message || 'Failed to delete complaint',
                                          variant: 'destructive',
                                        });
                                      }
                                    }}
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
                      <Button className="mt-4" onClick={() => navigate('/submit-complaint')}>
                        Submit Your First Complaint
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;