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
import { Plus, Pencil, Trash2, Shirt, ImageIcon, Check } from "lucide-react";
import { CreateCostumesDialog } from "@/components/CreateCostumesDialog";
import type { CostumeProgress } from "@shared/schema";

export default function Costumes() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostumeProgress | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: costumes = [], isLoading } = useQuery<CostumeProgress[]>({
    queryKey: ["/api/costumes"],
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

  const openEditDialog = (costume: CostumeProgress) => {
    setEditingItem(costume);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingItem(undefined);
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
          onClick={() => setIsAddDialogOpen(true)} 
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
              onClick={() => setIsAddDialogOpen(true)}
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
            <Card 
              key={costume.id} 
              className="cursor-pointer hover-elevate"
              onClick={() => openEditDialog(costume)}
              data-testid={`card-costume-${costume.id}`}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {costume.characterName}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(costume);
                    }}
                    data-testid={`button-edit-costume-${costume.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(costume.id);
                    }}
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
                  {costume.status !== "completed" && costume.todos && costume.todos.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Todos ({costume.todos.length})</span>
                      <div className="space-y-1">
                        {costume.todos.slice(0, 3).map((todo, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm" data-testid={`todo-display-${costume.id}-${index}`}>
                            <Check className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground line-clamp-1">{todo}</span>
                          </div>
                        ))}
                        {costume.todos.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{costume.todos.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  {costume.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{costume.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateCostumesDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <CreateCostumesDialog
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
