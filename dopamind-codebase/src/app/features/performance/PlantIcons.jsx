import React from 'react';

export const SeedIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 18C15 18 17 16 17 13C17 10 14 6 12 4C10 6 7 10 7 13C7 16 9 18 12 18Z" fill="var(--color-amber)" opacity="0.8" />
  </svg>
);

export const SproutIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 20V12" stroke="var(--color-emerald-base)" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 12C12 12 16 8 16 5C16 5 12 5 12 12Z" fill="var(--color-emerald-light)" />
  </svg>
);

export const HerbIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 20V8" stroke="var(--color-emerald-base)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 14C12 14 18 10 18 6C18 6 12 7 12 14Z" fill="var(--color-emerald-light)" />
    <path d="M12 16C12 16 6 12 6 8C6 8 12 9 12 16Z" fill="var(--color-emerald-light)" />
  </svg>
);

export const SageIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22V6" stroke="var(--color-emerald-base)" strokeWidth="3" strokeLinecap="round" />
    <path d="M12 12C12 12 20 7 20 2C20 2 12 4 12 12Z" fill="var(--color-emerald-light)" />
    <path d="M12 15C12 15 4 10 4 5C4 5 12 7 12 15Z" fill="var(--color-emerald-light)" />
    <path d="M12 19C12 19 18 16 18 11C18 11 12 12 12 19Z" fill="var(--color-emerald-light)" />
    <path d="M12 18C12 18 6 15 6 10C6 10 12 11 12 18Z" fill="var(--color-emerald-light)" />
  </svg>
);

export const FlowerIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22V10" stroke="var(--color-emerald-base)" strokeWidth="3" strokeLinecap="round" />
    <path d="M12 16C12 16 6 13 6 8C6 8 12 9 12 16Z" fill="var(--color-emerald-light)" />
    <path d="M12 18C12 18 18 15 18 10C18 10 12 11 12 18Z" fill="var(--color-emerald-light)" />
    
    {/* Flower Petals */}
    <circle cx="12" cy="7" r="4" fill="var(--color-accent-gold)" />
    <circle cx="8" cy="10" r="3.5" fill="var(--color-accent-gold)" />
    <circle cx="16" cy="10" r="3.5" fill="var(--color-accent-gold)" />
    <circle cx="9" cy="4" r="3.5" fill="var(--color-accent-gold)" />
    <circle cx="15" cy="4" r="3.5" fill="var(--color-accent-gold)" />
    
    {/* Flower Center */}
    <circle cx="12" cy="7" r="2" fill="var(--color-error-coral)" />
  </svg>
);
