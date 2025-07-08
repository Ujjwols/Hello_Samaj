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
  const [complaintId, setComplaintId] = useState(null);
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
        title: t('error.invalidInput'),
        description: t('error.requiredFields'),
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

      files.forEach((file) => {
        formDataToSend.append('files', file);
      });

      const response = await axios.post(`${API_BASE_URL}/create-complaint`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { complaintId } = response.data.data;

      setComplaintId(complaintId);

      toast({
        title: t('successTitle'),
        description: t('successDescription', { complaintId }),
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
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: t('error.title'),
        description: error.response?.data?.message || t('error.submitFailed'),
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('Submit Complaint')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Complaint Form */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center" style={{ animationDelay: '100ms' }}>
                <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                {t('Complaint Details')}
              </CardTitle>
              <CardDescription>{t('Please provide as much detail as possible to help us address your concern effectively.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Complaint Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">{t('Complaint Type *')} *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select complaint type')} />
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
                  <Label htmlFor="city">{t('City *')} *</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select your city')} />
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

                {/* Ward */}
                <div className="space-y-2">
                  <Label htmlFor="ward">{t('Ward/Municipality *')} *</Label>
                  <Select value={formData.ward} onValueChange={(value) => handleInputChange('ward', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select your ward')} />
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
                  <Label htmlFor="tole">{t('Tole')}</Label>
                  <Input
                    id="tole"
                    placeholder={t('Please enter you Tole Name')}
                    value={formData.tole}
                    onChange={(e) => handleInputChange('tole', e.target.value)}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">{t('Specific Location')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder={t('Specific Location')}
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t('Description')} *</Label>
                  <Textarea
                    id="description"
                    placeholder={t('Please describe the issue in detail...')}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>{t('Upload Photos/Videos')}</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">{t('Click to upload or drag and drop')}</p>
                    <p className="text-xs text-gray-500">{t('PNG, JPG, MP4 up to 10MB (Max 10 files)Choose files')}</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm text-primary hover:underline">{t('chooseFiles')}</span>
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {t('selectedFiles')}: {files.map(file => file.name).join(', ')}
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
                  <Label htmlFor="anonymous">{t('Submit as anonymous (no contact information required)')}</Label>
                </div>

                {/* Contact Information */}
                {!isAnonymous && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{t('Contact Information (Optional)')}</h3>
                    <p className="text-sm text-gray-600">{t('Providing contact details helps us update you on progress.')}</p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('Full Name')}</Label>
                        <Input
                          id="name"
                          placeholder={t('Your full name')}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('Phone Number')}</Label>
                        <Input
                          id="phone"
                          placeholder={t('Your phone number')}
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('Email Address')}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t('Enter your Email Address')}
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
                  {isSubmitting ? t('submitting') : t('submit')}
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

        {/* Display Complaint ID */}
        {complaintId && (
          <Card className="mt-8 animate-fade-in">
            <CardHeader>
              <CardTitle>{t('successTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-600">
                {t('successDescription', { complaintId })}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t('trackPrompt')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubmitComplaint;