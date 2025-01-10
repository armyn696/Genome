import { Switch } from "@/components/ui/switch";
import { Globe, GraduationCap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ResourceList from '../ResourceList';

interface ChatToolbarOptionsProps {
  webBrowsingEnabled: boolean;
  setWebBrowsingEnabled: (enabled: boolean) => void;
  academicSearchEnabled: boolean;
  setAcademicSearchEnabled: (enabled: boolean) => void;
  resources?: any[];
  onResourceSelect?: (resource: any) => void;
  selectedResources?: any[];
}

export const ChatToolbarOptions = ({
  webBrowsingEnabled,
  setWebBrowsingEnabled,
  academicSearchEnabled,
  setAcademicSearchEnabled,
  resources = [],
  onResourceSelect,
  selectedResources = []
}: ChatToolbarOptionsProps) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-1.5 mb-2">
      <div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-1.5 py-0.5">
        <Globe className="h-3 w-3" />
        <span className="text-[10px] whitespace-nowrap">Web Browsing</span>
        <Switch
          checked={webBrowsingEnabled}
          onCheckedChange={setWebBrowsingEnabled}
          className="scale-75"
        />
      </div>

      <div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-1.5 py-0.5">
        <GraduationCap className="h-3 w-3" />
        <span className="text-[10px] whitespace-nowrap">Search Academic Papers</span>
        <Switch
          checked={academicSearchEnabled}
          onCheckedChange={setAcademicSearchEnabled}
          className="scale-75"
        />
      </div>

      {resources && resources.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-6 px-2 text-xs whitespace-nowrap">
              <FileText className="h-3 w-3" />
              {selectedResources?.length || 0} material(s)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Materials</DialogTitle>
            </DialogHeader>
            <ResourceList
              resources={resources}
              onResourceSelect={onResourceSelect}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};