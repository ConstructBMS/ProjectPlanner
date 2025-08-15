import { shallow } from 'zustand/shallow';
import { usePlannerStore } from '../state/plannerStore';

/**
 * Stable selector hook for PlannerStore with shallow equality comparison.
 * This ensures components re-render reliably when the store changes.
 * 
 * @param selector Function that selects data from the store
 * @returns Selected data with stable reference equality
 * 
 * @example
 * ```tsx
 * const { tasks, selection } = usePlannerSelector(s => ({ 
 *   tasks: s.tasks, 
 *   selection: s.selectedTaskIds 
 * }));
 * ```
 */
export function usePlannerSelector<T>(selector: (s: ReturnType<typeof usePlannerStore>) => T): T {
  // @ts-ignore – bridged typing; safe for our use
  return usePlannerStore(selector as any, shallow);
}
