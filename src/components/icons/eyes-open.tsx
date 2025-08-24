import React from 'react';

interface EyeIconProps {
  className?: string;
  onClick?: () => void;
}

export const EyeIcon: React.FC<EyeIconProps> = ({ className, onClick }) => (
  <svg
    className={className}
    onClick={onClick}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const EyeOffIcon: React.FC<EyeIconProps> = ({ className, onClick }) => (
  <svg
    className={className}
    onClick={onClick}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m9.88 9.88a3 3 0 1 0 4.24 4.24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="2"
      y1="2"
      x2="22"
      y2="22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);