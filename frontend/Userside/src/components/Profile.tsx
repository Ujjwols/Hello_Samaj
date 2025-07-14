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

// Set axios defaults
axios.defaults.withCredentials = true;

const API_URL = 'http://localhost:5000/api/v1';

interface Complaint {
  complaintId: string;
  type: string;
  description: string;
  status: string;
  priority: string;
  submittedDate: string;
  userId: string;
}

const Profile = () => {
  const { user, logout } = useAuth();
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
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch user details
        const userResponse = await axios.get(`${API_URL}/users/get-user/${user._id}`);
        const { fullname, email, phoneNumber, city, wardNumber, tole, gender, dob } = userResponse.data.data;
        
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

        // Fetch complaints
        const complaintsResponse = await axios.get(`${API_URL}/complaints/get-all-complaints`);
        const userComplaints = complaintsResponse.data.data.filter(
          (complaint: Complaint) => complaint.userId === user._id
        );
        setComplaints(userComplaints);
      } catch (error) {
        console.error('Fetch error:', error);
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            toast({
              title: 'Session Expired',
              description: 'Please login again',
              variant: 'destructive',
            });
            logout();
            navigate('/login');
            return;
          }
          
          toast({
            title: 'Error',
            description: error.response?.data?.message || 'Failed to fetch data',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'An unexpected error occurred',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, toast, logout]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await axios.patch(
        `${API_URL}/users/update-user/${user?._id}`,
        userInfo
      );

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
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      
      if (axios.isAxiosError(error)) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update profile',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/users/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      navigate('/login');
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    try {
      await axios.delete(`${API_URL}/complaints/delete-complaint/${complaintId}`);
      setComplaints(complaints.filter(c => c.complaintId !== complaintId));
      toast({
        title: 'Complaint Deleted',
        description: 'The complaint has been deleted successfully.',
      });
    } catch (error) {
      console.error('Delete error:', error);
      
      if (axios.isAxiosError(error)) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to delete complaint',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Submitted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information Card */}
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
                {Object.entries({
                  fullname: 'Full Name',
                  email: 'Email',
                  phoneNumber: 'Phone Number',
                  city: 'City',
                  wardNumber: 'Ward Number',
                  tole: 'Tole',
                  gender: 'Gender',
                  dob: 'Date of Birth'
                }).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    {isEditing ? (
                      key === 'gender' ? (
                        <select
                          value={userInfo.gender}
                          onChange={(e) => setUserInfo({...userInfo, gender: e.target.value})}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      ) : key === 'dob' ? (
                        <Input
                          type="date"
                          value={userInfo.dob}
                          onChange={(e) => setUserInfo({...userInfo, dob: e.target.value})}
                        />
                      ) : (
                        <Input
                          value={userInfo[key as keyof typeof userInfo] as string}
                          onChange={(e) => setUserInfo({...userInfo, [key]: e.target.value})}
                          type={key === 'email' ? 'email' : 'text'}
                        />
                      )
                    ) : (
                      <p className="text-gray-900">
                        {key === 'dob' && userInfo.dob 
                          ? new Date(userInfo.dob).toLocaleDateString() 
                          : userInfo[key as keyof typeof userInfo] || 'N/A'}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Complaints Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Complaints</CardTitle>
                <p className="text-sm text-gray-600">Track the status of your submitted complaints</p>
              </CardHeader>
              <CardContent>
                {complaints.length > 0 ? (
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
                            <TableCell><Badge variant="outline">{complaint.type}</Badge></TableCell>
                            <TableCell className="max-w-xs truncate" title={complaint.description}>
                              {complaint.description}
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
                              {new Date(complaint.submittedDate).toLocaleDateString()}
                            </TableCell>
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
                                    onClick={() => handleDeleteComplaint(complaint.complaintId)}
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No complaints submitted yet.</p>
                    <Button className="mt-4" onClick={() => navigate('/submit')}>
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