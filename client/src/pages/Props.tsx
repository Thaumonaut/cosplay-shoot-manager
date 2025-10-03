import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
import { Plus, Pencil, Trash2, Package, ImageIcon } from "lucide-react";
import { CreatePropsDialog } from "@/components/CreatePropsDialog";
import type { Prop } from "@shared/schema";

export default function Props() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Prop | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: props = [], isLoading } = useQuery<Prop[]>({
    queryKey: ["/api/props"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/props/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete prop");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/props"] });
      toast({
        title: "Success",
        description: "Prop deleted successfully",
      });
      setDeletingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete prop",
        variant: "destructive",
      });
    },
  });

  const openEditDialog = (prop: Prop) => {
    setEditingItem(prop);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingItem(undefined);
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
          <h1 className="text-3xl font-bold" data-testid="heading-props">Props</h1>
          <p className="text-muted-foreground mt-1">
            Manage your prop collection
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          data-testid="button-add-props"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prop
        </Button>
      </div>

      {props.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No props yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first prop
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              data-testid="button-add-first-props"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Prop
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {props.map((prop) => (
            <Card 
              key={prop.id} 
              className="cursor-pointer hover-elevate"
              onClick={() => openEditDialog(prop)}
              data-testid={`card-prop-${prop.id}`}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {prop.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(prop);
                    }}
                    data-testid={`button-edit-prop-${prop.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(prop.id);
                    }}
                    data-testid={`button-delete-prop-${prop.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prop.imageUrl && (
                    <img
                      src={prop.imageUrl}
                      alt={prop.name}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                  {!prop.imageUrl && (
                    <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  {prop.description && (
                    <p className="text-sm text-muted-foreground">{prop.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={prop.available ? "default" : "secondary"}
                      data-testid={`badge-available-${prop.id}`}
                    >
                      {prop.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePropsDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <CreatePropsDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editItem={editingItem}
        onSuccess={() => {
          setEditDialogOpen(false);
          setEditingItem(undefined);
        }}
      />

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prop</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prop? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              data-testid="button-confirm-delete-prop"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
