import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Upload, MapPin, AlertCircle, Copy } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import LocationPicker from './LocationPicker';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/complaints';

const SubmitComplaint = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toleError, setToleError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    ward: '',
    description: '',
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

  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8', 'Ward 9', 'Ward 10'];
  const cities = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setFormData(prev => ({ ...prev, location: location.address }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 10);
      setFiles(selectedFiles);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'tole') {
      if (/\d/.test(value)) {
        setToleError('Tole name should not contain numbers');
      } else {
        setToleError(null);
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearForm = () => {
    setFormData({
      type: '',
      ward: '',
      description: '',
      location: '',
      city: '',
      tole: '',
    });
    setFiles([]);
    setSelectedLocation(undefined);
    setIsAnonymous(false);
    setToleError(null);
    toast({
      title: t('Form Cleared'),
      description: t('All form fields have been reset.'),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.ward || !formData.description || !formData.city) {
      toast({
        title: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }
    if (toleError) {
      toast({
        title: 'Invalid Tole name',
        description: toleError,
        variant: 'destructive',
      });
      return;
    }

    if (!isAnonymous) {
      const hasCookies = document.cookie.includes('accessToken=');
      if (!hasCookies) {
        toast({
          title: t('error.title') || 'Authentication Required',
          description: t('error.loginRequired') || 'Please log in to submit a non-anonymous complaint.',
          variant: 'destructive',
        });
        return;
      }
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
      files.forEach((file) => formDataToSend.append('files', file));

      const response = await axios.post(`${API_BASE_URL}/create-complaint`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      const { complaintId } = response.data.data;
      setComplaintId(complaintId);
      setShowSuccessDialog(true);

      toast({
        title: t('successTitle') || 'Complaint Submitted',
        description: t('successDescription', { complaintId }) || `Your complaint has been submitted. ID: ${complaintId}`,
      });

      handleClearForm();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: t('error.title') || 'Submission Failed',
        description: axiosError.response?.data?.message || t('error.submitFailed') || 'Failed to submit complaint. Please try again.',
        variant: 'destructive',
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
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                {t('Complaint Details')}
              </CardTitle>
              <CardDescription>
                {t('Please provide as much detail as possible to help us address your concern effectively.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('Complaint Type *')}</Label>
                  <Select value={formData.type} onValueChange={(val) => handleInputChange('type', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select complaint type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('City *')}</Label>
                  <Select value={formData.city} onValueChange={(val) => handleInputChange('city', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select your city')} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('Ward/Municipality *')}</Label>
                  <Select value={formData.ward} onValueChange={(val) => handleInputChange('ward', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select your ward')} />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map(ward => (
                        <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('Tole')}</Label>
                  <Input value={formData.tole} onChange={(e) => handleInputChange('tole', e.target.value)} placeholder={t('Please enter your Tole Name')} />
                </div>

                <div className="space-y-2">
                  <Label>{t('Specific Location')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10"
                      placeholder={t('Specific Location')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('Description')} *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('Please describe the issue in detail...')}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('Upload Photos/Videos')}</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">{t('Click to upload or drag and drop')}</p>
                    <p className="text-xs text-gray-500">{t('PNG, JPG, MP4 up to 10MB (Max 10 files)')}</p>
                    <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer text-sm text-primary hover:underline">{t('chooseFiles')}</label>
                  </div>
                  {files.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {t('selectedFiles')}: {files.map(file => file.name).join(', ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(val) => setIsAnonymous(val === true)} />
                  <Label htmlFor="anonymous">{t('Submit as anonymous (no login required)')}</Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="w-full py-3 text-lg" disabled={isSubmitting}>
                    {isSubmitting ? t('submitting') : t('submit')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-3 text-lg bg-red-500 hover:bg-red-600 text-white border-none"
                    onClick={handleClearForm}
                  >
                    {t('Clear Form')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600">{t('Complaint Submitted Successfully')}</DialogTitle>
            <DialogDescription>{t('Your complaint has been submitted.')}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md mt-4">
            <span className="font-mono text-sm text-gray-700">ID: {complaintId}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(complaintId || '');
                toast({ title: t('Copied to clipboard!') });
              }}
              className="flex gap-1 items-center"
            >
              <Copy size={16} /> {t('Copy')}
            </Button>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowSuccessDialog(false)}>{t('Close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmitComplaint;