
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'light';
}

const Logo: React.FC<LogoProps> = ({ variant = 'default' }) => {
  return (
    <Link to="/" className="flex items-center justify-center">
      <div className="flex items-center justify-center h-8 w-8">
        <img 
          src="/lovable-uploads/e747331f-a5fa-47e5-b176-e76f155c8b8c.png" 
          alt="FlareSync Logo" 
          className="h-full w-full object-contain"
        />
      </div>
    </Link>
  );
};

export default Logo;
