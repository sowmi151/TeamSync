import React from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  department?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  department,
  className = ''
}) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-18 h-18 text-base font-bold'
  };

  // Sophisticated dark and classic gradient generator
  const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Deep charcoal, warm dark walnut, and muted antique gold
    const c1 = '#1C1C22';
    const c2 = '#23201B';
    const c3 = '#18181D';
    return `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`;
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 border border-white/[0.12] shadow-sm ${sizeClasses[size]} ${className}`}
      style={{
        background: getGradient(name)
      }}
      title={`${name}${department ? ` (${department})` : ''}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      ) : null}
      <span className="font-serif-title font-bold tracking-widest text-[#E8D390] select-none">
        {getInitials(name)}
      </span>
    </div>
  );
};
