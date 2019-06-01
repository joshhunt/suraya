import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";

import { getProfile, setActiveProfile } from "src/store/profiles";
import * as perkActions from "src/store/perkTool";
import destinyAuth from "src/lib/destinyAuth";
import { setAuth, getMembership } from "src/store/auth";
import useComponentSize from "src/lib/hooks/useComponentSize";

import Character from "src/components/Character";
import PerkList from "src/components/PerkList";

import s from "./styles.styl";

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join("/");

function UserPage({
  routeParams,
  profile,
  children,
  selectedPerks,
  addSelectedPerk,
  removeSelectedPerk,
  setActiveProfile,
  setAuth,
  getProfile,
  getMembership,
  params: { membershipId, membershipType, characterId }
}) {
  useEffect(() => {
    setActiveProfile(routeParams);

    destinyAuth((err, result) => {
      setAuth({ err, result });
      getProfile(routeParams);

      if (result.isFinal && result.isAuthenticated) {
        getMembership();
      }
    });
  }, [routeParams, setActiveProfile, setAuth, getProfile, getMembership]);

  const sidebarRef = useRef(null);
  const sidebarSize = useComponentSize(sidebarRef);

  return (
    <div className={s.root}>
      <div className={s.side} ref={sidebarRef}>
        <div className={s.characters}>
          {profile &&
            Object.values(profile.characters.data).map(character => (
              <Link
                className={
                  characterId === character.characterId
                    ? s.activeCharacterLink
                    : s.characterLink
                }
                key={character.characterId}
                to={`/${membershipType}/${membershipId}/${
                  character.characterId
                }/perks`}
              >
                <Character character={character} />
              </Link>
            ))}
        </div>

        <div className={s.perks}>
          <h3>Perks</h3>

          <PerkList
            selectedPerks={selectedPerks}
            selectPerk={addSelectedPerk}
            deselectPerk={removeSelectedPerk}
          />
        </div>
      </div>
      <div className={s.sidebarSpacer} style={{ height: sidebarSize.height }} />

      <div className={s.main}>
        {profile ? (
          children || (
            <div>
              <span role="img" aria-label="pointing left">
                👈
              </span>{" "}
              select a class to begin
            </div>
          )
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

function mapStateToProps(state, ownProps) {
  const pKey = k(ownProps.routeParams);

  return {
    selectedPerks: state.perkTool.selectedPerks,
    itemDefinitions: state.definitions.DestinyInventoryItemDefinition,
    isAuthenticated: state.auth.isAuthenticated,
    pKey,
    profile: state.profiles[pKey]
  };
}

const mapDispatchToActions = {
  getProfile,
  setActiveProfile,
  setAuth,
  getMembership,
  ...perkActions
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(UserPage);
