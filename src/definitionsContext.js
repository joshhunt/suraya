import { createContext, useContext } from "react";

export const DefinitionsContext = createContext({});

export const useDefinitions = (table, hash) => {
  const definitions = useContext(DefinitionsContext);
  const fullTableName = `Destiny${table}Definition`;

  if (!table) {
    return definitions;
  }

  const tableDefs = definitions[fullTableName] || {};

  if (!hash) {
    return tableDefs;
  }

  return tableDefs[hash];
};
