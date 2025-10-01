import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Shirt, ImageIcon } from "lucide-react";
import type { CostumeProgress } from "@shared/schema";

const costumeFormSchema = z.object({
  characterName: z.string().min(1, "Character name is required"),
  seriesName: z.string().optional(),
  status: z.enum(["planning", "in-progress", "completed"]).default("planning"),
  completionPercentage: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

type CostumeForm = z.infer<typeof costumeFormSchema>;

const statusOptions = [
  { value: "planning", label: "Planning" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function Costumes() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState<CostumeProgress | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: costumes = [], isLoading } = useQuery<CostumeProgress[]>({
    queryKey: ["/api/costumes"],
  });

  const form = useForm<CostumeForm>({
    resolver: zodResolver(costumeFormSchema),
    defaultValues: {
      characterName: "",
      seriesName: "",
      status: "planning",
      completionPercentage: 0,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CostumeForm) => {
      const formData = new FormData();
      formData.append("characterName", data.characterName);
      formData.append("seriesName", data.seriesName || "");
      formData.append("status", data.status);
      formData.append("completionPercentage", String(data.completionPercentage));
      formData.append("notes", data.notes || "");
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/costumes", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to create costume");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costumes"] });
      toast({
        title: "Success",
        description: "Costume added successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
      setImagePreview(null);
      setImageFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add costume",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CostumeForm }) => {
      const formData = new FormData();
      formData.append("characterName", data.characterName);
      formData.append("seriesName", data.seriesName || "");
      formData.append("status", data.status);
      formData.append("completionPercentage", String(data.completionPercentage));
      formData.append("notes", data.notes || "");
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`/api/costumes/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update costume");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costumes"] });
      toast({
        title: "Success",
        description: "Costume updated successfully",
      });
      setEditingCostume(null);
      form.reset();
      setImagePreview(null);
      setImageFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update costume",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/costumes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete costume");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costumes"] });
      toast({
        title: "Success",
        description: "Costume deleted successfully",
      });
      setDeletingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete costume",
        variant: "destructive",
      });
    },
  });

  const handleOpenAddDialog = () => {
    form.reset({
      characterName: "",
      seriesName: "",
      status: "planning",
      completionPercentage: 0,
      notes: "",
    });
    setImagePreview(null);
    setImageFile(null);
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (costume: CostumeProgress) => {
    setEditingCostume(costume);
    form.reset({
      characterName: costume.characterName,
      seriesName: costume.seriesName || "",
      status: costume.status as "planning" | "in-progress" | "completed",
      completionPercentage: costume.completionPercentage ?? 0,
      notes: costume.notes || "",
    });
    setImagePreview(costume.imageUrl || null);
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: CostumeForm) => {
    if (editingCostume) {
      updateMutation.mutate({ id: editingCostume.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "secondary";
      case "in-progress":
        return "default";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-costumes">Costumes</h1>
          <p className="text-muted-foreground mt-1">
            Track your cosplay costume progress
          </p>
        </div>
        <Button 
          onClick={handleOpenAddDialog} 
          data-testid="button-add-costumes"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Costume
        </Button>
      </div>

      {costumes.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Shirt className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No costumes yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your cosplay costume progress
            </p>
            <Button 
              onClick={handleOpenAddDialog}
              data-testid="button-add-first-costumes"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Costume
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {costumes.map((costume) => (
            <Card key={costume.id} data-testid={`card-costume-${costume.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {costume.characterName}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEditDialog(costume)}
                    data-testid={`button-edit-costume-${costume.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(costume.id)}
                    data-testid={`button-delete-costume-${costume.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costume.imageUrl && (
                    <img
                      src={costume.imageUrl}
                      alt={costume.characterName}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                  {!costume.imageUrl && (
                    <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {costume.seriesName && (
                    <p className="text-sm text-muted-foreground">
                      From: {costume.seriesName}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={getStatusColor(costume.status)}
                      data-testid={`badge-status-${costume.id}`}
                    >
                      {costume.status === "in-progress" ? "In Progress" : costume.status.charAt(0).toUpperCase() + costume.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium" data-testid={`progress-text-${costume.id}`}>
                        {costume.completionPercentage ?? 0}%
                      </span>
                    </div>
                    <Progress 
                      value={costume.completionPercentage ?? 0} 
                      data-testid={`progress-bar-${costume.id}`}
                    />
                  </div>
                  {costume.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{costume.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen || editingCostume !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingCostume(null);
          form.reset();
          setImagePreview(null);
          setImageFile(null);
        }
      }}>
        <DialogContent data-testid="dialog-costume-form">
          <DialogHeader>
            <DialogTitle>
              {editingCostume ? "Edit Costume" : "Add Costume"}
            </DialogTitle>
            <DialogDescription>
              {editingCostume ? "Update costume progress" : "Add a new costume to track"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <FormLabel>Image (Optional)</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="characterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Character Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter character name"
                        data-testid="input-costume-character"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seriesName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series Name (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter series name"
                        data-testid="input-costume-series"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-costume-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completionPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        data-testid="slider-costume-completion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add any notes"
                        rows={3}
                        data-testid="input-costume-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingCostume(null);
                    form.reset();
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  data-testid="button-cancel-costume"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-costume"
                >
                  {editingCostume ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Costume</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this costume? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              data-testid="button-confirm-delete-costume"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
