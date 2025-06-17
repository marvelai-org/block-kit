import {
  UseSortByOptions,
  UseSortByState,
  UseSortByHooks,
  UseSortByInstanceProps,
  UseSortByRowProps,
  UseRowSelectHooks,
  UseRowSelectInstanceProps,
  UseRowSelectOptions,
  UseRowSelectRowProps,
  UseRowSelectState,
} from 'react-table';

declare module 'react-table' {
  // take this file as-is, or comment out the sections that don't apply to your plugin configuration

  export interface TableOptions<D extends Record<string, unknown>>
    extends UseSortByOptions<D>,
      UseRowSelectOptions<D>,
      // note that having Record here allows you to add anything to the options, this matches the spirit of the
      // underlying js library, but might be cleaner if it's replaced by a more specific type that matches your
      // feature set, like if you had a filter plugin typed
      // UseFiltersOptions<D>
      Record<string, unknown> {}

  export interface Hooks<D extends Record<string, unknown> = Record<string, unknown>>
    extends UseSortByHooks<D>,
      UseRowSelectHooks<D> {}

  export interface TableInstance<D extends Record<string, unknown> = Record<string, unknown>>
    extends UseSortByInstanceProps<D>,
      UseRowSelectInstanceProps<D> {}

  export interface TableState<D extends Record<string, unknown> = Record<string, unknown>>
    extends UseSortByState<D>,
      UseRowSelectState<D> {}



  export interface Row<D extends Record<string, unknown> = Record<string, unknown>>
    extends UseSortByRowProps<D>,
      UseRowSelectRowProps<D> {}
}
