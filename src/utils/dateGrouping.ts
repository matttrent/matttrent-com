type GroupedItems<T> = Record<string | number, T[]>;

export function groupAndSortByDate<T>(
  items: T[],
  options: {
    sortKey: (item: T) => string | number;
    displayKey?: (item: T) => string | number;
    sortDescending?: boolean;
  }
): [string | number, T[]][] {
  // Group items
  const grouped = items.reduce((acc, item) => {
    const key = options.sortKey(item);
    const displayKey = options.displayKey?.(item) ?? key;
    if (!acc[displayKey]) acc[displayKey] = [];
    acc[displayKey].push(item);
    return acc;
  }, {} as GroupedItems<T>);

  // Sort groups by the original sort keys
  const sortKeyMap = items.reduce((acc, item) => {
    const displayKey = options.displayKey?.(item) ?? options.sortKey(item);
    acc[displayKey] = options.sortKey(item);
    return acc;
  }, {} as Record<string | number, string | number>);

  return Object.entries(grouped).sort(([a], [b]) => {
    const valueA = Number(sortKeyMap[a]);
    const valueB = Number(sortKeyMap[b]);
    return options?.sortDescending !== false ? 
      valueB - valueA : 
      valueA - valueB;
  });
}
