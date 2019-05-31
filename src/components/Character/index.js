import React from "react";

import BungieImage from "src/components/BungieImage";
import { useDefinitions } from "src/definitionsContext";

import s from "./styles.styl";

const name = def => def && def.displayProperties.name;

export default function Character({ character }) {
  const classDef = useDefinitions("Class", character.classHash);
  const genderDef = useDefinitions("Gender", character.genderHash);
  const raceDef = useDefinitions("Race", character.raceHash);
  const { red, green, blue, alpha } = character.emblemColor || {};

  const background =
    character.emblemColor && `rgba(${red}, ${green}, ${blue}, ${alpha})`;

  return (
    <div className={s.root} style={{ background }}>
      <BungieImage className={s.bgImage} src={character.emblemBackgroundPath} />
      <div className={s.content}>
        <div className={s.main}>
          <div className={s.charClass}>{name(classDef)}</div>
          <div className={s.genderRace}>
            {name(raceDef)} {name(genderDef)}
          </div>
        </div>

        <div className={s.sub}>
          <div className={s.light}>{character.light}</div>
          <div className={s.level}>
            Level {character.levelProgression.level}
          </div>
        </div>
      </div>
    </div>
  );
}
