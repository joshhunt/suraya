import React, { useState } from "react";
import { groupBy } from "lodash";

import { bungieUrl } from "src/lib/destinyUtils";
import { useDefinitions } from "src/definitionsContext";
import transferItem, { VAULT } from "src/lib/transferItem";

import BungieImage from "src/components/BungieImage";
import Icon from "src/components/Icon";

import vaultIcon from "./vault.svg";
import s from "./styles.styl";

function CharacterButton({ character, vault, onTransfer, ...props }) {
  let background;
  let classDef;

  if (character) {
    classDef = useDefinitions("Class", character.classHash);
    const { red, green, blue, alpha } = character.emblemColor || {};
    background =
      character.emblemColor && `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function onClick() {
    const destination = character ? character.characterId : VAULT;
    onTransfer(destination);
  }

  return (
    <button
      className={s.transferCharacter}
      style={{ background }}
      onClick={onClick}
      {...props}
    >
      <div className={s.transferButtonInner}>
        {character ? (
          <BungieImage className={s.emblem} src={character.emblemPath} />
        ) : (
          <img src={vaultIcon} className={s.vaultIcon} alt="" />
        )}

        <div className={s.name}>
          {vault ? "Vault" : classDef && classDef.displayProperties.name}
        </div>
      </div>

      {character && (
        <div
          className={s.backdrop}
          style={{
            backgroundImage: `url("${bungieUrl(
              character.emblemBackgroundPath
            )}")`
          }}
        />
      )}
    </button>
  );
}

async function transferMultiple(
  items,
  destination,
  profile,
  allDefs,
  activeProfile,
  accessToken
) {
  const allIds = items.map(i => i.itemInstanceId);
  const errors = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    console.log("%cgoing to transfer", "font-weight: bold;", item);
    try {
      await transferItem(
        item,
        destination,
        profile,
        allDefs,
        activeProfile,
        accessToken,
        allIds
      );
      console.log("%csuccess!", "font-weight: bold; color: green");
    } catch (err) {
      console.groupEnd();
      err.NO_ROOM
        ? console.log("%cerror!", "font-weight: bold", err.message)
        : console.log("%cerror!", "font-weight: bold; color: red;", err);
      errors.push(err);
    }
  }

  return errors;
}

export default function HeadingWithTransfers({
  children,
  items,
  profile,
  accessToken,
  activeProfile
}) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [partialTransfer, setPartialTransfer] = useState(false);
  const [errorTransferring, setErrorTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const allDefs = useDefinitions();

  function transfer(destination) {
    setPartialTransfer(false);
    setErrorTransferring(false);
    setTransferSuccess(false);
    setIsTransferring(true);

    const itemInstances = items.map(itemWrapper => itemWrapper.instance);

    transferMultiple(
      itemInstances,
      destination,
      profile,
      allDefs,
      activeProfile,
      accessToken
    )
      .then(errors => {
        const errorTypes = groupBy(errors, err =>
          err.NO_ROOM ? "noRoom" : "other"
        );

        if (errorTypes.other) {
          setErrorTransferring(true);
        } else if (errorTypes.noRoom) {
          setPartialTransfer(true);
        } else {
          setTransferSuccess(true);
        }
      })
      .catch(err => {
        console.error(err);
        window.alert("error transferring items");
      })
      .finally(() => setIsTransferring(false));
  }

  return (
    <div className={s.root}>
      <h3 className={s.heading}>{children}</h3>

      <div className={s.accessory}>
        <button onClick={() => setShowDrawer(!showDrawer)} type="button">
          Transfer
        </button>
      </div>

      {showDrawer && profile && (
        <div className={s.transferDrawer}>
          <div className={s.drawerTitle}>
            <div>Transfer to:</div>

            {isTransferring && (
              <div className={s.transferring}>
                <Icon name="spinner-third" spin /> Transferring...
              </div>
            )}

            {partialTransfer && (
              <div className={s.transferring}>Partially transferred items</div>
            )}

            {errorTransferring && (
              <div className={s.transferring}>Error transferring items</div>
            )}

            {transferSuccess && (
              <div className={s.transferring}>
                Successfully transferred items
              </div>
            )}
          </div>

          <div className={s.buttons}>
            {Object.values(profile.characters.data).map(character => (
              <CharacterButton
                disabled={isTransferring}
                character={character}
                key={character.characterId}
                onTransfer={transfer}
              />
            ))}

            <CharacterButton
              vault
              disabled={isTransferring}
              onTransfer={transfer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
