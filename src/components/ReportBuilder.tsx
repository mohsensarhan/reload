import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  FileText,
  Plus,
  Trash2,
  GripVertical,
  Download,
  Eye,
  Settings,
  BarChart3,
  Table as TableIcon,
  FileType,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportSection {
  id: string;
  type: 'heading' | 'text' | 'metric' | 'chart' | 'table' | 'image';
  content: any;
  config?: any;
}

interface ReportConfig {
  title: string;
  description: string;
  sections: ReportSection[];
  format: 'pdf' | 'html' | 'docx';
  orientation: 'portrait' | 'landscape';
  includeTimestamp: boolean;
  includeLogo: boolean;
}

const availableMetrics = [
  { id: 'meals-delivered', label: 'Meals Delivered', category: 'operational' },
  { id: 'people-served', label: 'People Served', category: 'operational' },
  { id: 'cost-per-meal', label: 'Cost Per Meal', category: 'financial' },
  { id: 'program-efficiency', label: 'Program Efficiency', category: 'operational' },
  { id: 'revenue', label: 'Revenue', category: 'financial' },
  { id: 'expenses', label: 'Expenses', category: 'financial' },
  { id: 'reserves', label: 'Cash Reserves', category: 'financial' },
  { id: 'donations', label: 'Donations', category: 'financial' }
];

const availableCharts = [
  { id: 'growth-trajectory', label: 'Growth Trajectory', type: 'line' },
  { id: 'donations-chart', label: 'Donations Over Time', type: 'bar' },
  { id: 'financial-health', label: 'Financial Health', type: 'composed' },
  { id: 'program-breakdown', label: 'Program Breakdown', type: 'pie' }
];

function SortableItem({ id, section, onEdit, onDelete }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const getIcon = () => {
    switch (section.type) {
      case 'heading':
        return <FileType className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'metric':
        return <BarChart3 className="w-4 h-4" />;
      case 'chart':
        return <BarChart3 className="w-4 h-4" />;
      case 'table':
        return <TableIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:shadow-md transition-all"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {getIcon()}
          <span className="font-medium capitalize">{section.type}</span>
          <Badge variant="outline" className="text-xs">
            {section.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {section.content?.title || section.content?.text || 'Untitled section'}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(section)}>
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(section.id)}>
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function ReportBuilder() {
  const [config, setConfig] = useState<ReportConfig>({
    title: 'Executive Dashboard Report',
    description: 'Comprehensive overview of organizational performance',
    sections: [],
    format: 'pdf',
    orientation: 'portrait',
    includeTimestamp: true,
    includeLogo: true
  });

  const [activeTab, setActiveTab] = useState<'builder' | 'preview' | 'settings'>('builder');
  const [selectedSectionType, setSelectedSectionType] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setConfig(prev => {
        const oldIndex = prev.sections.findIndex(s => s.id === active.id);
        const newIndex = prev.sections.findIndex(s => s.id === over.id);

        return {
          ...prev,
          sections: arrayMove(prev.sections, oldIndex, newIndex)
        };
      });
    }
  };

  const addSection = (type: ReportSection['type']) => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      type,
      content: {}
    };

    setConfig(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const deleteSection = (id: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id)
    }));
  };

  const editSection = (section: ReportSection) => {
    console.log('Edit section:', section);
  };

  const generateReport = () => {
    console.log('Generating report with config:', config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Custom Report Builder
              </CardTitle>
              <CardDescription>
                Create custom reports with drag-and-drop sections
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab('preview')}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={generateReport}>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Report Sections</h3>
                    <Badge variant="secondary">
                      {config.sections.length} section{config.sections.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {config.sections.length === 0 ? (
                    <Card className="p-12 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">No sections added yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add sections from the panel on the right to build your report
                      </p>
                    </Card>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={config.sections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {config.sections.map(section => (
                            <SortableItem
                              key={section.id}
                              id={section.id}
                              section={section}
                              onEdit={editSection}
                              onDelete={deleteSection}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add Section</h3>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addSection('heading')}
                    >
                      <FileType className="w-4 h-4 mr-2" />
                      Heading
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addSection('text')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Text Block
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addSection('metric')}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Metric Card
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addSection('chart')}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Chart
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addSection('table')}
                    >
                      <TableIcon className="w-4 h-4 mr-2" />
                      Data Table
                    </Button>
                  </div>

                  <Card className="bg-muted/50 border-dashed">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      <p className="font-medium mb-2">Quick Tips:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Drag sections to reorder them</li>
                        <li>• Click settings to configure each section</li>
                        <li>• Use preview to see the final result</li>
                        <li>• Generate reports in multiple formats</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="border-b">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold">{config.title}</h1>
                    <p className="text-muted-foreground">{config.description}</p>
                    {config.includeTimestamp && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {config.sections.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No sections to preview. Add sections in the Builder tab.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {config.sections.map((section, index) => (
                        <div key={section.id} className="border-b pb-6 last:border-b-0">
                          <Badge variant="outline" className="mb-2">
                            Section {index + 1}: {section.type}
                          </Badge>
                          <div className="text-muted-foreground italic">
                            [{section.type} content would appear here]
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      value={config.title}
                      onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={config.description}
                      onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Export Format</Label>
                    <Select
                      value={config.format}
                      onValueChange={(value: any) => setConfig(prev => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger id="format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="docx">Word Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orientation">Page Orientation</Label>
                    <Select
                      value={config.orientation}
                      onValueChange={(value: any) => setConfig(prev => ({ ...prev, orientation: value }))}
                    >
                      <SelectTrigger id="orientation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="timestamp"
                        checked={config.includeTimestamp}
                        onCheckedChange={(checked) =>
                          setConfig(prev => ({ ...prev, includeTimestamp: checked as boolean }))
                        }
                      />
                      <Label htmlFor="timestamp" className="font-normal">
                        Include timestamp
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="logo"
                        checked={config.includeLogo}
                        onCheckedChange={(checked) =>
                          setConfig(prev => ({ ...prev, includeLogo: checked as boolean }))
                        }
                      />
                      <Label htmlFor="logo" className="font-normal">
                        Include organization logo
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
