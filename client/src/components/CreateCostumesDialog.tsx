import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadWithCrop } from "@/components/ImageUploadWithCrop";
import { InlineEdit } from "@/components/InlineEdit";
import { X, Plus } from "lucide-react";
import type { CostumeProgress } from "@shared/schema";

interface CreateCostumesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (costume: any) => void;
  editItem?: CostumeProgress;
}

export function CreateCostumesDialog({
  open,
  onOpenChange,
  onSuccess,
  editItem,
}: CreateCostumesDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [characterName, setCharacterName] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [status, setStatus] = useState("planning");
  const [notes, setNotes] = useState("");
  const [todos, setTodos] = useState<string[]>([]);
  const [currentTodo, setCurrentTodo] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (editItem) {
      setCharacterName(editItem.characterName || "");
      setSeriesName(editItem.seriesName || "");
      setStatus(editItem.status || "planning");
      setNotes(editItem.notes || "");
      setTodos(editItem.todos || []);
      setImagePreview(editItem.imageUrl || "");
      setImageFile(null);
    }
  }, [editItem]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/costumes", {
        method: "POST",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create costume");
      }
      return await response.json();
    },
    onSuccess: (newCostume) => {
      queryClient.invalidateQueries({ queryKey: ["/api/costumes"] });
      toast({
        title: "Success",
        description: "Costume added successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(newCostume);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create costume",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/costumes/${editItem!.id}`, {
        method: "PATCH",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update costume");
      }
      return await response.json();
    },
    onSuccess: (updatedCostume) => {
      queryClient.invalidateQueries({ queryKey: ["/api/costumes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/costumes", editItem!.id] });
      toast({
        title: "Success",
        description: "Costume updated successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(updatedCostume);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update costume",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCharacterName("");
    setSeriesName("");
    setStatus("planning");
    setNotes("");
    setTodos([]);
    setCurrentTodo("");
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) {
      toast({
        title: "Error",
        description: "Character name is required",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("characterName", characterName.trim());
    if (seriesName.trim()) {
      formData.append("seriesName", seriesName.trim());
    }
    formData.append("status", status);
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }
    formData.append("todos", JSON.stringify(todos));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (editItem) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="dialog-create-costumes">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Costume" : "Add New Costume"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Update costume details" : "Track a new costume project"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploadWithCrop
            value={imagePreview}
            onChange={(file, preview) => {
              setImageFile(file);
              setImagePreview(preview);
            }}
            aspect={1}
          />

          <div className="space-y-2">
            <Label htmlFor="characterName">Character Name *</Label>
            <InlineEdit
              value={characterName}
              onChange={setCharacterName}
              placeholder="e.g., Sailor Moon"
              type="text"
              data-testid="input-costumes-character"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seriesName">Series Name (Optional)</Label>
            <InlineEdit
              value={seriesName}
              onChange={setSeriesName}
              placeholder="e.g., Sailor Moon"
              type="text"
              data-testid="input-costumes-series"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" data-testid="select-costumes-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-testid="input-costumes-notes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="todos">Todo List (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="todos"
                placeholder="Add a todo item..."
                value={currentTodo}
                onChange={(e) => setCurrentTodo(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentTodo.trim()) {
                      setTodos([...todos, currentTodo.trim()]);
                      setCurrentTodo("");
                    }
                  }
                }}
                data-testid="input-costumes-todo"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (currentTodo.trim()) {
                    setTodos([...todos, currentTodo.trim()]);
                    setCurrentTodo("");
                  }
                }}
                data-testid="button-add-todo"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {todos.length > 0 && (
              <div className="space-y-1 mt-2">
                {todos.map((todo, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted" data-testid={`todo-item-${index}`}>
                    <span className="flex-1 text-sm">{todo}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setTodos(todos.filter((_, i) => i !== index))}
                      data-testid={`button-remove-todo-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save"
            >
              {editItem
                ? (updateMutation.isPending ? "Updating..." : "Update")
                : (createMutation.isPending ? "Creating..." : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
