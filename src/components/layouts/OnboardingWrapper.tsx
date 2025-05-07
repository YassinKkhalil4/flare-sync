
import { useState, useEffect, ReactNode } from 'react';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

export interface OnboardingWrapperProps {
  children: ReactNode;
  showOnboarding?: boolean;
}

const OnboardingWrapper = ({ 
  children, 
  showOnboarding = false 
}: OnboardingWrapperProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only open the onboarding modal if showOnboarding is true
    setIsOpen(showOnboarding);
  }, [showOnboarding]);

  return (
    <>
      {children}
      <OnboardingModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default OnboardingWrapper;
