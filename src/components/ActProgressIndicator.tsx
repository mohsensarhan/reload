import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Users, Zap, Rocket, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Act {
  id: number;
  name: string;
  title: string;
  icon: React.ElementType;
  color: string;
}

const acts: Act[] = [
  { id: 1, name: 'crisis', title: 'Crisis', icon: AlertTriangle, color: 'text-danger' },
  { id: 2, name: 'response', title: 'Response', icon: Package, color: 'text-warning' },
  { id: 3, name: 'impact', title: 'Impact', icon: Users, color: 'text-success' },
  { id: 4, name: 'machine', title: 'Machine', icon: Zap, color: 'text-primary' },
  { id: 5, name: 'future', title: 'Future', icon: Rocket, color: 'text-neon-green' },
];

export function ActProgressIndicator() {
  const [currentAct, setCurrentAct] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const sections = acts.map(act =>
        document.querySelector(`[data-narrative-act="${act.name}"]`)
      );

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;

          if (scrollPosition >= sectionTop) {
            setCurrentAct(i + 1);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAct = (actName: string) => {
    const section = document.querySelector(`[data-narrative-act="${actName}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToNextAct = () => {
    const nextActIndex = currentAct % 5;
    const nextAct = acts[nextActIndex];
    if (nextAct) {
      scrollToAct(nextAct.name);
    }
  };

  return (
    <>
      {/* Desktop Progress Bar - Fixed Top */}
      <div className="hidden md:block fixed top-20 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono matrix-glow">
                NARRATIVE MODE
              </Badge>
              <span className="text-xs text-muted-foreground">
                Act {currentAct} of {acts.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {acts.map((act) => {
                const Icon = act.icon;
                const isActive = currentAct === act.id;
                const isCompleted = currentAct > act.id;

                return (
                  <Button
                    key={act.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => scrollToAct(act.name)}
                    className={cn(
                      'relative px-3 py-2 transition-all duration-300',
                      isActive && 'bg-primary/10 text-primary',
                      isCompleted && 'text-success'
                    )}
                    aria-label={`Go to Act ${act.id}: ${act.title}`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <Icon className={cn('w-4 h-4', act.color)} />
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary matrix-glow" />
                    )}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden lg:inline">
                {acts[currentAct - 1]?.title}
              </span>
              {currentAct < acts.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToNextAct}
                  className="gap-1 matrix-glow"
                  aria-label="Scroll to next act"
                >
                  <span className="text-xs">Next</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Progress Dots - Fixed Bottom */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-40 pb-safe">
        <div className="container mx-auto px-4">
          <div className="bg-background/95 backdrop-blur-lg border border-border rounded-full p-2 shadow-lg mx-auto max-w-fit">
            <div className="flex items-center gap-2">
              {acts.map((act) => {
                const isActive = currentAct === act.id;
                const isCompleted = currentAct > act.id;

                return (
                  <button
                    key={act.id}
                    onClick={() => scrollToAct(act.name)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      isActive && 'w-8 bg-primary',
                      isCompleted && 'bg-success',
                      !isActive && !isCompleted && 'bg-muted-foreground/30'
                    )}
                    aria-label={`Go to Act ${act.id}: ${act.title}`}
                    aria-current={isActive ? 'step' : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Next Act Button - Mobile */}
      {currentAct < acts.length && (
        <Button
          onClick={scrollToNextAct}
          size="lg"
          className="md:hidden fixed bottom-32 right-4 z-40 rounded-full w-14 h-14 shadow-lg matrix-glow"
          aria-label="Go to next act"
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
      )}
    </>
  );
}
