import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Wrench, Package } from "lucide-react";
import { CreateEquipmentDialog } from "@/components/CreateEquipmentDialog";
import type { Equipment as EquipmentType } from "@shared/schema";

export default function Equipment() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentType | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: equipment = [], isLoading } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment"],
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

  const openEditDialog = (equip: EquipmentType) => {
    setEditingItem(equip);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingItem(undefined);
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
            <Card 
              key={equip.id} 
              className="cursor-pointer hover-elevate"
              onClick={() => openEditDialog(equip)}
              data-testid={`card-equipment-${equip.id}`}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                    {equip.imageUrl ? (
                      <img
                        src={equip.imageUrl}
                        alt={equip.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        role="img"
                        aria-label="Equipment placeholder"
                        className="w-full h-full text-muted-foreground"
                      >
                        <rect width="100%" height="100%" fill="none" />
                        <path d="M21 7h-3.2l-1.6-1.6A1 1 0 0 0 15.8 5H8.2a1 1 0 0 0-.8.4L5.8 7H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" fill="currentColor" opacity="0.06" />
                        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(equip);
                    }}
                    data-testid={`button-edit-equipment-${equip.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(equip.id);
                    }}
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

      <CreateEquipmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editItem={editingItem}
        onSuccess={() => {
          setEditDialogOpen(false);
          setEditingItem(undefined);
        }}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this equipment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-equipment">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-equipment"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
