import React from 'react';
import { cn } from '@/lib/utils';
import { ChartBar as BarChart3, DollarSign, Zap, Target, Users, Brain } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortLabel: string;
}

interface MobileBottomNavProps {
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
  className?: string;
}

export function MobileBottomNav({ currentSection, onSectionChange, className }: MobileBottomNavProps) {
  const navItems: NavItem[] = [
    {
      id: 'executive',
      label: 'Executive',
      shortLabel: 'Home',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'financial',
      label: 'Financial',
      shortLabel: 'Finance',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      id: 'operational',
      label: 'Operations',
      shortLabel: 'Ops',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'programs',
      label: 'Programs',
      shortLabel: 'Programs',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: 'stakeholders',
      label: 'Stakeholders',
      shortLabel: 'People',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      shortLabel: 'Model',
      icon: <Brain className="w-5 h-5" />
    }
  ];

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-50',
        'bg-card/95 backdrop-blur-xl border-t border-card-border',
        'safe-area-inset-bottom',
        className
      )}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'transition-all duration-200 ease-in-out',
                'hover:bg-muted/50 active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                isActive && 'bg-primary/10'
              )}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.icon}
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.shortLabel}
              </span>
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
