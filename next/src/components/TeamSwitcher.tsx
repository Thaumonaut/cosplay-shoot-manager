import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";

interface Team {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export function TeamSwitcher() {
  const { toast } = useToast();

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ["/api/user/teams"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const activeTeam = teams.find((team) => team.isActive);

  const switchTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      return apiRequest("POST", "/api/user/active-team", { teamId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/team-member"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shoots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/props"] });
      queryClient.invalidateQueries({ queryKey: ["/api/costumes"] });
      toast({
        title: "Team switched",
        description: "You're now viewing resources from the selected team.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to switch team",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2" data-testid="team-switcher-loading">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading teams...</span>
      </div>
    );
  }

  if (teams.length === 0) {
    return null;
  }

  return (
    <div className="w-full" data-testid="team-switcher">
      <Select
        value={activeTeam?.id || ""}
        onValueChange={(teamId) => switchTeamMutation.mutate(teamId)}
        disabled={switchTeamMutation.isPending}
      >
        <SelectTrigger
          className="w-full"
          data-testid="team-switcher-trigger"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <SelectValue placeholder="Select a team" />
          </div>
        </SelectTrigger>
        <SelectContent data-testid="team-switcher-content">
          {teams.map((team) => (
            <SelectItem
              key={team.id}
              value={team.id}
              data-testid={`team-option-${team.id}`}
            >
              <div className="flex items-center justify-between w-full">
                <span>{team.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {team.role}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
