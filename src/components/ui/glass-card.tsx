import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <Card className={`bg-iosGlass backdrop-blur-xl border border-iosBorder shadow-[0_4px_30px_rgba(0,0,0,0.2)] rounded-2xl ${className}`}>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
} 