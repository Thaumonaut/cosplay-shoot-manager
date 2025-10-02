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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, MapPin, Map } from "lucide-react";
import { GoogleMapsLocationSearch } from "@/components/GoogleMapsLocationSearch";
import { CreateLocationDialog } from "@/components/CreateLocationDialog";
import type { Location as LocationType } from "@shared/schema";

const locationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type LocationForm = z.infer<typeof locationFormSchema>;

export default function Locations() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: locations = [], isLoading } = useQuery<LocationType[]>({
    queryKey: ["/api/locations"],
  });

  const form = useForm<LocationForm>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      notes: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LocationForm }) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("address", data.address || "");
      formData.append("notes", data.notes || "");

      const res = await fetch(`/api/locations/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setEditingLocation(null);
      form.reset();
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setDeletingId(null);
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    },
  });

  const onEditSubmit = (data: LocationForm) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data });
    }
  };

  const openEditDialog = (location: LocationType) => {
    setEditingLocation(location);
    form.reset({
      name: location.name,
      address: location.address || "",
      notes: location.notes || "",
    });
  };

  const closeEditDialog = () => {
    setEditingLocation(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-locations">Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your favorite shoot locations and venues
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="button-add-location"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
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
      ) : locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No locations yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first location to start tracking shoot venues
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-location">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card key={location.id} data-testid={`card-location-${location.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate" data-testid={`text-location-name-${location.id}`}>
                      {location.name}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(location)}
                    data-testid={`button-edit-location-${location.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(location.id)}
                    data-testid={`button-delete-location-${location.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {location.address && (
                  <p className="text-sm text-muted-foreground" data-testid={`text-address-${location.id}`}>
                    {location.address}
                  </p>
                )}
                {location.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2" data-testid={`text-notes-${location.id}`}>
                    {location.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateLocationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <Dialog open={!!editingLocation} onOpenChange={closeEditDialog}>
        <DialogContent data-testid="dialog-location-form">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update the location information
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
                      <Input placeholder="Central Park" {...field} data-testid="input-location-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <div className="space-y-2">
                  <FormLabel>Search for Address</FormLabel>
                  <GoogleMapsLocationSearch
                    onLocationSelect={(location) => {
                      form.setValue("address", location.address);
                      if (!form.getValues("name")) {
                        form.setValue("name", location.name || location.address.split(",")[0]);
                      }
                    }}
                    placeholder="Search for a location..."
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Or enter manually</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="123 Main St, New York, NY 10001"
                          {...field}
                          rows={2}
                          data-testid="input-location-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information about this location..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="input-location-notes"
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
                  data-testid="button-cancel-location"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-location"
                >
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent data-testid="dialog-delete-location">
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this location? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingId(null)}
              data-testid="button-cancel-delete-location"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-location"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
