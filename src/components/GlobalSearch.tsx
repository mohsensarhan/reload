import React, { useState, useEffect, useCallback } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, TrendingUp, DollarSign, Users, Target, Globe, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  title: string;
  section: string;
  type: 'metric' | 'section' | 'insight';
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface GlobalSearchProps {
  onNavigate: (sectionId: string) => void;
  onMetricSelect?: (metricId: string) => void;
}

export function GlobalSearch({ onNavigate, onMetricSelect }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const searchableItems: SearchResult[] = [
    {
      id: 'lives-impacted',
      title: 'Lives Impacted',
      section: 'Executive',
      type: 'metric',
      description: '4.96M people reached nationwide',
      icon: <Users className="w-4 h-4" />,
      action: () => {
        onNavigate('executive');
        onMetricSelect?.('lives-impacted');
        setOpen(false);
      }
    },
    {
      id: 'meals-delivered',
      title: 'Meals Delivered',
      section: 'Executive',
      type: 'metric',
      description: '367.5M meals distributed annually',
      icon: <Target className="w-4 h-4" />,
      action: () => {
        onNavigate('executive');
        onMetricSelect?.('meals-delivered');
        setOpen(false);
      }
    },
    {
      id: 'cost-per-meal',
      title: 'Cost Per Meal',
      section: 'Financial',
      type: 'metric',
      description: 'EGP 6.36 all-inclusive cost',
      icon: <DollarSign className="w-4 h-4" />,
      action: () => {
        onNavigate('financial');
        onMetricSelect?.('cost-per-meal');
        setOpen(false);
      }
    },
    {
      id: 'executive-section',
      title: 'Executive Dashboard',
      section: 'Navigation',
      type: 'section',
      description: 'Strategic performance overview and KPIs',
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => {
        onNavigate('executive');
        setOpen(false);
      }
    },
    {
      id: 'financial-section',
      title: 'Financial Analytics',
      section: 'Navigation',
      type: 'section',
      description: 'Revenue analysis and financial health',
      icon: <DollarSign className="w-4 h-4" />,
      action: () => {
        onNavigate('financial');
        setOpen(false);
      }
    },
    {
      id: 'operational-section',
      title: 'Operations Excellence',
      section: 'Navigation',
      type: 'section',
      description: 'Distribution efficiency and logistics',
      icon: <Target className="w-4 h-4" />,
      action: () => {
        onNavigate('operational');
        setOpen(false);
      }
    },
    {
      id: 'programs-section',
      title: 'Program Impact',
      section: 'Navigation',
      type: 'section',
      description: 'Protection, Prevention & Empowerment analysis',
      icon: <Target className="w-4 h-4" />,
      action: () => {
        onNavigate('programs');
        setOpen(false);
      }
    },
    {
      id: 'stakeholders-section',
      title: 'Stakeholder Intelligence',
      section: 'Navigation',
      type: 'section',
      description: 'Brand performance and partnerships',
      icon: <Users className="w-4 h-4" />,
      action: () => {
        onNavigate('stakeholders');
        setOpen(false);
      }
    },
    {
      id: 'scenarios-section',
      title: 'Scenario Modeling',
      section: 'Navigation',
      type: 'section',
      description: 'Advanced econometric modeling',
      icon: <Brain className="w-4 h-4" />,
      action: () => {
        onNavigate('scenarios');
        setOpen(false);
      }
    },
    {
      id: 'global-signals',
      title: 'Global & Egypt Indicators',
      section: 'Executive',
      type: 'insight',
      description: 'Live macro, prices, and climate signals',
      icon: <Globe className="w-4 h-4" />,
      action: () => {
        onNavigate('executive');
        setOpen(false);
        setTimeout(() => {
          document.getElementById('global-indicators')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    {
      id: 'revenue',
      title: 'Revenue Analysis',
      section: 'Financial',
      type: 'metric',
      description: 'EGP 2.20B annual revenue breakdown',
      icon: <DollarSign className="w-4 h-4" />,
      action: () => {
        onNavigate('financial');
        setOpen(false);
      }
    },
    {
      id: 'program-efficiency',
      title: 'Program Efficiency',
      section: 'Executive',
      type: 'metric',
      description: '83% program spending ratio',
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => {
        onNavigate('executive');
        setOpen(false);
      }
    }
  ];

  const filteredItems = searchableItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query)
    );
  });

  const groupedResults = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'metric': return 'Metrics';
      case 'section': return 'Sections';
      case 'insight': return 'Insights';
      default: return 'Results';
    }
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search metrics, sections, or insights..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {Object.entries(groupedResults).map(([type, items]) => (
            <CommandGroup key={type} heading={getTypeLabel(type)}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={item.action}
                  className="flex items-start gap-3 py-3"
                >
                  <div className="mt-1">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.section}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>

        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Press ESC to close</span>
            <div className="flex items-center gap-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium">
                <span className="text-xs">⌘</span>K
              </kbd>
              <span>to search</span>
            </div>
          </div>
        </div>
      </CommandDialog>

      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
        aria-label="Search dashboard"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs font-medium ml-2">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    </>
  );
}
