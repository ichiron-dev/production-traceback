/**
 * Svelte 5 adapter for @tanstack/table-core
 * Based on: https://github.com/walker-tx/svelte5-tanstack-table-reference
 */
import {
  createTable,
  type RowData,
  type TableOptions,
  type TableOptionsResolved,
} from '@tanstack/table-core';

export * from '@tanstack/table-core';

export function createSvelteTable<TData extends RowData>(
  options: TableOptions<TData>,
) {
  const resolvedOptions: TableOptionsResolved<TData> = {
    state: {},
    onStateChange: () => {},
    renderFallbackValue: null,
    ...options,
  };

  let table = $state(createTable(resolvedOptions));

  function updateOptions() {
    table.setOptions((prev) => ({
      ...prev,
      ...options,
      state: { ...prev.state, ...options.state },
      onStateChange: (updater) => {
        options.onStateChange?.(updater);
        updateOptions();
      },
    }));
  }

  return {
    get table() {
      return table;
    },
  };
}
