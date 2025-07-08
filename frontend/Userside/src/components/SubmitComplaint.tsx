import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Upload, MapPin, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import LocationPicker from './LocationPicker';
import axios from 'axios';

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000/api/v1/complaints';

const SubmitComplaint = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    ward: '',
    description: '',
    name: '',
    phone: '',
    email: '',
    location: '',
    city: '',
    tole: '',
  });

  const complaintTypes = [
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

  const wards = [
    'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5',
    'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10',
  ];

  const cities = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setFormData(prev => ({ ...prev, location: location.address }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 10); // Limit to 10 files
      setFiles(selectedFiles);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.ward || !formData.description || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Complaint Type, Ward, Description, City).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('ward', formData.ward);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('tole', formData.tole);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('isAnonymous', isAnonymous.toString());
      
      if (!isAnonymous) {
        formDataToSend.append('name', formData.name);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('email', formData.email);
      }

      files.forEach((file, index) => {
        formDataToSend.append('files', file);
      });

      const response = await axios.post(`${API_BASE_URL}/create-complaint`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { complaintId } = response.data.data;

      toast({
        title: "Complaint Submitted Successfully!",
        description: `Your complaint ID is: ${complaintId}. Keep this for tracking.`,
      });

      // Reset form
      setFormData({
        type: '',
        ward: '',
        description: '',
        name: '',
        phone: '',
        email: '',
        location: '',
        city: '',
        tole: '',
      });
      setSelectedLocation(undefined);
      setFiles([]);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "An error occurred while submitting your complaint.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('nav.submit')}</h1>
          <p className="text-lg text-gray-600">Help us improve your community by reporting local issues</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Complaint Form */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center" style={{ animationDelay: '100ms' }}>
                <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                Complaint Details
              </CardTitle>
              <CardDescription>
                Please provide as much detail as possible to help us address your concern effectively.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Complaint Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Complaint Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complaint type" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ward/Municipality */}
                <div className="space-y-2">
                  <Label htmlFor="ward">Ward/Municipality *</Label>
                  <Select value={formData.ward} onValueChange={(value) => handleInputChange('ward', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward} value={ward}>
                          {ward}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tole */}
                <div className="space-y-2">
                  <Label htmlFor="tole">Tole</Label>
                  <Input
                    id="tole"
                    placeholder="e.g., Thamel"
                    value={formData.tole}
                    onChange={(e) => handleInputChange('tole', e.target.value)}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Specific Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder="e.g., Near Main Chowk, Behind School"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe the issue in detail..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload Photos/Videos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 10MB (Max 10 files)</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm text-primary hover:underline">Choose files</span>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Selected files: {files.map(file => file.name).join(', ')}
                    </div>
                  )}
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                  />
                  <Label htmlFor="anonymous">Submit as anonymous (no contact information required)</Label>
                </div>

                {/* Contact Information */}
                {!isAnonymous && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Contact Information (Optional)</h3>
                    <p className="text-sm text-gray-600">Providing contact details helps us update you on progress.</p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Your phone number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-3 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Location Picker */}
          <div className="animate-fade-in">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;