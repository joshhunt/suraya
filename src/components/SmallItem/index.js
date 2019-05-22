import React from "react";
import cx from "classnames";

import Icon from "src/components/Icon";
import BungieImage from "src/components/BungieImage";

import masterworkOutline from "src/masterwork-outline.png";

import { MASTERWORK_FLAG } from "app/lib/destinyEnums";

import s from "./styles.styl";

export default function Item({
  itemWrapper,
  item,
  onTooltipEnter,
  onTooltipLeave,
  extended,
  onClick,
  isSelected,
  isDupe,
  matchedPerksThreshold
}) {
  return (
    <div
      className={cx(s.item, isDupe && s.isDupe)}
      onMouseMove={onTooltipEnter}
      onMouseLeave={onTooltipLeave}
      onClick={onClick}
    >
      {itemWrapper &&
        itemWrapper.matchedPerks.length >= (matchedPerksThreshold || 2) && (
          <div className={s.itemBadge}>
            <span className={s.number}>{itemWrapper.matchedPerks.length}</span>
          </div>
        )}

      {isSelected && (
        <div className={s.selectedBadge}>
          <Icon name="check" />
        </div>
      )}

      <div className={s.iconWrapper}>
        {itemWrapper && itemWrapper.instance.state & MASTERWORK_FLAG ? (
          <img
            className={s.masterworkOverlay}
            src={masterworkOutline}
            alt="Masterwork"
          />
        ) : null}
        <BungieImage className={s.itemIcon} src={item.displayProperties.icon} />
      </div>
      {extended && item.displayProperties.name}
    </div>
  );
}
