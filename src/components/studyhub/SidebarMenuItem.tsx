import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarMenuItemProps {
  icon: LucideIcon;
  label: string;
  view?: 'chat' | 'notes' | 'pdf' | 'transcript' | 'dual' | 'quiz' | 'flashcards' | 'mindmap' | 'matchgame';
  onClick?: (view: typeof view) => void;
}

export const SidebarMenuItem = ({ icon: Icon, label, view, onClick }: SidebarMenuItemProps) => {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 hover:bg-accent"
      onClick={() => view && onClick?.(view)}
    >
      <Icon className="h-5 w-5 text-primary" />
      {label}
    </Button>
  );
};