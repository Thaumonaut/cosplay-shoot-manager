import { useState } from "react";
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

interface CreateCostumesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (costume: any) => void;
}

export function CreateCostumesDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCostumesDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [characterName, setCharacterName] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [status, setStatus] = useState("planning");
  const [completionPercentage, setCompletionPercentage] = useState("0");
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      setCharacterName("");
      setSeriesName("");
      setStatus("planning");
      setCompletionPercentage("0");
      setNotes("");
      setImageFile(null);
      setImagePreview("");
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

    const completion = parseInt(completionPercentage);
    if (isNaN(completion) || completion < 0 || completion > 100) {
      toast({
        title: "Error",
        description: "Completion percentage must be between 0 and 100",
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
    formData.append("completionPercentage", completion.toString());
    if (notes.trim()) {
      formData.append("notes", notes.trim());
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-create-costumes">
        <DialogHeader>
          <DialogTitle>Add New Costume</DialogTitle>
          <DialogDescription>
            Track a new costume project
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
            <Input
              id="characterName"
              placeholder="e.g., Sailor Moon"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              data-testid="input-costumes-character"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seriesName">Series Name (Optional)</Label>
            <Input
              id="seriesName"
              placeholder="e.g., Sailor Moon"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
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
            <Label htmlFor="completionPercentage">Completion Percentage *</Label>
            <Input
              id="completionPercentage"
              type="number"
              min="0"
              max="100"
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(e.target.value)}
              data-testid="input-costumes-completion"
            />
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="button-save"
            >
              {createMutation.isPending ? "Adding..." : "Add Costume"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
