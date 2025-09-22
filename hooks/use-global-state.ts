import { useCallback, useEffect, useState } from 'react';

type StateChangeListener<T> = (newState: T) => void;

class GlobalStateManager<T> {
  private state: T;
  private listeners: Set<StateChangeListener<T>> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(newState: T | ((prevState: T) => T)): void {
    const updatedState = typeof newState === 'function' 
      ? (newState as (prevState: T) => T)(this.state)
      : newState;
    
    this.state = updatedState;
    this.notifyListeners();
  }

  subscribe(listener: StateChangeListener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export function createGlobalState<T>(initialState: T) {
  const manager = new GlobalStateManager(initialState);

  return function useGlobalState(): [T, (newState: T | ((prevState: T) => T)) => void] {
    const [state, setState] = useState(manager.getState());

    useEffect(() => {
      const unsubscribe = manager.subscribe(setState);
      return unsubscribe;
    }, []);

    const updateState = useCallback((newState: T | ((prevState: T) => T)) => {
      manager.setState(newState);
    }, []);

    return [state, updateState];
  };
}