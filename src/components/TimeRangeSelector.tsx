import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface TimeRange {
  label: string;
  value: string;
  getRange: () => DateRange;
}

interface TimeRangeSelectorProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function TimeRangeSelector({ value, onChange, className }: TimeRangeSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const presetRanges: TimeRange[] = [
    {
      label: 'Last 7 Days',
      value: '7d',
      getRange: () => ({
        from: subDays(new Date(), 7),
        to: new Date()
      })
    },
    {
      label: 'Last 30 Days',
      value: '30d',
      getRange: () => ({
        from: subDays(new Date(), 30),
        to: new Date()
      })
    },
    {
      label: 'Last 90 Days',
      value: '90d',
      getRange: () => ({
        from: subDays(new Date(), 90),
        to: new Date()
      })
    },
    {
      label: 'Last 6 Months',
      value: '6m',
      getRange: () => ({
        from: subMonths(new Date(), 6),
        to: new Date()
      })
    },
    {
      label: 'Last Year',
      value: '1y',
      getRange: () => ({
        from: subYears(new Date(), 1),
        to: new Date()
      })
    },
    {
      label: 'This Month',
      value: 'tm',
      getRange: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
      })
    },
    {
      label: 'This Year',
      value: 'ty',
      getRange: () => ({
        from: startOfYear(new Date()),
        to: endOfYear(new Date())
      })
    },
    {
      label: 'Year to Date',
      value: 'ytd',
      getRange: () => ({
        from: startOfYear(new Date()),
        to: new Date()
      })
    }
  ];

  const handlePresetSelect = (range: TimeRange) => {
    onChange(range.getRange());
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!value?.from) return 'Select date range';
    if (!value.to) return format(value.from, 'MMM d, yyyy');
    return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-between text-left font-normal min-w-[280px]',
            !value && 'text-muted-foreground',
            className
          )}
          aria-label="Select time range"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>{getDisplayText()}</span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r p-3 space-y-2">
            <div className="text-sm font-medium mb-3">Quick Select</div>
            {presetRanges.map((range) => (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm font-normal"
                onClick={() => handlePresetSelect(range)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
              defaultMonth={value?.from}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                disabled={!value?.from}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
