import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export const SidebarMenuItem = ({ icon: Icon, label, onClick }: SidebarMenuItemProps) => {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 hover:bg-accent"
      onClick={onClick}
    >
      <Icon className="h-5 w-5 text-primary" />
      {label}
    </Button>
  );
};