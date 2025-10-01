import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Clock,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Edit,
  Trash2,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { SiGooglecalendar, SiGoogledocs, SiInstagram } from "react-icons/si";
import { format } from "date-fns";

interface Participant {
  name: string;
  role: string;
  avatar?: string;
}

interface ShootDetail {
  id: string;
  title: string;
  status: "idea" | "planning" | "scheduled" | "completed";
  date?: Date;
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
}

const statusConfig = {
  idea: { label: "Idea", variant: "secondary" as const },
  planning: { label: "Planning", variant: "default" as const },
  scheduled: { label: "Scheduled", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
};

export function ShootDetailView({ shoot, onBack, onEdit, onDelete, onExportDocs, isExporting, onCreateCalendar, isCreatingCalendar }: ShootDetailViewProps) {
  const statusInfo = statusConfig[shoot.status];
  const heroImage = shoot.references[0];

  return (
    <div className="min-h-screen bg-background">
      {heroImage && (
        <div className="relative h-64 md:h-96 w-full overflow-hidden">
          <img
            src={heroImage}
            alt={shoot.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-4"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-3">{shoot.title}</h1>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    {shoot.calendarEventUrl && (
                      <Badge variant="outline" className="gap-1">
                        <SiGooglecalendar className="h-3 w-3" />
                        Synced
                      </Badge>
                    )}
                    {shoot.docsUrl && (
                      <Badge variant="outline" className="gap-1">
                        <SiGoogledocs className="h-3 w-3" />
                        Docs Linked
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!shoot.calendarEventUrl && shoot.date && (
                    <Button 
                      variant="default" 
                      onClick={onCreateCalendar}
                      disabled={isCreatingCalendar}
                      data-testid="button-create-calendar"
                    >
                      <SiGooglecalendar className="h-4 w-4 mr-2" />
                      {isCreatingCalendar ? 'Adding to Calendar...' : 'Add to Calendar'}
                    </Button>
                  )}
                  {!shoot.docsUrl && (
                    <Button 
                      variant="default" 
                      onClick={onExportDocs}
                      disabled={isExporting}
                      data-testid="button-export-docs"
                    >
                      <SiGoogledocs className="h-4 w-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export to Docs'}
                    </Button>
                  )}
                  <Button variant="outline" onClick={onEdit} data-testid="button-edit">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" data-testid="button-send-reminder">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onDelete}
                    className="text-destructive hover:bg-destructive/10"
                    data-testid="button-delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-8">
        {shoot.date && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{format(shoot.date, "MMM d, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">{format(shoot.date, "h:mm a")}</p>
                </div>
              </CardContent>
            </Card>

            {shoot.location && (
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{shoot.location}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{shoot.status}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
            <TabsTrigger value="references" data-testid="tab-references">
              References ({shoot.references.length + shoot.instagramLinks.length})
            </TabsTrigger>
            <TabsTrigger value="participants" data-testid="tab-participants">
              Participants ({shoot.participants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {shoot.description}
                </p>
              </CardContent>
            </Card>

            {(shoot.calendarEventUrl || shoot.docsUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {shoot.calendarEventUrl && (
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => window.open(shoot.calendarEventUrl, '_blank')}
                      data-testid="button-view-calendar"
                    >
                      <span className="flex items-center gap-2">
                        <SiGooglecalendar className="h-4 w-4" />
                        View in Google Calendar
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {shoot.docsUrl && (
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => window.open(shoot.docsUrl, '_blank')}
                      data-testid="button-view-docs"
                    >
                      <span className="flex items-center gap-2">
                        <SiGoogledocs className="h-4 w-4" />
                        Open Planning Document
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="references" className="space-y-6">
            {shoot.references.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Reference Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                </CardContent>
              </Card>
            )}

            {shoot.instagramLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SiInstagram className="h-5 w-5" />
                    Instagram References
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shoot.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg hover-elevate"
                      data-testid={`participant-${index}`}
                    >
                      <Avatar>
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
