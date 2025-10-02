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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Package, ImageIcon } from "lucide-react";
import { CreatePropsDialog } from "@/components/CreatePropsDialog";
import type { Prop } from "@shared/schema";

const propFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  available: z.boolean().default(true),
});

type PropForm = z.infer<typeof propFormSchema>;

export default function Props() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Prop | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: props = [], isLoading } = useQuery<Prop[]>({
    queryKey: ["/api/props"],
  });

  const form = useForm<PropForm>({
    resolver: zodResolver(propFormSchema),
    defaultValues: {
      name: "",
      description: "",
      available: true,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PropForm }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("available", String(data.available));
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`/api/props/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update prop");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/props"] });
      toast({
        title: "Success",
        description: "Prop updated successfully",
      });
      setEditingProp(null);
      form.reset();
      setImagePreview(null);
      setImageFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prop",
        variant: "destructive",
      });
    },
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

  const handleOpenEditDialog = (prop: Prop) => {
    setEditingProp(prop);
    form.reset({
      name: prop.name,
      description: prop.description || "",
      available: prop.available ?? true,
    });
    setImagePreview(prop.imageUrl || null);
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

  const onEditSubmit = (data: PropForm) => {
    if (editingProp) {
      updateMutation.mutate({ id: editingProp.id, data });
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
            <Card key={prop.id} data-testid={`card-prop-${prop.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {prop.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEditDialog(prop)}
                    data-testid={`button-edit-prop-${prop.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(prop.id)}
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

      <Dialog open={editingProp !== null} onOpenChange={(open) => {
        if (!open) {
          setEditingProp(null);
          form.reset();
          setImagePreview(null);
          setImageFile(null);
        }
      }}>
        <DialogContent data-testid="dialog-prop-form">
          <DialogHeader>
            <DialogTitle>Edit Prop</DialogTitle>
            <DialogDescription>
              Update prop details
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter prop name"
                        data-testid="input-prop-name"
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
                        {...field}
                        placeholder="Enter description"
                        rows={3}
                        data-testid="input-prop-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Available</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Is this prop currently available?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-prop-available"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingProp(null);
                    form.reset();
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  data-testid="button-cancel-prop"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-prop"
                >
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
