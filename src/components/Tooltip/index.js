import React, { useRef } from "react";
import cx from "classnames";
import { get } from "lodash";
import { flow, keyBy, mapValues, map } from "lodash/fp";
import { connect } from "react-redux";
import useWindowSize from "src/lib/hooks/useWindowSize";
import useComponentSize from "src/lib/hooks/useComponentSize";

import getItemsFromProfile from "src/lib/getItemsFromProfile";

import BungieImage from "src/components/BungieImage";
import Icon from "src/components/Icon";

import s from "./styles.styl";

const WINDOW_PADDING = 10;

function Tooltip({
  item,
  itemInstance,
  sockets,
  selectedPerks,
  selectedPerksData,
  top: _top,
  left: _left
}) {
  const windowSize = useWindowSize();
  const ref = useRef(null);
  const tooltipSize = useComponentSize(ref);

  const windowHeight = windowSize.innerHeight - WINDOW_PADDING;
  const windowWidth = windowSize.innerWidth - WINDOW_PADDING;

  const bottomEdge = _top + tooltipSize.height;
  const bottomExtra = Math.max(bottomEdge - windowHeight, 0);

  const leftEdge = _left + tooltipSize.width;
  const left = leftEdge > windowWidth ? _left - tooltipSize.width - 5 : _left;

  const top = _top - bottomExtra;

  if (!item) {
    return null;
  }

  const isInline = _top === undefined;

  return (
    <div
      ref={ref}
      className={isInline ? s.inlineRoot : s.root}
      style={!isInline ? { top, left } : {}}
    >
      <div className={s.header}>
        <div className={s.name}>{item.displayProperties.name}</div>
        <div className={s.type}>{item.itemTypeDisplayName}</div>
        <div className={s.rarity}>{item.inventory.tierTypeName}</div>
      </div>

      {itemInstance.primaryStat && (
        <div className={s.powerSection}>
          <div className={s.power}>{itemInstance.primaryStat.value}</div>
          <div>Defense</div> {/* translate from definitions */}
        </div>
      )}

      <div className={s.perksSection}>
        {sockets.map(perks => {
          return (
            <div className={s.perkGroup}>
              {perks.map(perk => {
                const matchedItems = selectedPerksData[perk.hash];

                return (
                  perk.plugItemDef && (
                    <div
                      className={cx(s.perk, {
                        [s.perkActive]: perk.isActive,
                        [s.highlightPerk]: selectedPerks.includes(
                          perk.plugItemDef.hash
                        )
                      })}
                    >
                      <BungieImage
                        className={s.perkIcon}
                        src={perk.plugItemDef.displayProperties.icon}
                      />

                      <span className={s.perkName}>
                        {perk.plugItemDef.displayProperties.name}
                      </span>

                      {matchedItems && matchedItems.selected > 0 && (
                        <span className={s.selectedItems}>
                          <Icon className={s.selectedPerkStar} name="check" />
                          {" ⨉ "}
                          {matchedItems.selected}
                        </span>
                      )}

                      {matchedItems && matchedItems.total > 0 && (
                        <span className={s.matchedItems}>
                          <Icon
                            className={s.selectedPerkStar}
                            name="star"
                            solid
                          />
                          {" ⨉ "}
                          {matchedItems.total}
                        </span>
                      )}
                    </div>
                  )
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const k = ({ membershipType, membershipId }) =>
  [membershipType, membershipId].join("/");

function doesSocketsHavePerk(sockets, perkHash) {
  return sockets.find(socket => {
    if (socket.plugHash === perkHash) {
      return true;
    }

    if (
      socket.reusablePlugHashes &&
      socket.reusablePlugHashes.includes(perkHash)
    ) {
      return true;
    }

    return false;
  });
}

function mapStateToProps(state, ownProps) {
  const { itemInstanceId } = ownProps;
  const { selectedPerks, selectedItems } = state.perkTool;

  const pKey =
    state.profiles.$activeProfile && k(state.profiles.$activeProfile);
  const profile = state.profiles[pKey];
  const items = profile ? getItemsFromProfile(profile) : [];
  const itemSummary = items.find(i => i.itemInstanceId === itemInstanceId);

  if (!profile || !itemSummary) {
    return {};
  }

  const itemInstance = profile.itemComponents.instances.data[itemInstanceId];

  const itemDefs = state.definitions.DestinyInventoryItemDefinition || {};
  const itemDef = itemDefs[itemSummary.itemHash];

  const ARMOR_PERKS = 2518356196;
  const rawSockets = get(
    profile.itemComponents.sockets.data,
    `${itemInstanceId}.sockets`
  );
  const armorPerkCategory =
    itemDef.sockets &&
    itemDef.sockets.socketCategories.find(
      sc => sc.socketCategoryHash === ARMOR_PERKS
    );

  const sockets =
    armorPerkCategory &&
    armorPerkCategory.socketIndexes.map(socketIndex => {
      const socket = rawSockets[socketIndex];
      const plugs = socket.reusablePlugHashes || [socket.plugHash];

      return plugs.map(plugHash => ({
        hash: plugHash,
        plugItemDef: itemDefs[plugHash],
        isActive: plugHash === socket.plugHash
      }));
    });

  const relevantItems = items.filter(item => {
    const thisItemDef = itemDefs[item.itemHash];

    if (
      !thisItemDef ||
      thisItemDef.classType !== window.__HACKY_CURRENT_CLASS_TYPE ||
      thisItemDef.itemSubType !== itemDef.itemSubType
    ) {
      return false;
    }

    return true;
  });

  const selectedPerksData = flow(
    map(selectedPerkHash => {
      const result = { total: 0, selected: 0 };

      relevantItems.forEach(item => {
        const socketData =
          profile.itemComponents.sockets.data[item.itemInstanceId] || {};
        const sockets = socketData.sockets || [];

        const itemHasPerk = doesSocketsHavePerk(sockets, selectedPerkHash);

        if (itemHasPerk) {
          result.total += 1;

          if (selectedItems.includes(item.itemInstanceId)) {
            result.selected += 1;
          }
        }
      });

      return {
        perkHash: selectedPerkHash,
        ...result
      };
    }),
    keyBy("perkHash")
    // mapValues(g => g.matchedItems)
  )(selectedPerks);

  return {
    item: itemDef,
    selectedPerks,
    selectedPerksData,
    itemSummary,
    itemInstance,
    sockets
  };
}

export default connect(mapStateToProps)(Tooltip);
