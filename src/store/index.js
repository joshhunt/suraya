import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import app from "./app";
import auth from "./auth";
import profiles from "./profiles";
import perkTool from "./perkTool";

import definitions, {
  setBulkDefinitions,
  definitionsStatus,
  definitionsError,
  SET_BULK_DEFINITIONS
} from "app/store/definitions";

import { fasterGetDefinitions } from "app/lib/definitions";

// TODO: https://github.com/rt2zz/redux-persist-crosstab

const persistConfig = {
  key: "perkTool",
  whitelist: ["selectedPerks", "selectedItems"],
  storage
};

const rootReducer = combineReducers({
  app,
  auth,
  profiles,
  perkTool: persistReducer(persistConfig, perkTool),
  definitions
});

const composeEnhancers =
  typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        actionsBlacklist: [SET_BULK_DEFINITIONS],
        stateSanitizer: state => ({
          ...state,
          definitions: state.definitions ? "[hidden]" : state.definitions
        })
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(thunk));

const store = createStore(rootReducer, enhancer);
persistStore(store);
window.__store = store;

store.subscribe(() => (window.__state = store.getState()));

const LANGUAGE = "en";

fasterGetDefinitions(
  LANGUAGE,
  null,
  data => {
    store.dispatch(definitionsStatus(data));
  },
  (err, data) => {
    if (err) {
      store.dispatch(definitionsError(err));
      return;
    }

    if (data && data.definitions) {
      store.dispatch(definitionsStatus({ status: null }));
      store.dispatch(setBulkDefinitions(data.definitions));
    }
  }
);

export default store;
