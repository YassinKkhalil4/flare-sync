
import { SVGProps } from 'react';

interface FlareSyncProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

const FlareSync = ({ className, ...props }: FlareSyncProps) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 2.66667C8.63619 2.66667 2.66667 8.63619 2.66667 16C2.66667 23.3638 8.63619 29.3333 16 29.3333C23.3638 29.3333 29.3333 23.3638 29.3333 16C29.3333 8.63619 23.3638 2.66667 16 2.66667ZM16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z"
        fill="currentColor"
      />
      <path
        d="M20 9.33333L12.6667 16L20 22.6667"
        stroke="currentColor"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
    </svg>
  );
};

export default FlareSync;
