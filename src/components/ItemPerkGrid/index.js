import React, { useState } from "react";
import cx from "classnames";

import { HELMET, ARMS, CHEST, LEGS, CLASS_ITEM } from "src/lib/destinyEnums";
import BungieImage from "src/components/BungieImage";
import Icon from "src/components/Icon";
import Tooltip from "src/components/Tooltip";
import { useDefinitions } from "src/definitionsContext";
import masterworkOutline from "src/masterwork-outline.png";

import { MASTERWORK_FLAG } from "app/lib/destinyEnums";

import s from "./styles.styl";

// const OTHER = "other";
const CATEGORIES = [HELMET, ARMS, CHEST, LEGS, CLASS_ITEM];

function Item({
  itemWrapper,
  item,
  onTooltipEnter,
  onTooltipLeave,
  extended,
  onClick,
  isSelected,
  isDupe
}) {
  return (
    <div
      className={cx(s.item, isDupe && s.isDupe)}
      onMouseMove={onTooltipEnter}
      onMouseLeave={onTooltipLeave}
      onClick={onClick}
    >
      {itemWrapper && itemWrapper.matchedPerks.length > 1 && (
        <div className={s.itemBadge}>{itemWrapper.matchedPerks.length}</div>
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

export default function ItemPerkGrid({
  data,
  onItemSelect,
  onItemDeselect,
  selectedItems,
  selectedItemHashes
}) {
  const itemDefs = useDefinitions("InventoryItem");
  const categoryDefs = useDefinitions("ItemCategory");
  const [activeTooltip, setActiveTooltip] = useState();

  const tooltipItemDef =
    activeTooltip &&
    activeTooltip.itemWrapper &&
    itemDefs[activeTooltip.itemWrapper.instance.itemHash];

  function onTooltip(ev, itemWrapper) {
    const x = ev.clientX + 5;
    const y = ev.clientY + 5;
    setActiveTooltip({ itemWrapper, x, y });
  }

  return (
    <div className={s.root}>
      {tooltipItemDef && (
        <Tooltip
          top={activeTooltip.y}
          left={activeTooltip.x}
          itemInstanceId={activeTooltip.itemWrapper.instance.itemInstanceId}
          itemHash={tooltipItemDef.hash}
        />
      )}

      <div className={s.headerRow}>
        <div className={s.perkCell}>Perk</div>

        {CATEGORIES.map(category => {
          const categoryDef = categoryDefs[category];
          return (
            <div key={category} className={s.categoryCell}>
              {categoryDef ? categoryDef.displayProperties.name : category}
            </div>
          );
        })}
      </div>

      <div className={s.body}>
        {data.map(perkData => {
          const perkDef = itemDefs[perkData.perkHash];
          return (
            <div className={s.itemRow}>
              <div className={s.perkCell}>
                {perkDef && <Item item={perkDef} />}
              </div>

              {CATEGORIES.map(category => (
                <div key={category} className={s.itemsCell}>
                  {(perkData.items[category] || []).map(itemWrapper => {
                    const { itemInstanceId, itemHash } = itemWrapper.instance;
                    const itemDef = itemDefs[itemHash];
                    const isSelected = selectedItems.includes(itemInstanceId);
                    return (
                      itemDef && (
                        <Item
                          onTooltipEnter={ev => onTooltip(ev, itemWrapper)}
                          onTooltipLeave={() => setActiveTooltip(null)}
                          onClick={() =>
                            isSelected
                              ? onItemDeselect(itemInstanceId)
                              : onItemSelect(itemInstanceId)
                          }
                          isSelected={isSelected}
                          isDupe={
                            !isSelected && selectedItemHashes.includes(itemHash)
                          }
                          key={itemInstanceId}
                          item={itemDef}
                          itemWrapper={itemWrapper}
                        />
                      )
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
