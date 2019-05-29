import React, { useState } from "react";
import cx from "classnames";

import { HELMET, ARMS, CHEST, LEGS, CLASS_ITEM } from "src/lib/destinyEnums";
import Item from "src/components/SmallItem";
import Tooltip from "src/components/Tooltip";
import { useDefinitions } from "src/definitionsContext";

import s from "./styles.styl";

// const OTHER = "other";
const CATEGORIES = [HELMET, ARMS, CHEST, LEGS, CLASS_ITEM];

export default function ItemPerkGrid({
  data,
  onTooltip,
  onItemSelect,
  onItemDeselect,
  selectedItems,
  selectedItemHashes
}) {
  const itemDefs = useDefinitions("InventoryItem");
  const categoryDefs = useDefinitions("ItemCategory");

  return (
    <div className={s.root}>
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
            <div key={perkData.perkHash} className={s.itemRow}>
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
                          onTooltipLeave={() => onTooltip(null)}
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
