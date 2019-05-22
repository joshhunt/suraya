import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router";

import { getProfile, setActiveProfile } from "src/store/profiles";
import * as perkActions from "src/store/perkTool";
import destinyAuth from "src/lib/destinyAuth";
import { setAuth, getMembership } from "src/store/auth";

import Character from "src/components/Character";
import PerkList from "src/components/PerkList";

import s from "./styles.styl";

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join("/");

class UserPage extends Component {
  componentDidMount() {
    this.props.setActiveProfile(this.props.routeParams);

    destinyAuth((err, result) => {
      this.props.setAuth({ err, result });
      this.props.getProfile(this.props.routeParams);

      if (result.isFinal && result.isAuthenticated) {
        this.props.getMembership();
      }
    });
  }

  renderName() {
    const { profile, pKey } = this.props;
    return profile ? profile.profile.data.userInfo.displayName : pKey;
  }

  viewPGCRDetails = pgcrId => {
    this.props.toggleViewPGCRDetails(pgcrId);
    this.props.getPGCRDetails(pgcrId);
  };

  render() {
    const {
      profile,
      children,
      selectedPerks,
      addSelectedPerk,
      removeSelectedPerk,
      routeParams: { membershipId, membershipType }
    } = this.props;

    return (
      <div className={s.root}>
        <div className={s.side}>
          <div className={s.characters}>
            {profile &&
              Object.values(profile.characters.data).map(character => (
                <Link
                  key={character.characterId}
                  to={`/${membershipType}/${membershipId}/${
                    character.characterId
                  }`}
                >
                  <Character character={character} />
                </Link>
              ))}
          </div>

          <div className={s.perks}>
            <h2>perks</h2>

            <PerkList
              selectedPerks={selectedPerks}
              selectPerk={addSelectedPerk}
              deselectPerk={removeSelectedPerk}
            />
          </div>
        </div>
        <div className={s.sidebarSpacer} />
        <div className={s.main}>{children}</div>
      </div>
    );
  }
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
