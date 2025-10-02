import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Wrench, Package } from "lucide-react";
import { CreateEquipmentDialog } from "@/components/CreateEquipmentDialog";
import type { Equipment as EquipmentType } from "@shared/schema";

const equipmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").default(1),
  available: z.boolean().default(true),
});

type EquipmentForm = z.infer<typeof equipmentFormSchema>;

export default function Equipment() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: equipment = [], isLoading } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment"],
  });

  const form = useForm<EquipmentForm>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      quantity: 1,
      available: true,
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentForm }) =>
      apiRequest("PATCH", `/api/equipment/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setEditingEquipment(null);
      form.reset();
      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update equipment",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/equipment/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setDeletingId(null);
      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive",
      });
    },
  });

  const onEditSubmit = (data: EquipmentForm) => {
    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data });
    }
  };

  const openEditDialog = (equip: EquipmentType) => {
    setEditingEquipment(equip);
    form.reset({
      name: equip.name,
      category: equip.category || "",
      description: equip.description || "",
      quantity: equip.quantity ?? 1,
      available: equip.available ?? true,
    });
  };

  const closeEditDialog = () => {
    setEditingEquipment(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-equipment">Equipment</h1>
          <p className="text-muted-foreground mt-1">
            Track cameras, lighting, and other gear for your shoots
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="button-add-equipment"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : equipment.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No equipment yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first piece of equipment to start tracking gear
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-equipment">
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipment.map((equip) => (
            <Card key={equip.id} data-testid={`card-equipment-${equip.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate" data-testid={`text-equipment-name-${equip.id}`}>
                      {equip.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1" data-testid={`text-category-${equip.id}`}>
                      {equip.category}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(equip)}
                    data-testid={`button-edit-equipment-${equip.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(equip.id)}
                    data-testid={`button-delete-equipment-${equip.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={equip.available ? "default" : "secondary"} data-testid={`badge-available-${equip.id}`}>
                    {equip.available ? "Available" : "In Use"}
                  </Badge>
                  <Badge variant="outline" data-testid={`badge-quantity-${equip.id}`}>
                    Qty: {equip.quantity}
                  </Badge>
                </div>
                {equip.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2" data-testid={`text-description-${equip.id}`}>
                    {equip.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <Dialog open={!!editingEquipment} onOpenChange={closeEditDialog}>
        <DialogContent data-testid="dialog-equipment-form">
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
            <DialogDescription>
              Update the equipment information
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Canon EOS R5" {...field} data-testid="input-equipment-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Camera, Lighting, Lens, etc."
                        {...field}
                        data-testid="input-equipment-category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        data-testid="input-equipment-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details about this equipment..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="input-equipment-description"
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
                  onClick={closeEditDialog}
                  data-testid="button-cancel-equipment"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-equipment"
                >
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent data-testid="dialog-delete-equipment">
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this equipment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingId(null)}
              data-testid="button-cancel-delete-equipment"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-equipment"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
