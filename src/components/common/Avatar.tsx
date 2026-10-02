import React, { useState } from "react";

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  department?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  size = "md",
  department,
  className = "",
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const getInitials = (fullName: string) => {
    const parts = (fullName || "SO").trim().split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (fullName || "SO").slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-sm",
    xl: "w-18 h-18 text-base font-bold",
  };

  const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c1 = "#1C1C22";
    const c2 = "#23201B";
    const c3 = "#18181D";
    return `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`;
  };

  const showImage = Boolean(avatarUrl) && !imageFailed;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 border border-white/[0.12] shadow-sm select-none ${sizeClasses[size]} ${className}`}
      style={{
        background: getGradient(name || ""),
      }}
      title={`${name}${department ? ` (${department})` : ""}`}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="font-serif-title font-bold tracking-widest text-[#E8D390]">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};