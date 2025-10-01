import { useCallback } from 'react';
import { useKeyboardShortcuts, KeyboardShortcut } from './useKeyboardShortcuts';

const narrativeActs = ['crisis', 'response', 'impact', 'machine', 'future'] as const;

export function useNarrativeNavigation(enabled = true) {
  const scrollToAct = useCallback((actName: string) => {
    const section = document.querySelector(`[data-narrative-act="${actName}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const getCurrentActIndex = useCallback((): number => {
    const sections = narrativeActs.map(act =>
      document.querySelector(`[data-narrative-act="${act}"]`)
    );

    const scrollPosition = window.scrollY + window.innerHeight / 3;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section) {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;

        if (scrollPosition >= sectionTop) {
          return i;
        }
      }
    }

    return 0;
  }, []);

  const goToNextAct = useCallback(() => {
    const currentIndex = getCurrentActIndex();
    const nextIndex = Math.min(currentIndex + 1, narrativeActs.length - 1);
    scrollToAct(narrativeActs[nextIndex]);
  }, [getCurrentActIndex, scrollToAct]);

  const goToPreviousAct = useCallback(() => {
    const currentIndex = getCurrentActIndex();
    const prevIndex = Math.max(currentIndex - 1, 0);
    scrollToAct(narrativeActs[prevIndex]);
  }, [getCurrentActIndex, scrollToAct]);

  const shortcuts: KeyboardShortcut[] = [
    {
      key: '1',
      description: 'Jump to Act 1: Crisis',
      action: () => scrollToAct('crisis'),
    },
    {
      key: '2',
      description: 'Jump to Act 2: Response',
      action: () => scrollToAct('response'),
    },
    {
      key: '3',
      description: 'Jump to Act 3: Impact',
      action: () => scrollToAct('impact'),
    },
    {
      key: '4',
      description: 'Jump to Act 4: Machine',
      action: () => scrollToAct('machine'),
    },
    {
      key: '5',
      description: 'Jump to Act 5: Future',
      action: () => scrollToAct('future'),
    },
    {
      key: 'ArrowDown',
      description: 'Next act',
      action: goToNextAct,
    },
    {
      key: 'ArrowUp',
      description: 'Previous act',
      action: goToPreviousAct,
    },
    {
      key: 'n',
      description: 'Next act',
      action: goToNextAct,
    },
    {
      key: 'p',
      description: 'Previous act',
      action: goToPreviousAct,
    },
    {
      key: ' ',
      description: 'Scroll to next act',
      action: goToNextAct,
    },
  ];

  useKeyboardShortcuts(shortcuts, enabled);

  return {
    scrollToAct,
    goToNextAct,
    goToPreviousAct,
    getCurrentActIndex,
    shortcuts,
  };
}
