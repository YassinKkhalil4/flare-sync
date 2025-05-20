
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SocialPlatformTabs } from './SocialPlatformTabs';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface SocialConnectModalProps {
  defaultOpen?: boolean;
}

const SocialConnectModal: React.FC<SocialConnectModalProps> = ({ defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { hasSocialAccounts, initialLoadComplete } = useSocialPlatforms();
  const [dismissedModal, setDismissedModal] = useLocalStorage('social-connect-modal-dismissed', false);
  
  useEffect(() => {
    // Only show the modal if:
    // 1. Initial load is complete (to avoid flash)
    // 2. User has no accounts connected
    // 3. User hasn't dismissed the modal
    if (initialLoadComplete && !hasSocialAccounts && !dismissedModal) {
      setIsOpen(true);
    }
  }, [initialLoadComplete, hasSocialAccounts, dismissedModal]);
  
  const handleDismiss = () => {
    setIsOpen(false);
    setDismissedModal(true);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connect Your Social Accounts</DialogTitle>
          <DialogDescription>
            Connect your social media accounts to get the most out of FlareSync.
            This will allow you to schedule posts, view analytics, and more.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <SocialPlatformTabs />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleDismiss}>
            Maybe Later
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SocialConnectModal;
