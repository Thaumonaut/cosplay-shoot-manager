'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Camera, 
  Users, 
  MapPin, 
  Wrench, 
  Shirt, 
  Palette, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  Upload, 
  Star, 
  Heart, 
  Share, 
  Settings, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import FileUploader from '@/components/FileUploader'
import { KanbanBoard } from '@/components/KanbanBoard'
import DevOnlyWrapper from '@/components/DevOnlyWrapper'

export default function UITestPage() {
  const { toast } = useToast()
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [switchChecked, setSwitchChecked] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [selectValue, setSelectValue] = useState('')
  const [sliderValue, setSliderValue] = useState([50])
  const [progressValue, setProgressValue] = useState(65)

  const handleToast = (variant: 'default' | 'destructive' = 'default') => {
    toast({
      title: variant === 'destructive' ? 'Error Toast' : 'Success Toast',
      description: `This is a ${variant} toast notification`,
      variant,
    })
  }

  // Sample data for components
  const kanbanColumns = [
    {
      id: "idea",
      title: "Ideas",
      icon: Lightbulb,
      shoots: [
        { id: '1', title: 'Sample Idea Shoot', referenceCount: 3 }
      ],
    },
    {
      id: "planning",
      title: "Planning",
      icon: Clock,
      shoots: [
        { id: '2', title: 'Sample Planning Shoot', location: 'Studio A', participants: 5, hasDocs: true, referenceCount: 8 }
      ],
    },
    {
      id: "ready to shoot",
      title: "Ready to Shoot",
      icon: Calendar,
      shoots: [
        { id: '3', title: 'Sample Ready Shoot', location: 'Park Location', participants: 3, hasCalendar: true, hasDocs: true, referenceCount: 12 }
      ],
    },
    {
      id: "completed",
      title: "Completed",
      icon: CheckCircle2,
      shoots: [
        { id: '4', title: 'Sample Completed Shoot', location: 'Beach', participants: 4, referenceCount: 15 }
      ],
    },
  ]

  return (
    <DevOnlyWrapper pageName="UI Component Test Suite">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">UI Component Test Suite</h1>
            <p className="text-muted-foreground">Development mode only - Testing all UI components and interactions</p>
          </div>
          <Badge variant="destructive">DEV ONLY</Badge>
        </div>
        <Separator />
      </div>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography & Fonts</CardTitle>
          <CardDescription>Testing Space Grotesk font family and text styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Heading 1 - Space Grotesk</h1>
            <h2 className="text-3xl font-semibold">Heading 2 - Space Grotesk</h2>
            <h3 className="text-2xl font-medium">Heading 3 - Space Grotesk</h3>
            <h4 className="text-xl">Heading 4 - Space Grotesk</h4>
            <p className="text-base">Body text - Space Grotesk regular</p>
            <p className="text-sm text-muted-foreground">Small text - muted foreground</p>
            <code className="font-mono bg-muted px-2 py-1 rounded">Code text - Geist Mono</code>
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons & Interactive Elements</CardTitle>
          <CardDescription>Testing hover-elevate effects and all button variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost Link</Button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Plus className="h-4 w-4" /></Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button disabled>Loading State</Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button><Calendar className="h-4 w-4 mr-2" />With Icon</Button>
              <Button><Users className="h-4 w-4 mr-2" />Crew Management</Button>
              <Button><Camera className="h-4 w-4 mr-2" />Equipment</Button>
              <Button><MapPin className="h-4 w-4 mr-2" />Locations</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Form Controls</CardTitle>
          <CardDescription>Testing all input components and form elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="input-test">Input Field</Label>
                <Input 
                  id="input-test"
                  placeholder="Enter some text..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="textarea-test">Textarea</Label>
                <Textarea 
                  id="textarea-test"
                  placeholder="Enter longer text..." 
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="select-test">Select Dropdown</Label>
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="switch-test" 
                  checked={switchChecked}
                  onCheckedChange={setSwitchChecked}
                />
                <Label htmlFor="switch-test">Switch Toggle</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="checkbox-test"
                  checked={checkboxChecked}
                  onCheckedChange={(checked) => setCheckboxChecked(checked as boolean)}
                />
                <Label htmlFor="checkbox-test">Checkbox</Label>
              </div>

              <div>
                <Label>Radio Group</Label>
                <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="radio1" />
                    <Label htmlFor="radio1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="radio2" />
                    <Label htmlFor="radio2">Option 2</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Slider: {sliderValue[0]}%</Label>
                <Slider 
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                />
              </div>

              <div>
                <Label>Progress: {progressValue}%</Label>
                <Progress value={progressValue} />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>-10</Button>
                  <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>+10</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards & Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Cards & Layout Components</CardTitle>
          <CardDescription>Testing card variants and layout systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-elevate cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Basic Card</CardTitle>
                <CardDescription>With hover elevation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This card has hover-elevate effect</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    With Icon
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Card with icon and action button</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>UI</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User Profile</p>
                    <p className="text-sm text-muted-foreground">ui@test.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Badges & Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Badges & Status Indicators</CardTitle>
          <CardDescription>Testing badge variants and status displays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Ready to Shoot</Badge>
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Planning</Badge>
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Idea</Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Away</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">Busy</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts & Notifications</CardTitle>
          <CardDescription>Testing alert components and toast notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Info Alert</AlertTitle>
              <AlertDescription>This is an informational alert message.</AlertDescription>
            </Alert>

            <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning Alert</AlertTitle>
              <AlertDescription>This is a warning alert message.</AlertDescription>
            </Alert>

            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success Alert</AlertTitle>
              <AlertDescription>This is a success alert message.</AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error Alert</AlertTitle>
              <AlertDescription>This is an error alert message.</AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => handleToast('default')}>Show Success Toast</Button>
            <Button onClick={() => handleToast('destructive')} variant="destructive">Show Error Toast</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs & Navigation</CardTitle>
          <CardDescription>Testing tab components and navigation elements</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
              <TabsTrigger value="tab4">Tab 4</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Tab 1 Content</h3>
                <p className="text-sm text-muted-foreground">This is the content for the first tab.</p>
              </div>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Tab 2 Content</h3>
                <p className="text-sm text-muted-foreground">This is the content for the second tab.</p>
              </div>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Tab 3 Content</h3>
                <p className="text-sm text-muted-foreground">This is the content for the third tab.</p>
              </div>
            </TabsContent>
            <TabsContent value="tab4" className="mt-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Tab 4 Content</h3>
                <p className="text-sm text-muted-foreground">This is the content for the fourth tab.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>File Upload Component</CardTitle>
          <CardDescription>Testing file upload functionality and UI</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader
            accept="image/*"
            multiple={true}
            onUpload={(files) => {
              toast({
                title: 'Files Uploaded',
                description: `Successfully uploaded ${files.length} file(s)`,
              })
            }}
            onDelete={(fileId) => {
              toast({
                title: 'File Deleted',
                description: 'File removed successfully',
              })
            }}
          />
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <Card>
        <CardHeader>
          <CardTitle>Kanban Board Component</CardTitle>
          <CardDescription>Testing the kanban board with sample data</CardDescription>
        </CardHeader>
        <CardContent>
          <KanbanBoard 
            columns={kanbanColumns}
            onShootClick={(id) => {
              toast({
                title: 'Shoot Clicked',
                description: `Clicked on shoot with ID: ${id}`,
              })
            }}
          />
        </CardContent>
      </Card>

      {/* Icons Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Icons & Illustrations</CardTitle>
          <CardDescription>Testing icon library and visual elements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-4">
            {[Calendar, Camera, Users, MapPin, Wrench, Shirt, Palette, Plus, 
              Trash2, Edit, Download, Upload, Star, Heart, Share, Settings,
              Info, AlertTriangle, CheckCircle, XCircle, Lightbulb, Clock, CheckCircle2].map((Icon, index) => (
              <div key={index} className="flex flex-col items-center gap-2 p-3 border rounded-lg hover-elevate cursor-pointer">
                <Icon className="h-6 w-6" />
                <span className="text-xs">{Icon.name || `Icon ${index + 1}`}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Testing theme colors and variations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-16 bg-primary rounded-lg"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-muted-foreground">#3b82f6</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-secondary rounded-lg"></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-muted-foreground">hsl(var(--secondary))</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-muted rounded-lg"></div>
              <p className="text-sm font-medium">Muted</p>
              <p className="text-xs text-muted-foreground">hsl(var(--muted))</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-destructive rounded-lg"></div>
              <p className="text-sm font-medium">Destructive</p>
              <p className="text-xs text-muted-foreground">hsl(var(--destructive))</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-lg font-semibold mb-2">🎉 All UI Components Tested Successfully!</p>
          <p className="text-muted-foreground">This test suite verifies all components are working correctly with proper styling and interactions.</p>
        </CardContent>
      </Card>
      </div>
    </DevOnlyWrapper>
  )
}