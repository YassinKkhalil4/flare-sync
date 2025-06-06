
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showSecurityLevel?: boolean;
  onSecurityCheck?: (value: string) => 'weak' | 'medium' | 'strong';
}

const SecureInput: React.FC<SecureInputProps> = ({
  type = 'password',
  label,
  showSecurityLevel = false,
  onSecurityCheck,
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<'weak' | 'medium' | 'strong'>('weak');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (onSecurityCheck && showSecurityLevel) {
      const level = onSecurityCheck(value);
      setSecurityLevel(level);
    }
    
    props.onChange?.(e);
  };

  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {label}
        </label>
      )}
      
      <div className="relative">
        <Input
          type={showPassword ? 'text' : type}
          className={cn('pr-10', className)}
          onChange={handleInputChange}
          {...props}
        />
        
        {type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {showSecurityLevel && props.value && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Security:</span>
          <span className={cn('font-medium capitalize', getSecurityColor())}>
            {securityLevel}
          </span>
        </div>
      )}
    </div>
  );
};

export default SecureInput;
