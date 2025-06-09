
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface SendOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
}

export const SendOfferModal: React.FC<SendOfferModalProps> = ({
  isOpen,
  onClose,
  creatorId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    requirements: '',
    deliverables: ''
  });

  const sendOfferMutation = useMutation({
    mutationFn: async (offerData: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Validate budget is a positive number
      const budget = parseFloat(offerData.budget);
      if (isNaN(budget) || budget <= 0) {
        throw new Error('Budget must be a valid positive number');
      }

      // Validate deadline is in the future
      const deadline = new Date(offerData.deadline);
      if (deadline <= new Date()) {
        throw new Error('Deadline must be in the future');
      }

      const { data, error } = await supabase
        .from('brand_deals')
        .insert({
          creator_id: creatorId,
          brand_id: user.id,
          title: offerData.title.trim(),
          description: offerData.description.trim(),
          budget: budget,
          deadline: deadline.toISOString(),
          requirements: offerData.requirements.split(',').map(r => r.trim()).filter(Boolean),
          deliverables: offerData.deliverables.split(',').map(d => d.trim()).filter(Boolean),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Offer Sent',
        description: 'Your collaboration offer has been sent to the creator.',
      });
      queryClient.invalidateQueries({ queryKey: ['brand-deals'] });
      onClose();
      setFormData({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        requirements: '',
        deliverables: ''
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send offer',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.budget || !formData.deadline) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    sendOfferMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Collaboration Offer</DialogTitle>
          <DialogDescription>
            Create a compelling offer for this creator. Be specific about your requirements and budget.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Summer Collection Instagram Campaign"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (USD) *</Label>
            <Input
              id="budget"
              type="number"
              min="1"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Campaign Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your campaign, brand values, and what you're looking for..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (comma-separated)</Label>
            <Input
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="Instagram post, Story mention, Product review"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverables">Deliverables (comma-separated)</Label>
            <Input
              id="deliverables"
              value={formData.deliverables}
              onChange={(e) => setFormData(prev => ({ ...prev, deliverables: e.target.value }))}
              placeholder="3 Instagram posts, 5 Stories, 1 Reel"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={sendOfferMutation.isPending}
            >
              {sendOfferMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Offer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
