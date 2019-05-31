import React, { useState } from "react";

import { bungieUrl } from "src/lib/destinyUtils";
import BungieImage from "src/components/BungieImage";
import { useDefinitions } from "src/definitionsContext";

import vaultIcon from "./vault.svg";
import s from "./styles.styl";

function CharacterButton({ character, vault }) {
  let background;
  let classDef;

  if (character) {
    classDef = useDefinitions("Class", character.classHash);
    const { red, green, blue, alpha } = character.emblemColor || {};
    background =
      character.emblemColor && `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  const emblem = character
    ? character.emblemPath
    : "/common/destiny2_content/icons/62c2fd046d87adf3006632aebbfb13f0.png";

  return (
    <button className={s.transferCharacter} style={{ background }}>
      <div className={s.transferButtonInner}>
        {character ? (
          <BungieImage className={s.emblem} src={character.emblemPath} />
        ) : (
          <img src={vaultIcon} className={s.vaultIcon} />
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

export default function HeadingWithTransfers({ children, profile }) {
  const [showDrawer, setShowDrawer] = useState(true);

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
          <div className={s.drawerTitle}>Transfer to:</div>

          <div className={s.buttons}>
            {Object.values(profile.characters.data).map(character => (
              <CharacterButton
                character={character}
                key={character.characterId}
              />
            ))}

            <CharacterButton vault />
          </div>
        </div>
      )}
    </div>
  );
}
