import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

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

interface QuestionType {
  id: string;
  label: string;
  count: number;
}

const CreateQuizDialog = ({ open, onOpenChange, resources }: CreateQuizDialogProps) => {
  const [step, setStep] = useState<'name' | 'materials' | 'questionTypes'>('name');
  const [quizName, setQuizName] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { id: 'multiple', label: 'Multiple Choice', count: 10 },
    { id: 'short', label: 'Short Answer', count: 0 },
    { id: 'frq', label: 'Free Response (FRQ)', count: 0 },
    { id: 'truefalse', label: 'True or False', count: 0 },
    { id: 'fill', label: 'Fill in the Blank', count: 0 },
  ]);

  const handleNext = () => {
    if (step === 'name') {
      if (!quizName.trim()) {
        toast.error("Please enter a quiz name");
        return;
      }
      setStep('materials');
    } else if (step === 'materials') {
      if (selectedMaterials.length === 0) {
        toast.error("Please select at least one material");
        return;
      }
      setStep('questionTypes');
    }
  };

  const handleBack = () => {
    if (step === 'materials') setStep('name');
    else if (step === 'questionTypes') setStep('materials');
  };

  const handleCreateQuiz = () => {
    const totalQuestions = questionTypes.reduce((sum, type) => sum + type.count, 0);
    if (totalQuestions === 0) {
      toast.error("Please select at least one question type");
      return;
    }
    // TODO: Implement quiz creation logic
    toast.success("Quiz created successfully!");
    onOpenChange(false);
    setStep('name');
    setQuizName("");
    setSelectedMaterials([]);
    setQuestionTypes(questionTypes.map(type => ({ ...type, count: type.id === 'multiple' ? 10 : 0 })));
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedMaterials(resources.map(r => r.id));
  };

  const updateQuestionCount = (typeId: string, newCount: number) => {
    setQuestionTypes(prev =>
      prev.map(type =>
        type.id === typeId ? { ...type, count: newCount } : type
      )
    );
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

        {step === 'name' && (
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
        )}

        {step === 'materials' && (
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
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 'questionTypes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Question Types</h2>
              <p className="text-muted-foreground">What type of questions do you want to be asked?</p>
            </div>

            <div className="space-y-6">
              {questionTypes.map((type) => (
                <div key={type.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{type.label}</Label>
                    <div className="w-16 h-8 rounded-md border flex items-center justify-center bg-background">
                      {type.count}
                    </div>
                  </div>
                  <Slider
                    value={[type.count]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(value) => updateQuestionCount(type.id, value[0])}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleCreateQuiz}>
                Create Test
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizDialog;