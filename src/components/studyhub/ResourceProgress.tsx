import { FileText, Plus, Trash2, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ResourceUploader from "../ResourceUploader";
import { Resource } from "@/types";

interface ResourceProgressProps {
  resources: Resource[];
  onResourceAdd?: (resource: Resource) => void;
  onResourceDelete?: (resourceId: string) => void;
  onResourceSelect?: (resource: Resource) => void;
  onResourceRename?: (resourceId: string, newName: string) => void;
}

// تابع برای کوتاه کردن نام فایل
const truncateFileName = (fileName: string, maxLength: number = 30) => {
  if (fileName.length <= maxLength) return fileName;
  
  const extension = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
  
  if (nameWithoutExt.length <= maxLength - 7) return fileName;
  
  const start = nameWithoutExt.slice(0, (maxLength - 5) / 2);
  const end = nameWithoutExt.slice(-(maxLength - 5) / 2);
  
  return `${start}...${end}.${extension}`;
};

const ResourceProgress = ({ resources, onResourceAdd, onResourceDelete, onResourceSelect, onResourceRename }: ResourceProgressProps) => {

  return (

    <Card className="p-6 bg-card/50 backdrop-blur-sm">

      <h2 className="text-2xl font-bold mb-6">Progress of your Study Set</h2>

      {resources.length === 0 ? (

        <div className="text-center py-8">

          <p className="text-muted-foreground mb-4">No study materials uploaded yet.</p>

          <Dialog>

            <DialogTrigger asChild>

              <Button

                variant="outline"

                className="gap-2 border-primary/50 hover:bg-primary/10"

              >

                <Plus className="h-5 w-5 text-primary" />

                Add Your First Resource

              </Button>

            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-sm">

              <DialogHeader>

                <DialogTitle className="text-2xl font-bold text-center mb-4">Add Material</DialogTitle>

              </DialogHeader>

              {onResourceAdd && <ResourceUploader onResourceAdd={onResourceAdd} />}

            </DialogContent>

          </Dialog>

        </div>

      ) : (

        <div className="space-y-6">

          <div className="space-y-4">

            {resources.map(resource => (

              <div key={resource.id} className="flex items-center gap-4">

                <FileText 

                  className="h-5 w-5 text-primary shrink-0 cursor-pointer hover:text-primary/80" 

                  onClick={() => onResourceSelect?.(resource)}

                />

                <div className="flex-1 min-w-0">

                  <div className="flex items-center justify-between mb-2">

                    <div className="flex items-center min-w-0 flex-1 gap-2">

                      <p 

                        className="font-medium truncate cursor-pointer hover:text-primary"

                        onClick={() => onResourceSelect?.(resource)}

                        title={resource.name}

                      >

                        {truncateFileName(resource.name)}

                      </p>

                    </div>

                    <div className="flex items-center gap-4 shrink-0">

                      <span className="text-sm text-muted-foreground">0 / 14</span>

                      {onResourceRename && (

                        <Button

                          variant="ghost"

                          size="icon"

                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"

                          onClick={() => {

                            const newName = prompt('نام جدید را وارد کنید:', resource.name);

                            if (newName) {

                              onResourceRename(resource.id, newName);

                            }

                          }}

                        >

                          <Pencil className="h-4 w-4" />

                        </Button>

                      )}

                      <Button

                        variant="ghost"

                        size="icon"

                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"

                        onClick={() => onResourceDelete?.(resource.id)}

                      >

                        <Trash2 className="h-5 w-5" />

                      </Button>

                    </div>

                  </div>

                  <Progress value={0} className="h-2" />

                </div>

              </div>

            ))}

          </div>

          

          <Dialog>

            <DialogTrigger asChild>

              <Button

                variant="outline"

                className="w-full gap-2 border-primary/50 hover:bg-primary/10"

              >

                <Plus className="h-5 w-5 text-primary" />

                Add Another Resource

              </Button>

            </DialogTrigger>

            <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-sm">

              <DialogHeader>

                <DialogTitle className="text-2xl font-bold text-center mb-4">Add Material</DialogTitle>

              </DialogHeader>

              {onResourceAdd && <ResourceUploader onResourceAdd={onResourceAdd} />}

            </DialogContent>

          </Dialog>

        </div>

      )}

    </Card>

  );

};



export default ResourceProgress;