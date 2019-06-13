// eslint-disable no-console
import React, { Component } from "react";
import { isString } from "lodash";
import { Router, Route, browserHistory } from "react-router";
import { Provider } from "react-redux";

import store from "./store";
import App from "./views/App";
import Home from "./views/Home";
import UserPage from "./views/UserPage";
import Triage, { PERKS, DUPLICATES, RESULTS, DEBUG } from "./views/Triage";

export default class AppRouter extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={browserHistory}>
          <Route component={App}>
            <Route path="/" component={Home} />
            <Route path="/:membershipType/:membershipId" component={UserPage}>
              <Route path=":characterId" mode={PERKS} component={Triage} />
              <Route
                path=":characterId/perks"
                mode={PERKS}
                component={Triage}
              />
              <Route
                path=":characterId/duplicates"
                mode={DUPLICATES}
                component={Triage}
              />
              <Route
                path=":characterId/results"
                mode={RESULTS}
                component={Triage}
              />
              <Route
                path=":characterId/debug"
                mode={DEBUG}
                component={Triage}
              />
            </Route>
          </Route>
        </Router>
      </Provider>
    );
  }
}

/**
 * Warning from React Router, caused by react-hot-loader.
 * The warning can be safely ignored, so filter it from the console.
 * Otherwise you'll see it every time something changes.
 * See https://github.com/gaearon/react-hot-loader/issues/298
 */
if (module.hot) {
  const orgError = console.error;
  console.error = (...args) => {
    if (
      args &&
      args.length === 1 &&
      isString(args[0]) &&
      args[0].indexOf("You cannot change <Router routes>;") > -1
    ) {
      // React route changed
    } else {
      // Log the error as normally
      orgError.apply(console, args);
    }
  };
}
