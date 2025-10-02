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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Mail, Phone, Pencil, Trash2, Users } from "lucide-react";
import { CreatePersonnelDialog } from "@/components/CreatePersonnelDialog";
import type { Personnel } from "@shared/schema";

const personnelFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type PersonnelForm = z.infer<typeof personnelFormSchema>;

export default function Personnel() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: personnel = [], isLoading} = useQuery<Personnel[]>({
    queryKey: ["/api/personnel"],
  });

  const form = useForm<PersonnelForm>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PersonnelForm }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");
      formData.append("notes", data.notes || "");

      const res = await fetch(`/api/personnel/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      setEditingPersonnel(null);
      form.reset();
      toast({
        title: "Success",
        description: "Personnel updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update personnel",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/personnel/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      setDeletingId(null);
      toast({
        title: "Success",
        description: "Personnel deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete personnel",
        variant: "destructive",
      });
    },
  });

  const onEditSubmit = (data: PersonnelForm) => {
    if (editingPersonnel) {
      updateMutation.mutate({ id: editingPersonnel.id, data });
    }
  };

  const openEditDialog = (person: Personnel) => {
    setEditingPersonnel(person);
    form.reset({
      name: person.name,
      email: person.email || "",
      phone: person.phone || "",
      notes: person.notes || "",
    });
  };

  const closeEditDialog = () => {
    setEditingPersonnel(null);
    form.reset();
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
          <h1 className="text-3xl font-bold" data-testid="heading-personnel">Personnel</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members, models, photographers, and other contacts
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="button-add-personnel"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Personnel
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
            <h3 className="text-lg font-semibold mb-2">No personnel yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first team member to start tracking your crew
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-personnel">
              <Plus className="h-4 w-4 mr-2" />
              Add Personnel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personnel.map((person) => (
            <Card key={person.id} data-testid={`card-personnel-${person.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar>
                    <AvatarImage src={person.avatarUrl || undefined} />
                    <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate" data-testid={`text-personnel-name-${person.id}`}>
                      {person.name}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(person)}
                    data-testid={`button-edit-personnel-${person.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(person.id)}
                    data-testid={`button-delete-personnel-${person.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {person.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate" data-testid={`text-email-${person.id}`}>{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span data-testid={`text-phone-${person.id}`}>{person.phone}</span>
                  </div>
                )}
                {person.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2" data-testid={`text-notes-${person.id}`}>
                    {person.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePersonnelDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <Dialog open={!!editingPersonnel} onOpenChange={closeEditDialog}>
        <DialogContent data-testid="dialog-personnel-form">
          <DialogHeader>
            <DialogTitle>Edit Personnel</DialogTitle>
            <DialogDescription>
              Update the personnel information
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
                      <Input placeholder="John Doe" {...field} data-testid="input-personnel-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                        data-testid="input-personnel-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        data-testid="input-personnel-phone"
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
                        placeholder="Additional information about this person..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="input-personnel-notes"
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
                  data-testid="button-cancel-personnel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-personnel"
                >
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent data-testid="dialog-delete-personnel">
          <DialogHeader>
            <DialogTitle>Delete Personnel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this person? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingId(null)}
              data-testid="button-cancel-delete-personnel"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-personnel"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
