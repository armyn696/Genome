import React from "react";
import { cn } from "@/lib/utils";

interface BackgroundProps {
  className?: string;
}

const Background: React.FC<BackgroundProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]",
        className
      )}
      aria-hidden="true"
    />
  );
};

export default Background;