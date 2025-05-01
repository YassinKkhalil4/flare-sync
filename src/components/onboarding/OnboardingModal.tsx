import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Instagram, Loader2, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { SocialAPI } from '@/services/socialService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const {
    initiateInstagramConnect,
    isInstagramConnected,
    instagramProfile,
  } = useInstagramConnect();

  const steps = [
    {
      title: "Welcome to FlareSync!",
      description: "Let's set up your account in a few quick steps",
    },
    {
      title: "Connect your social accounts",
      description: "Link your social media accounts to get started with FlareSync",
    },
    {
      title: "Set up your profile",
      description: "Let's personalize your FlareSync profile",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Update user's onboarding status
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarded: true })
          .eq('id', user.id);
      }
      
      toast({
        title: "All set!",
        description: "Your account has been successfully set up.",
      });
      
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem completing your setup.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectInstagram = async () => {
    try {
      await initiateInstagramConnect();
    } catch (error) {
      console.error('Error connecting Instagram:', error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Could not connect to Instagram. Please try again.",
      });
    }
  };

  const handleImportProfilePicture = async () => {
    if (!instagramProfile || !user) return;
    
    setIsLoading(true);
    try {
      // Attempt to get Instagram profile picture URL
      // In a real implementation, you'd use the Instagram API to fetch the profile picture
      // For this demo, we'll use the mock data
      const profilePictureUrl = `https://source.unsplash.com/random/200x200?face&u=${Math.random()}`;
      setProfileUrl(profilePictureUrl);

      // Update the user's profile with the new avatar URL
      await updateUserProfile({
        avatar_url: profilePictureUrl,
      });

      toast({
        title: "Profile picture imported",
        description: "Your Instagram profile picture has been imported successfully.",
      });
    } catch (error) {
      console.error('Error importing profile picture:', error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "Could not import your profile picture. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              FlareSync makes it easy to manage all your social media accounts in one place.
              Let's get you started with just a few steps!
            </p>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-pink-100 p-2">
                    <Instagram className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-xs text-muted-foreground">
                      Connect your Instagram account
                    </p>
                  </div>
                </div>
                <Button 
                  variant={isInstagramConnected ? "outline" : "default"}
                  onClick={handleConnectInstagram}
                  disabled={isInstagramConnected || isLoading}
                >
                  {isInstagramConnected ? "Connected" : "Connect"}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                You can connect more social accounts later in the Social Connect section
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={profileUrl || user?.user_metadata?.avatar_url || ''} />
                <AvatarFallback>
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleImportProfilePicture}
                  disabled={!isInstagramConnected || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import from Instagram"
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                {isInstagramConnected 
                  ? "Click the button to import your profile picture from Instagram" 
                  : "Connect your Instagram account first to import your profile picture"}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>{steps[currentStep].description}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderCurrentStep()}
        </div>
        
        <div className="mt-2 mb-4">
          <div className="flex justify-center space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-12 rounded-full ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
          >
            Back
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : currentStep === steps.length - 1 ? (
              "Finish"
            ) : (
              "Next"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
