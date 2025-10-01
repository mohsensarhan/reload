import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import { KeyboardShortcut, getShortcutLabel } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  const [open, setOpen] = useState(false);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = getCategoryForShortcut(shortcut);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
        aria-label="View keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4" />
        <span className="hidden sm:inline">Shortcuts</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate and interact with the dashboard more efficiently
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium bg-background border border-border rounded">
                        {getShortcutLabel(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-foreground">
              <strong>Pro tip:</strong> Most shortcuts work from anywhere in the dashboard. Some shortcuts may be disabled when typing in input fields.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getCategoryForShortcut(shortcut: KeyboardShortcut): string {
  const key = shortcut.key.toLowerCase();
  const desc = shortcut.description.toLowerCase();

  if (key === 'k' || desc.includes('search')) return 'Search & Navigation';
  if (key === '?' || desc.includes('help')) return 'Help';
  if (key >= '1' && key <= '9') return 'Section Navigation';
  if (desc.includes('export') || desc.includes('download')) return 'Data Operations';
  if (desc.includes('refresh') || desc.includes('reload')) return 'Data Management';

  return 'General';
}
