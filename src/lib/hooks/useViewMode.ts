import { useState, useMemo } from 'react';

export type ViewMode = "all" | "a-z" | "newest" | "oldest";

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
}: UseViewModeOptions<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const sortedItems = useMemo(() => {
    const itemsCopy = [...items];

    switch (viewMode) {
      case "a-z":
        return itemsCopy.sort((a: T, b: T) => getName(a).localeCompare(getName(b)));
      case "newest":
        return itemsCopy.sort((a: T, b: T) => getDate(b).getTime() - getDate(a).getTime());
      case "oldest":
        return itemsCopy.sort((a: T, b: T) => getDate(a).getTime() - getDate(b).getTime());
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