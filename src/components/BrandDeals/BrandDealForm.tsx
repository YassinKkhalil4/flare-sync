
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useRealDeals } from '@/hooks/useRealDeals';

interface BrandDealFormProps {
  creatorId: string;
  creatorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BrandDealForm: React.FC<BrandDealFormProps> = ({
  creatorId,
  creatorName,
  onSuccess,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [deliverables, setDeliverables] = useState<string[]>(['']);

  const { createDeal, isCreatingDeal } = useRealDeals();

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, '']);
  };

  const updateDeliverable = (index: number, value: string) => {
    const updated = [...deliverables];
    updated[index] = value;
    setDeliverables(updated);
  };

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filteredRequirements = requirements.filter(req => req.trim() !== '');
    const filteredDeliverables = deliverables.filter(del => del.trim() !== '');
    
    if (!title.trim() || !description.trim() || !budget || filteredRequirements.length === 0) {
      return;
    }

    createDeal({
      creator_id: creatorId,
      title: title.trim(),
      description: description.trim(),
      budget: parseFloat(budget),
      requirements: filteredRequirements,
      deliverables: filteredDeliverables,
      deadline: deadline || undefined,
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Brand Deal</CardTitle>
        <CardDescription>
          Send a collaboration proposal to {creatorName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Deal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Collection Promotion"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the collaboration opportunity..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="1000"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Requirements</Label>
            <div className="space-y-2">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="e.g., Post must include product in lifestyle setting"
                  />
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>
          </div>

          <div>
            <Label>Deliverables</Label>
            <div className="space-y-2">
              {deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={deliverable}
                    onChange={(e) => updateDeliverable(index, e.target.value)}
                    placeholder="e.g., 1 Instagram post, 3 Instagram stories"
                  />
                  {deliverables.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDeliverable(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                <Plus className="h-4 w-4 mr-2" />
                Add Deliverable
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isCreatingDeal}>
              {isCreatingDeal ? 'Creating Deal...' : 'Send Proposal'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BrandDealForm;
