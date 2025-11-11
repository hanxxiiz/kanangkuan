import { useState, useMemo } from 'react';

export type ViewMode = "all" | "a-z" | "newest" | "oldest";

interface Item {
  type: 'folder' | 'deck'| 'card';
  data: any;
  date: Date;
}

interface UseViewModeOptions<T> {
  items: T[];
  getDate: (item: T) => Date;
  getName: (item: T) => string;
  getType?: (item: T) => 'folder' | 'deck' | 'card';
}

export function useViewMode<T>({
  items,
  getDate,
  getName,
  getType,
}: UseViewModeOptions<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const sortedItems = useMemo(() => {
    const itemsCopy = [...items];

    switch (viewMode) {
      case "a-z":
        return itemsCopy.sort((a, b) => getName(a).localeCompare(getName(b)));
      case "newest":
        return itemsCopy.sort((a, b) => getDate(b).getTime() - getDate(a).getTime());
      case "oldest":
        return itemsCopy.sort((a, b) => getDate(a).getTime() - getDate(b).getTime());
      default:
        return itemsCopy;
    }
  }, [items, viewMode, getDate, getName]);

  return {
    viewMode,
    setViewMode,
    sortedItems,
  };
}