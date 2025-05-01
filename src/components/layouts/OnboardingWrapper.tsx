
import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { showOnboarding, isChecking, completeOnboarding } = useOnboarding();

  return (
    <>
      {children}
      
      {!isChecking && (
        <OnboardingModal 
          isOpen={showOnboarding} 
          onClose={completeOnboarding} 
        />
      )}
    </>
  );
};

export default OnboardingWrapper;
