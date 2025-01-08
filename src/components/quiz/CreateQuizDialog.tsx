import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Check, Search } from "lucide-react";
import { toast } from "sonner";

interface Resource {
  id: string;
  name: string;
  type: string;
}

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: Resource[];
}

const CreateQuizDialog = ({ open, onOpenChange, resources }: CreateQuizDialogProps) => {
  const [step, setStep] = useState<'name' | 'materials'>('name');
  const [quizName, setQuizName] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleNext = () => {
    if (!quizName.trim()) {
      toast.error("Please enter a quiz name");
      return;
    }
    setStep('materials');
  };

  const handleCreateQuiz = () => {
    if (selectedMaterials.length === 0) {
      toast.error("Please select at least one material");
      return;
    }
    // TODO: Implement quiz creation logic
    toast.success("Quiz created successfully!");
    onOpenChange(false);
    setStep('name');
    setQuizName("");
    setSelectedMaterials([]);
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedMaterials(resources.map(r => r.id));
  };

  const filteredResources = resources.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a Test</DialogTitle>
        </DialogHeader>

        {step === 'name' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quizName">Name</Label>
              <Input
                id="quizName"
                placeholder="Enter quiz name"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Materials</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search materials"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={() => {}}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add More
                </Button>
                <Button variant="secondary" onClick={selectAll}>
                  <Check className="mr-2 h-4 w-4" />
                  Select All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedMaterials.includes(resource.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  }`}
                  onClick={() => toggleMaterial(resource.id)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(resource.id)}
                      onChange={() => toggleMaterial(resource.id)}
                      className="h-4 w-4"
                    />
                    <span>{resource.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('name')}>
                Back
              </Button>
              <Button onClick={handleCreateQuiz}>
                Create Quiz
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizDialog;