import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ResourceList from "@/components/ResourceList";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  creationType: z.enum(["scratch", "material"])
});

const FlashcardsHub = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      creationType: "scratch"
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // Handle form submission
    setIsDialogOpen(false);
  };

  return (
    <div className="relative z-10 container mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">
            Manage, create, and review flashcards for your study set.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-5 w-5" />
                Create Flashcard Set
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create a Flashcards Set</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name Your Flashcards Set</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter set name..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Choose an Option</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="creationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 gap-4"
                              >
                                <Label
                                  htmlFor="scratch"
                                  className="flex flex-col items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:bg-accent"
                                >
                                  <RadioGroupItem value="scratch" id="scratch" className="sr-only" />
                                  <img 
                                    src="/lovable-uploads/b6f66e17-ea50-475e-85f5-31387824454f.png" 
                                    alt="Start from scratch" 
                                    className="w-24 h-24"
                                  />
                                  <div className="text-center">
                                    <h4 className="font-semibold">Start From Scratch</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Create a flashcards set from scratch.
                                    </p>
                                  </div>
                                </Label>
                                
                                <Label
                                  htmlFor="material"
                                  className="flex flex-col items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:bg-accent"
                                >
                                  <RadioGroupItem value="material" id="material" className="sr-only" />
                                  <img 
                                    src="/lovable-uploads/b6f66e17-ea50-475e-85f5-31387824454f.png" 
                                    alt="Create from material" 
                                    className="w-24 h-24"
                                  />
                                  <div className="text-center">
                                    <h4 className="font-semibold">Create From Material</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Generate a flashcards set from your current studyset material
                                    </p>
                                  </div>
                                </Label>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Continue</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2">
            Combine
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <Card className="w-full aspect-[2/1] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-semibold mb-2">No Flashcards Found</h2>
        <p className="text-muted-foreground mb-4">
          Create your first flashcard to get started.
        </p>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-5 w-5" />
          Create Flashcard
        </Button>
      </Card>
    </div>
  );
};

export default FlashcardsHub;