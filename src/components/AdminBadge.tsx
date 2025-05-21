
import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminBadgeProps {
  tier?: 'owner' | 'manager' | 'support' | 'standard' | null;
  className?: string;
}

const AdminBadge: React.FC<AdminBadgeProps> = ({ tier, className = '' }) => {
  if (!tier) return null;
  
  const getIconAndColor = () => {
    switch (tier) {
      case 'owner':
        return { 
          icon: <ShieldAlert className="h-4 w-4 mr-1" />, 
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Owner'
        };
      case 'manager':
        return { 
          icon: <ShieldCheck className="h-4 w-4 mr-1" />, 
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          label: 'Manager'
        };
      case 'support':
        return { 
          icon: <ShieldCheck className="h-4 w-4 mr-1" />, 
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Support'
        };
      default:
        return { 
          icon: <Shield className="h-4 w-4 mr-1" />, 
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Admin'
        };
    }
  };
  
  const { icon, bg, text, label } = getIconAndColor();
  
  return (
    <Badge className={`flex items-center ${bg} ${text} border-none ${className}`}>
      {icon} {label}
    </Badge>
  );
};

export default AdminBadge;
