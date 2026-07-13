import { createContext, useContext, useMemo, type ReactNode } from 'react';

const DbModulesContext = createContext<string[]>([]);

export interface DbGridProviderProps {
  modules: string[];
  children: ReactNode;
}

export function DbGridProvider({ modules, children }: DbGridProviderProps) {
  const value = useMemo(() => modules, [modules.join('|')]);
  return (
    <DbModulesContext.Provider value={value}>{children}</DbModulesContext.Provider>
  );
}

export function useDbModules(): string[] {
  return useContext(DbModulesContext);
}
