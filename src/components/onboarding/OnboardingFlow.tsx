
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft, Users, Target, Palette, Rocket } from 'lucide-react';

interface OnboardingData {
  role: string;
  goals: string[];
  platforms: string[];
  experience: string;
  teamSize: string;
  bio: string;
  niche: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    goals: [],
    platforms: [],
    experience: '',
    teamSize: '',
    bio: '',
    niche: ''
  });

  const steps = [
    {
      title: 'Welcome to FlareSync!',
      description: 'Let\'s personalize your experience',
      icon: Rocket
    },
    {
      title: 'Tell us about yourself',
      description: 'What\'s your role in content creation?',
      icon: Users
    },
    {
      title: 'What are your goals?',
      description: 'Help us understand what you want to achieve',
      icon: Target
    },
    {
      title: 'Choose your platforms',
      description: 'Which social media platforms do you use?',
      icon: Palette
    },
    {
      title: 'Final touches',
      description: 'Complete your profile setup',
      icon: CheckCircle
    }
  ];

  const roles = [
    { id: 'content-creator', label: 'Content Creator', description: 'Individual creator or influencer' },
    { id: 'social-media-manager', label: 'Social Media Manager', description: 'Managing social presence for a brand' },
    { id: 'marketing-agency', label: 'Marketing Agency', description: 'Agency managing multiple clients' },
    { id: 'brand-manager', label: 'Brand Manager', description: 'In-house brand marketing' }
  ];

  const goals = [
    'Increase engagement',
    'Grow followers',
    'Save time on content creation',
    'Improve content quality',
    'Analyze performance',
    'Schedule posts efficiently',
    'Team collaboration',
    'Brand partnerships'
  ];

  const platforms = [
    'Instagram',
    'Twitter',
    'Facebook',
    'LinkedIn',
    'TikTok',
    'YouTube',
    'Pinterest',
    'Snapchat'
  ];

  const experiences = [
    { id: 'beginner', label: 'Beginner', description: 'New to social media marketing' },
    { id: 'intermediate', label: 'Intermediate', description: 'Some experience with social media' },
    { id: 'advanced', label: 'Advanced', description: 'Experienced social media professional' },
    { id: 'expert', label: 'Expert', description: 'Social media marketing expert' }
  ];

  const teamSizes = [
    { id: 'solo', label: 'Just me', description: 'Working independently' },
    { id: 'small', label: '2-5 people', description: 'Small team' },
    { id: 'medium', label: '6-20 people', description: 'Medium team' },
    { id: 'large', label: '20+ people', description: 'Large team or agency' }
  ];

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: 'goals' | 'platforms', value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to FlareSync!</h2>
              <p className="text-muted-foreground">
                Let's get you set up with a personalized experience that matches your content creation needs.
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">What's your role?</h2>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    data.role === role.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => updateData('role', role.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{role.label}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {data.role === role.id && <CheckCircle className="h-5 w-5 text-primary" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">What are your main goals?</h2>
            <p className="text-muted-foreground">Select all that apply</p>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((goal) => (
                <Badge
                  key={goal}
                  variant={data.goals.includes(goal) ? 'default' : 'outline'}
                  className="cursor-pointer p-3 justify-center"
                  onClick={() => toggleArrayValue('goals', goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Which platforms do you use?</h2>
            <p className="text-muted-foreground">Select your active platforms</p>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <Badge
                  key={platform}
                  variant={data.platforms.includes(platform) ? 'default' : 'outline'}
                  className="cursor-pointer p-3 justify-center"
                  onClick={() => toggleArrayValue('platforms', platform)}
                >
                  {platform}
                </Badge>
              ))}
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="font-medium">Experience Level</h3>
              <div className="grid grid-cols-1 gap-3">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      data.experience === exp.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => updateData('experience', exp.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{exp.label}</h4>
                        <p className="text-sm text-muted-foreground">{exp.description}</p>
                      </div>
                      {data.experience === exp.id && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Final touches</h2>
            
            <div className="space-y-4">
              <h3 className="font-medium">Team Size</h3>
              <div className="grid grid-cols-1 gap-3">
                {teamSizes.map((size) => (
                  <div
                    key={size.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      data.teamSize === size.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => updateData('teamSize', size.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{size.label}</h4>
                        <p className="text-sm text-muted-foreground">{size.description}</p>
                      </div>
                      {data.teamSize === size.id && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Content Niche (Optional)</Label>
              <Input
                id="niche"
                placeholder="e.g., fitness, travel, tech, lifestyle..."
                value={data.niche}
                onChange={(e) => updateData('niche', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself and your content..."
                value={data.bio}
                onChange={(e) => updateData('bio', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip Setup
              </Button>
            </div>
          </div>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
