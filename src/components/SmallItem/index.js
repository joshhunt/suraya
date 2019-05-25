import React, { useRef } from "react";
import cx from "classnames";

import Icon from "src/components/Icon";
import BungieImage from "src/components/BungieImage";

import masterworkOutline from "src/masterwork-outline.png";

import { MASTERWORK_FLAG } from "app/lib/destinyEnums";

import s from "./styles.styl";

const TOUCH_HOLD_TIMEOUT = 200;

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
  const isTouching = useRef(null);
  const touchTimeoutId = useRef(null);

  function onTouchStart(ev) {
    ev.preventDefault();
    isTouching.current = true;

    touchTimeoutId.current = setTimeout(() => {
      touchTimeoutId.current = null;
      onClick && onClick();
    }, TOUCH_HOLD_TIMEOUT);
  }

  function onTouchEnd(ev) {
    if (touchTimeoutId.current) {
      clearTimeout(touchTimeoutId.current);
      touchTimeoutId.current = null;
      const { x, y } = ev.target.getBoundingClientRect();
      onTooltipEnter && onTooltipEnter({ clientX: x, clientY: y });
    }
  }

  function onMouseMove(ev) {
    if (isTouching.current) {
      return;
    }

    onTooltipEnter && onTooltipEnter(ev);
  }

  function onMouseLeave(ev) {
    onTooltipLeave && onTooltipLeave(ev);
  }

  function _onClick(ev) {
    if (isTouching.current) {
      return;
    }

    onClick && onClick(ev);
  }

  return (
    <div
      className={cx(s.item, isDupe && s.isDupe)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={_onClick}
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
