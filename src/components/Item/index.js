import React from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';

import BungieImage from 'src/components/BungieImage';

import s from './styles.styl';

const NO_ICON = '/img/misc/missing_icon_d2.png';

function Item({ item, className, instance }) {
  const icon = (item && item.displayProperties.icon) || NO_ICON;

  return (
    <div className={cx(className, s.root)}>
      <BungieImage className={s.icon} src={icon} />
      <div className={s.main}>
        <div className={s.name}>{item && item.displayProperties.name}</div>
        <div className={s.sub}>
          {instance.quantity === 1
            ? item.itemTypeDisplayName
            : instance.quantity}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  return {
    item:
      state.definitions.DestinyInventoryItemDefinition &&
      state.definitions.DestinyInventoryItemDefinition[ownProps.hash]
  };
};

export default connect(mapStateToProps)(Item);
