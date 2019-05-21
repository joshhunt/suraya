import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';

import BungieImage from '../BungieImage';

import s from './styles.styl';

function BasePerk({ className, definition, hash, isActive, perks }) {
  return (
    <Tooltip
      html={
        <Fragment>
          <div className={s.tooltipPerkName}>
            {definition.displayProperties.name}
          </div>
          <span className={s.tooltipPerkDescription}>
            {definition.displayProperties.description}
          </span>
        </Fragment>
      }
      position="top"
      arrow
      followCursor
    >
      <div className={cx(className, s.perk, isActive && s.activePerk)}>
        <BungieImage
          className={s.perkIcon}
          src={definition.displayProperties.icon}
        />
      </div>
    </Tooltip>
  );
}

const Perk = connect((state, ownProps) => {
  return {
    definition: state.definitions.DestinyInventoryItemDefinition[ownProps.hash]
  };
})(BasePerk);

export default function ItemDetails({ definition, instance, perks }) {
  return (
    <div className={s.root}>
      <div className={s.itemSummary}>
        <BungieImage
          className={s.itemIcon}
          src={definition.displayProperties.icon}
        />

        <div className={s.summaryMain}>
          <div>{definition.displayProperties.name}</div>
          <div className={s.sub}>
            {instance &&
              instance.primaryStat &&
              `${instance.primaryStat.value} power`}
          </div>
        </div>
      </div>

      <div className={s.sockets}>
        {perks.map(socket => (
          <div className={s.socket}>
            {socket.reusablePlugs.map(plug => (
              <Perk
                isActive={plug.plugItemHash === socket.plugHash}
                hash={plug.plugItemHash}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
