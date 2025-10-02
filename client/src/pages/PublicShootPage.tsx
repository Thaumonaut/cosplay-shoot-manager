import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, Camera, Package, Shirt } from "lucide-react";
import { format } from "date-fns";

export default function PublicShootPage() {
  const { id } = useParams();

  const { data: shoot, isLoading, error } = useQuery<any>({
    queryKey: [`/api/public/shoots/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Fetching shoot details</p>
        </div>
      </div>
    );
  }

  if (error || !shoot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Shoot Not Found</h2>
          <p className="text-muted-foreground">This shoot is either private or doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" data-testid="text-shoot-title">{shoot.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={
              shoot.status === "completed" ? "default" :
              shoot.status === "in_progress" ? "secondary" :
              "outline"
            } data-testid={`badge-status-${shoot.status}`}>
              {shoot.status?.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Date and Time */}
        {(shoot.date || shoot.time) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {shoot.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-shoot-date">{format(new Date(shoot.date), "MMMM d, yyyy")}</span>
                </div>
              )}
              {shoot.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span data-testid="text-shoot-time">{shoot.time}</span>
                </div>
              )}
              {shoot.duration_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Duration: {shoot.duration_minutes} minutes</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Location */}
        {shoot.location && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium" data-testid="text-location-name">{shoot.location.name}</p>
                {shoot.location.address && (
                  <p className="text-sm text-muted-foreground">{shoot.location.address}</p>
                )}
                {shoot.location.notes && (
                  <p className="text-sm text-muted-foreground">{shoot.location.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants */}
        {shoot.participants && shoot.participants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shoot.participants.map((participant: any) => (
                  <div key={participant.id} className="flex items-center gap-3" data-testid={`participant-${participant.id}`}>
                    <Avatar>
                      <AvatarImage src={participant.personnel?.avatar_url} />
                      <AvatarFallback>
                        {participant.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{participant.name}</p>
                      {participant.role && (
                        <p className="text-sm text-muted-foreground">{participant.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Costumes */}
        {shoot.costumes && shoot.costumes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Costumes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shoot.costumes.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3" data-testid={`costume-${item.costume_id}`}>
                    {item.costume.image_url && (
                      <img 
                        src={item.costume.image_url} 
                        alt={item.costume.character_name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.costume.character_name}</p>
                      {item.costume.series_name && (
                        <p className="text-sm text-muted-foreground">{item.costume.series_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment */}
        {shoot.equipment && shoot.equipment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {shoot.equipment.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between" data-testid={`equipment-${item.equipment_id}`}>
                    <span className="font-medium">{item.equipment.name}</span>
                    {item.quantity > 1 && (
                      <Badge variant="outline">×{item.quantity}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Props */}
        {shoot.props && shoot.props.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Props
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {shoot.props.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3" data-testid={`prop-${item.prop_id}`}>
                    {item.prop.image_url && (
                      <img 
                        src={item.prop.image_url} 
                        alt={item.prop.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    )}
                    <span className="font-medium">{item.prop.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {shoot.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground" data-testid="text-shoot-notes">{shoot.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* References */}
        {shoot.references && shoot.references.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shoot.references.map((ref: any) => (
                  <a
                    key={ref.id}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border hover-elevate active-elevate-2"
                    data-testid={`link-reference-${ref.id}`}
                  >
                    <img 
                      src={ref.url} 
                      alt={`Reference ${ref.type}`}
                      className="w-full h-48 object-cover"
                    />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
