import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    message: '',
    email: '',
    anonymous: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.anonymous && !formData.email) {
      toast({
        title: "Error",
        description: "Please provide an email address for non-anonymous feedback.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/feedbacks/submit-feedback',
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setIsSubmitted(true);
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback. We'll review it soon.",
        });

        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            type: '',
            subject: '',
            message: '',
            email: '',
            anonymous: false
          });
        }, 3000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center animate-fade-in">
            <CardContent className="py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You for Your Feedback!
              </h2>
              <p className="text-gray-600 mb-6">
                Your feedback has been submitted successfully. Our team will review it and take appropriate action.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Feedback & Suggestions</h1>
          <p className="text-lg text-gray-600">
            Help us improve Hello Samaj by sharing your feedback and suggestions
          </p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Your input helps us make Hello Samaj better for everyone. You can also email feedback to{' '}
              <a href="mailto:hellosamaj@gmail.com" className="text-primary underline">
                hellosamaj@gmail.com
              </a>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">General Feedback</SelectItem>
                    <SelectItem value="suggestion">Feature Suggestion</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="improvement">UI Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your feedback"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please provide detailed feedback or suggestions..."
                  rows={6}
                  required
                />
              </div>

              {!formData.anonymous && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your email address"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={formData.anonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked, email: checked ? '' : formData.email })}
                />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackPage;