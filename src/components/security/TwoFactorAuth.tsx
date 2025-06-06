
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Key, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorAuthProps {
  isEnabled: boolean;
  onEnable: (code: string) => Promise<boolean>;
  onDisable: () => Promise<boolean>;
  onGenerateBackupCodes: () => Promise<string[]>;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  isEnabled,
  onEnable,
  onDisable,
  onGenerateBackupCodes
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();

  const handleEnable2FA = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: 'Verification Required',
        description: 'Please enter the verification code from your authenticator app',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await onEnable(verificationCode);
      if (success) {
        toast({
          title: 'Two-Factor Authentication Enabled',
          description: 'Your account is now more secure'
        });
        setVerificationCode('');
      } else {
        toast({
          title: 'Invalid Code',
          description: 'Please check your authenticator app and try again',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enable two-factor authentication',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsLoading(true);
    try {
      const success = await onDisable();
      if (success) {
        toast({
          title: 'Two-Factor Authentication Disabled',
          description: 'Your account security has been updated'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disable two-factor authentication',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const codes = await onGenerateBackupCodes();
      setBackupCodes(codes);
      setShowBackupCodes(true);
      toast({
        title: 'Backup Codes Generated',
        description: 'Save these codes in a secure location'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate backup codes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Two-Factor Authentication Enabled
          </CardTitle>
          <CardDescription>
            Your account is protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication adds an extra layer of security to your account
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateBackupCodes}
              disabled={isLoading}
            >
              <Key className="h-4 w-4 mr-2" />
              Generate Backup Codes
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={isLoading}
            >
              Disable 2FA
            </Button>
          </div>

          {showBackupCodes && backupCodes.length > 0 && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Backup Codes</CardTitle>
                <CardDescription>
                  Save these codes securely. Each code can only be used once.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-background p-2 rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Two-factor authentication requires you to enter a code from your authenticator app when signing in
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
          />
        </div>

        <Button
          onClick={handleEnable2FA}
          disabled={isLoading || !verificationCode.trim()}
          className="w-full"
        >
          {isLoading ? 'Enabling...' : 'Enable Two-Factor Authentication'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
