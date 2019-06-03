import React, { useState, useMemo } from "react";
import cx from "classnames";

import BungieImage from "src/components/BungieImage";
import Icon from "src/components/Icon";
import { useDefinitions } from "src/definitionsContext";

import s from "./styles.styl";

import matcher from "micromatch";

function Perk({ definition, className, ...props }) {
  return (
    <div className={cx(s.perk, className)} {...props}>
      <BungieImage
        className={s.perkIcon}
        src={definition.displayProperties.icon}
      />

      <div className={s.perkName}>{definition.displayProperties.name}</div>

      <div className={s.perkAccessory}>
        <Icon name="check" />{" "}
      </div>
    </div>
  );
}

const useItemFilter = (itemDefs, rawSearchTerm) =>
  useMemo(() => {
    const searchTerm = rawSearchTerm.toLowerCase();
    return Object.values(itemDefs).filter(itemDef => {
      return (
        searchTerm.length > 1 &&
        itemDef.itemCategoryHashes &&
        itemDef.itemCategoryHashes.includes(59) &&
        matcher.isMatch(searchTerm, itemDef.displayProperties.name.toLowerCase()) // is mod
      );
    });
  }, [itemDefs, rawSearchTerm]);

export default function PerkList({ selectPerk, deselectPerk, selectedPerks }) {
  const [searchValue, setSearchValue] = useState("");

  const itemDefs = useDefinitions("InventoryItem");
  const armourPerks = useItemFilter(itemDefs, searchValue);

  const onPerkSelect = hash => {
    selectPerk(hash);
  };

  return (
    <div>
      <div className={s.perkSearch}>
        <input
          className={s.perkSearchInput}
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />

        {searchValue.length > 0 && (
          <button className={s.clearButton} onClick={() => setSearchValue("")}>
            <Icon className={s.closeIcon} name="times" />
          </button>
        )}

        {armourPerks.map(d => (
          <Perk
            key={d.hash}
            definition={d}
            className={selectedPerks.includes(d.hash) && s.perkSelected}
            onClick={() => onPerkSelect(d.hash)}
          />
        ))}
      </div>

      {selectedPerks.map(perkHash => {
        const perkDef = itemDefs[perkHash];

        return (
          perkDef && (
            <Perk
              key={perkDef.hash}
              definition={perkDef}
              className={s.perk}
              onClick={() => deselectPerk(perkDef.hash)}
            />
          )
        );
      })}

      {selectedPerks.length === 0 && (
        <p className={s.helpText}>
          <em>Choose some perks to find items matching them.</em>
        </p>
      )}
    </div>
  );
}
