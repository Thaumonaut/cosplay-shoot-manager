import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ShootPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-96" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Quick Details */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-20 w-full" />
            <div className="flex items-center gap-3 mt-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      {/* Characters & Costumes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32 mt-1" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Props Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-8 w-32 mt-1" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Equipment Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-24 mt-1" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reference Images Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0 relative aspect-square">
                <Skeleton className="w-full h-full" />
              </CardContent>
            </Card>
          ))}
          <Card className="border-dashed">
            <CardContent className="aspect-square flex flex-col items-center justify-center p-4">
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instagram References Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}