
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'light';
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ variant = 'default', className = '', size = 'medium' }) => {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10"
  };

  return (
    <Link to="/" className={`flex items-center justify-center ${className}`}>
      <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
        <img 
          src="/lovable-uploads/fa5e342e-5e7f-4d58-9221-7a02f366c270.png" 
          alt="FlareSync Logo" 
          className="h-full w-full object-contain"
        />
      </div>
    </Link>
  );
};

export default Logo;
