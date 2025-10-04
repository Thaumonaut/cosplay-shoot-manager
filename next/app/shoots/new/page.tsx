'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, Plus, Calendar, MapPin, Users, Camera, Palette, Lightbulb } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CreateShootData {
  title: string
  description: string
  scheduledDate?: string
  status: string
  isPublic: boolean
  color?: string
}

export default function CreateShootPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<CreateShootData>({
    title: '',
    description: '',
    status: 'planning',
    isPublic: false,
    color: '#3b82f6'
  })

  const createShootMutation = useMutation({
    mutationFn: async (data: CreateShootData) => {
      const response = await fetch('/api/shoots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to create shoot')
      }
      
      return response.json()
    },
    onSuccess: (shoot) => {
      toast({
        title: 'Shoot created successfully!',
        description: `"${shoot.title}" has been created.`,
      })
      router.push(`/shoots/${shoot.id}`)
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create shoot',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your shoot.',
        variant: 'destructive',
      })
      return
    }
    createShootMutation.mutate(formData)
  }

  const handleCancel = () => {
    router.push('/shoots')
  }

  const colorOptions = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Docs
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Reminders
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-red-600"
          >
            <Lightbulb className="h-4 w-4" />
            Reset
          </Button>
        </div>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Idea
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <Input
            placeholder="Enter shoot title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-2xl font-bold border-none bg-transparent px-0 h-auto placeholder:text-muted-foreground"
            style={{ fontSize: '2rem', lineHeight: '2.5rem' }}
          />
        </div>

        {/* Public Sharing Toggle */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={formData.isPublic ? "default" : "outline"}
            size="sm"
            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            className="flex items-center gap-2"
          >
            Public Sharing
          </Button>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            placeholder="Add shoot description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Color used in lists</label>
          <div className="flex items-center gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-6 h-6 rounded border-2 ${
                  formData.color === color ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">Color used in lists</span>
          </div>
        </div>

        {/* Resource Sections */}
        <div className="space-y-6">
          {/* Location */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Characters & Costumes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Characters & Costumes
                </CardTitle>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Props */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Props
                </CardTitle>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Crew */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Crew
                </CardTitle>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Equipment
                </CardTitle>
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Reference Images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Reference Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Add Reference Images</p>
              </div>
            </CardContent>
          </Card>

          {/* Instagram References */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Instagram References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="https://instagram.com/p/... or https://instagram.com/reel/..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              PE
            </div>
            <span className="text-sm text-muted-foreground">perryjacob@outlook.com</span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createShootMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createShootMutation.isPending ? 'Creating...' : 'Create Shoot'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}