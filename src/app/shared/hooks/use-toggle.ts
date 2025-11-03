import { signal } from '@angular/core';

export function useToggle(initialState: boolean = false) {
  const state = signal(initialState);

  const open = () => state.set(true);
  const close = () => state.set(false);
  const toggle = () => state.update((v) => !v);

  return {
    state: state.asReadonly(),
    open,
    close,
    toggle,
  };
}
