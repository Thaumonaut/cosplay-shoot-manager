import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  Edit,
  Trash2,
  Mail,
  ArrowLeft,
  Plus,
  X,
  Users,
  Check,
  Package,
  Sparkles,
  Shirt,
} from "lucide-react";
import { SiGooglecalendar, SiGoogledocs, SiInstagram } from "react-icons/si";
import { format } from "date-fns";
import { AddParticipantDialog } from "@/components/AddParticipantDialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Equipment, Prop, CostumeProgress } from "@shared/schema";

interface Participant {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
}

interface ShootDetail {
  id: string;
  title: string;
  status: "idea" | "planning" | "scheduled" | "completed";
  date?: Date;
  durationMinutes?: number;
  location?: string;
  description: string;
  participants: Participant[];
  references: string[];
  instagramLinks: string[];
  calendarEventUrl?: string;
  docsUrl?: string;
}

interface ShootDetailViewProps {
  shoot: ShootDetail;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onExportDocs?: () => void;
  isExporting?: boolean;
  onCreateCalendar?: () => void;
  isCreatingCalendar?: boolean;
  onSendReminders?: () => void;
  isSendingReminders?: boolean;
}

const statusConfig = {
  idea: { label: "Idea", variant: "secondary" as const },
  planning: { label: "Planning", variant: "default" as const },
  scheduled: { label: "Scheduled", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
};

export function ShootDetailView({ shoot, onBack, onDelete, onExportDocs, isExporting, onCreateCalendar, isCreatingCalendar, onSendReminders, isSendingReminders }: ShootDetailViewProps) {
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    title: shoot.title,
    status: shoot.status,
    date: shoot.date ? format(new Date(shoot.date), "yyyy-MM-dd'T'HH:mm") : "",
    durationMinutes: shoot.durationMinutes || "",
    location: shoot.location || "",
    description: shoot.description || "",
  });
  
  const { toast } = useToast();
  const statusInfo = statusConfig[shoot.status];
  const heroImage = shoot.references[0];

  const { data: equipment = [], isLoading: isLoadingEquipment } = useQuery<Equipment[]>({
    queryKey: ["/api/shoots", shoot.id, "equipment"],
  });

  const { data: props = [], isLoading: isLoadingProps } = useQuery<Prop[]>({
    queryKey: ["/api/shoots", shoot.id, "props"],
  });

  const { data: costumes = [], isLoading: isLoadingCostumes } = useQuery<CostumeProgress[]>({
    queryKey: ["/api/shoots", shoot.id, "costumes"],
  });

  const updateShootMutation = useMutation({
    mutationFn: async (updates: Partial<ShootDetail>) => {
      await apiRequest("PATCH", `/api/shoots/${shoot.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shoot.id] });
      setEditingField(null);
      toast({
        title: "Updated",
        description: "Shoot details have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update shoot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      await apiRequest("DELETE", `/api/participants/${participantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shoots", shoot.id, "participants"] });
      toast({
        title: "Participant removed",
        description: "The participant has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove participant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (field: string) => {
    const updates: any = {};
    
    if (field === "title") {
      updates.title = editValues.title;
    } else if (field === "status") {
      updates.status = editValues.status;
    } else if (field === "datetime") {
      if (editValues.date) {
        updates.date = new Date(editValues.date);
      }
      if (editValues.durationMinutes !== "") {
        updates.durationMinutes = Number(editValues.durationMinutes);
      }
    } else if (field === "location") {
      updates.location = editValues.location;
    } else if (field === "description") {
      updates.description = editValues.description;
    }
    
    updateShootMutation.mutate(updates);
  };

  const handleCancel = (field: string) => {
    setEditValues({
      title: shoot.title,
      status: shoot.status,
      date: shoot.date ? format(new Date(shoot.date), "yyyy-MM-dd'T'HH:mm") : "",
      durationMinutes: shoot.durationMinutes || "",
      location: shoot.location || "",
      description: shoot.description || "",
    });
    setEditingField(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:bg-destructive/10"
            data-testid="button-delete"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Main Card */}
        <Card>
          {heroImage ? (
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <img
                src={heroImage}
                alt={shoot.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
          
          <CardHeader>
            <div className="space-y-4">
              {/* Title & Status */}
              {editingField === "title" ? (
                <div className="space-y-3">
                  <Input
                    value={editValues.title}
                    onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                    placeholder="Shoot title"
                    className="text-3xl font-bold h-auto py-2"
                    data-testid="input-title"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave("title")} data-testid="button-save-title">
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel("title")} data-testid="button-cancel-title">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <h1 className="text-3xl font-bold">{shoot.title}</h1>
                    {editingField === "status" ? (
                      <div className="flex gap-2 items-center">
                        <Select
                          value={editValues.status}
                          onValueChange={(value) => setEditValues({ ...editValues, status: value as any })}
                        >
                          <SelectTrigger className="w-40" data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="idea">Idea</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => handleSave("status")} data-testid="button-save-status">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCancel("status")} data-testid="button-cancel-status">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={statusInfo.variant} className="cursor-pointer hover-elevate" onClick={() => setEditingField("status")} data-testid="badge-status">
                          {statusInfo.label}
                        </Badge>
                        {shoot.calendarEventUrl && (
                          <Badge variant="outline" className="gap-1">
                            <SiGooglecalendar className="h-3 w-3" />
                            Calendar
                          </Badge>
                        )}
                        {shoot.docsUrl && (
                          <Badge variant="outline" className="gap-1">
                            <SiGoogledocs className="h-3 w-3" />
                            Docs
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingField("title")}
                    data-testid="button-edit-title"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Quick Info */}
              {editingField === "datetime" ? (
                <div className="space-y-3 border rounded-lg p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={editValues.date}
                      onChange={(e) => setEditValues({ ...editValues, date: e.target.value })}
                      data-testid="input-datetime"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={editValues.durationMinutes}
                      onChange={(e) => setEditValues({ ...editValues, durationMinutes: e.target.value })}
                      placeholder="60"
                      data-testid="input-duration"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave("datetime")} data-testid="button-save-datetime">
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel("datetime")} data-testid="button-cancel-datetime">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : editingField === "location" ? (
                <div className="space-y-3 border rounded-lg p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={editValues.location}
                      onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                      placeholder="Location or address"
                      data-testid="input-location"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave("location")} data-testid="button-save-location">
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel("location")} data-testid="button-cancel-location">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3 group">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">Date & Time</p>
                      {shoot.date ? (
                        <>
                          <p className="text-sm text-muted-foreground">{format(new Date(shoot.date), "MMM d, yyyy")}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(shoot.date), "h:mm a")}
                            {shoot.durationMinutes && shoot.durationMinutes > 0 && (
                              <>
                                {" "}· {Math.floor(shoot.durationMinutes / 60) > 0 && `${Math.floor(shoot.durationMinutes / 60)}h `}
                                {shoot.durationMinutes % 60 > 0 && `${shoot.durationMinutes % 60}m`}
                              </>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not scheduled</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => setEditingField("datetime")}
                      data-testid="button-edit-datetime"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-3 group">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-shoot-location">{shoot.location || 'No location set'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => setEditingField("location")}
                      data-testid="button-edit-location"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {!shoot.calendarEventUrl && shoot.date && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={onCreateCalendar}
                    disabled={isCreatingCalendar}
                    data-testid="button-create-calendar"
                  >
                    <SiGooglecalendar className="h-4 w-4 mr-2" />
                    {isCreatingCalendar ? 'Adding...' : 'Add to Calendar'}
                  </Button>
                )}
                {shoot.calendarEventUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(shoot.calendarEventUrl, '_blank')}
                    data-testid="button-view-calendar"
                  >
                    <SiGooglecalendar className="h-4 w-4 mr-2" />
                    View in Calendar
                  </Button>
                )}
                {!shoot.docsUrl && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={onExportDocs}
                    disabled={isExporting}
                    data-testid="button-export-docs"
                  >
                    <SiGoogledocs className="h-4 w-4 mr-2" />
                    {isExporting ? 'Saving...' : 'Save as Google Doc'}
                  </Button>
                )}
                {shoot.docsUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(shoot.docsUrl, '_blank')}
                    data-testid="button-view-docs"
                  >
                    <SiGoogledocs className="h-4 w-4 mr-2" />
                    Open Planning Doc
                  </Button>
                )}
                {shoot.date && shoot.participants.length > 0 && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={onSendReminders}
                    disabled={isSendingReminders}
                    data-testid="button-send-reminder"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {isSendingReminders ? 'Sending...' : 'Send Reminders'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            <Separator />
            {editingField === "description" ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold">Description</label>
                <Textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={6}
                  data-testid="textarea-description"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave("description")} data-testid="button-save-description">
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCancel("description")} data-testid="button-cancel-description">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Description</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => setEditingField("description")}
                    data-testid="button-edit-description"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-description">
                  {shoot.description || 'No description provided.'}
                </p>
              </div>
            )}

            {/* Team */}
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team ({shoot.participants.length})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddParticipantOpen(true)}
                  data-testid="button-add-participant"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {shoot.participants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No participants yet.</p>
                  <p className="text-sm mt-1">Add models, photographers, and crew.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shoot.participants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg border hover-elevate"
                      data-testid={`participant-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">{participant.role}</p>
                          {participant.email && (
                            <p className="text-xs text-muted-foreground">{participant.email}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteParticipantMutation.mutate(participant.id)}
                        className="text-destructive hover:bg-destructive/10"
                        data-testid={`button-delete-participant-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Equipment */}
            {(equipment.length > 0 || isLoadingEquipment) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Equipment ({equipment.length})
                  </h3>
                  {isLoadingEquipment ? (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {equipment.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border"
                          data-testid={`equipment-${item.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                            </div>
                            <Badge variant={item.available ? "default" : "secondary"}>
                              {item.available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Props */}
            {(props.length > 0 || isLoadingProps) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Props ({props.length})
                  </h3>
                  {isLoadingProps ? (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {props.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-3 rounded-lg border"
                          data-testid={`prop-${prop.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium">{prop.name}</p>
                              {prop.description && (
                                <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
                              )}
                            </div>
                            <Badge variant={prop.available ? "default" : "secondary"}>
                              {prop.available ? "Available" : "In Use"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Costumes */}
            {(costumes.length > 0 || isLoadingCostumes) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shirt className="h-5 w-5" />
                    Costumes ({costumes.length})
                  </h3>
                  {isLoadingCostumes ? (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {costumes.map((costume) => (
                        <div
                          key={costume.id}
                          className="p-3 rounded-lg border"
                          data-testid={`costume-${costume.id}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-medium">{costume.characterName}</p>
                                <p className="text-sm text-muted-foreground">{costume.seriesName}</p>
                              </div>
                              <Badge variant="outline">{costume.status}</Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{costume.completionPercentage}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${costume.completionPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* References */}
            {shoot.references.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Reference Images ({shoot.references.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {shoot.references.map((ref, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted hover-elevate cursor-pointer group"
                        data-testid={`image-reference-${index}`}
                      >
                        <img
                          src={ref}
                          alt={`Reference ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Instagram Links */}
            {shoot.instagramLinks.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <SiInstagram className="h-5 w-5" />
                    Instagram References ({shoot.instagramLinks.length})
                  </h3>
                  <div className="space-y-2">
                    {shoot.instagramLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(link, '_blank')}
                        data-testid={`button-instagram-${index}`}
                      >
                        <span>Instagram Post {index + 1}</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddParticipantDialog
        open={addParticipantOpen}
        onOpenChange={setAddParticipantOpen}
        shootId={shoot.id}
      />
    </div>
  );
}
