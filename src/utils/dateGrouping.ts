type GroupedItems<T> = Record<string | number, T[]>;

export function groupAndSortByDate<T>(
  items: T[],
  options: {
    groupKey: (item: T) => string | number;
    displayKey?: (item: T) => string | number;
    sortKey?: (item: T) => any;
    sortDescending?: boolean;
  }
): [string | number, T[]][] {
  // If sortKey is provided, sort the items first
  const sortedItems = options.sortKey 
    ? [...items].sort((a, b) => {
        const valueA = options.sortKey!(a);
        const valueB = options.sortKey!(b);
        return options.sortDescending !== false ? 
          (valueB > valueA ? 1 : -1) : 
          (valueA > valueB ? 1 : -1);
      })
    : items;

  // Track group order
  const groupOrder: string[] = [];
  const grouped = {} as GroupedItems<T>;

  // Group items while preserving order
  for (const item of sortedItems) {
    const key = options.groupKey(item);
    const displayKey = options.displayKey?.(item) ?? key;
    
    if (!grouped[displayKey]) {
      grouped[displayKey] = [];
      groupOrder.push(displayKey.toString());
    }
    grouped[displayKey].push(item);
  }

  // Return entries in original group order
  return groupOrder.map(key => [key, grouped[key]]);
}
