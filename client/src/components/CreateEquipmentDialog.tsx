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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ImageUploadWithCrop } from "@/components/ImageUploadWithCrop";
import { InlineEdit } from "@/components/InlineEdit";
import type { Equipment } from "@shared/schema";

interface CreateEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (equipment: any) => void;
  editItem?: Equipment;
}

export function CreateEquipmentDialog({
  open,
  onOpenChange,
  onSuccess,
  editItem,
}: CreateEquipmentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setCategory(editItem.category || "");
      setDescription(editItem.description || "");
      setQuantity(String(editItem.quantity || 1));
      setAvailable(editItem.available ?? true);
      setImagePreview(editItem.imageUrl || "");
      setImageFile(null);
    }
  }, [editItem]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/equipment", {
        method: "POST",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create equipment");
      }
      return await response.json();
    },
    onSuccess: (newEquipment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({
        title: "Success",
        description: "Equipment added successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(newEquipment);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create equipment",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/equipment/${editItem!.id}`, {
        method: "PATCH",
        credentials: "include",
        body: data,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update equipment");
      }
      return await response.json();
    },
    onSuccess: (updatedEquipment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment", editItem!.id] });
      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.(updatedEquipment);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update equipment",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setCategory("");
    setDescription("");
    setQuantity("1");
    setAvailable(true);
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    if (!category.trim()) {
      toast({
        title: "Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      toast({
        title: "Error",
        description: "Quantity must be at least 1",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category.trim());
    if (description.trim()) {
      formData.append("description", description.trim());
    }
    formData.append("quantity", qty.toString());
    formData.append("available", available.toString());
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
      <DialogContent data-testid="dialog-create-equipment">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Update equipment details" : "Add new equipment to track for your shoots"}
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
            <Label htmlFor="name">Name *</Label>
            <InlineEdit
              value={name}
              onChange={setName}
              placeholder="e.g., Canon EOS R5"
              type="text"
              data-testid="input-equipment-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <InlineEdit
              value={category}
              onChange={setCategory}
              placeholder="e.g., Camera"
              type="text"
              data-testid="input-equipment-category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <InlineEdit
              value={description}
              onChange={setDescription}
              placeholder="Additional details..."
              type="text"
              data-testid="input-equipment-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              data-testid="input-equipment-quantity"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="available">Available</Label>
            <Switch
              id="available"
              checked={available}
              onCheckedChange={setAvailable}
              data-testid="switch-equipment-available"
            />
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
