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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Plus, Mail, Phone, Pencil, Trash2, Users } from "lucide-react";
import { CreatePersonnelDialog } from "@/components/CreatePersonnelDialog";
import type { Personnel } from "@shared/schema";

export default function Personnel() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Personnel | undefined>(
    undefined,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: personnel = [], isLoading } = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/personnel/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      setDeletingId(null);
          toast({
            title: "Success",
            description: "Crew member deleted successfully",
          });
    },
    onError: () => {
      toast({
        title: "Error",
            description: "Failed to delete crew member",
        variant: "destructive",
      });
    },
  });

  const openEditDialog = (person: Personnel) => {
    setEditingItem(person);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingItem(undefined);
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-personnel">
            Crew
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your crew members, models, photographers, and other contacts
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="button-add-personnel"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Crew
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
      ) : personnel.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No crew yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first crew member to start tracking your team
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              data-testid="button-add-first-personnel"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Crew
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personnel.map((person) => (
            <Card
              key={person.id}
              className="cursor-pointer hover-elevate"
              onClick={() => openEditDialog(person)}
              data-testid={`card-personnel-${person.id}`}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                    <AvatarImage src={person.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle
                      className="text-base truncate"
                      data-testid={`text-personnel-name-${person.id}`}
                    >
                      {person.name}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(person);
                    }}
                    data-testid={`button-edit-personnel-${person.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(person.id);
                    }}
                    data-testid={`button-delete-personnel-${person.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span
                    className="truncate"
                    data-testid={`text-email-${person.id}`}
                  >
                    {person.email || "none"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span data-testid={`text-phone-${person.id}`}>
                    {person.phone || "none"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePersonnelDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <CreatePersonnelDialog
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
            <AlertDialogTitle>Delete Crew Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this crew member? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-personnel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-personnel"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
