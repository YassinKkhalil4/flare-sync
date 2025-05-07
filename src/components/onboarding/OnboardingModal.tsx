
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, ChevronRight } from 'lucide-react';

export interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingModal = ({ open, onOpenChange }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      title: 'Welcome to FlareSync',
      description: 'Let\'s get you started with the platform in a few quick steps.',
      action: 'Next',
    },
    {
      title: 'Connect Your Social Accounts',
      description: 'Connect your social media accounts to schedule posts and view analytics.',
      action: 'Next',
    },
    {
      title: 'Create Your First Post',
      description: 'Schedule your first post to get started with the content calendar.',
      action: 'Next',
    },
    {
      title: 'Explore Analytics',
      description: 'View insights and analytics for your content performance.',
      action: 'Finish',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    onOpenChange(false);
    // Here you could update the user's onboarded status in your database
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>{steps[currentStep].description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 pt-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center p-6">
          {currentStep === 0 && (
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Check size={40} className="text-primary" />
              </div>
              <h3 className="font-medium">Welcome to FlareSync!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your all-in-one platform for social media management.
              </p>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="text-center">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-lg border flex flex-col items-center">
                  <img src="/placeholder.svg" alt="Instagram" className="h-10 w-10 mb-2" />
                  <p className="text-xs">Instagram</p>
                </div>
                <div className="p-4 rounded-lg border flex flex-col items-center">
                  <img src="/placeholder.svg" alt="TikTok" className="h-10 w-10 mb-2" />
                  <p className="text-xs">TikTok</p>
                </div>
                <div className="p-4 rounded-lg border flex flex-col items-center">
                  <img src="/placeholder.svg" alt="YouTube" className="h-10 w-10 mb-2" />
                  <p className="text-xs">YouTube</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your accounts in the Social Connect page later.
              </p>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="text-center">
              <div className="border rounded-lg p-4 mb-4 w-full max-w-xs">
                <div className="h-20 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Create and schedule content easily from the Content page.
              </p>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="text-center">
              <div className="border rounded-lg p-4 mb-4 w-full max-w-xs">
                <div className="h-40 bg-muted rounded mb-2"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Track performance metrics in the Analytics dashboard.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button type="button" onClick={handleNext} className="gap-2">
            {steps[currentStep].action}
            <ChevronRight size={16} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
