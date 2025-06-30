
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportMisuseModalProps {
  complaintId: string;
}

const ReportMisuseModal = ({ complaintId }: ReportMisuseModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportData, setReportData] = useState({
    reason: '',
    details: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. Our team will review it.",
      });
      setIsOpen(false);
      setReportData({ reason: '', details: '' });
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Misuse</DialogTitle>
          <DialogDescription>
            Report this complaint if you believe it violates our community guidelines.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Report</Label>
            <Select value={reportData.reason} onValueChange={(value) => setReportData({...reportData, reason: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam or Duplicate</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="false">False Information</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              value={reportData.details}
              onChange={(e) => setReportData({...reportData, details: e.target.value})}
              placeholder="Please provide any additional context..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!reportData.reason}>
              <Send className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportMisuseModal;
