"use client";

import { SceneRoot } from "./SceneRoot";
import { HeroMonolith } from "./HeroMonolith";
import { ConductorLine } from "./ConductorLine";

export function SceneStage() {
  return (
    <SceneRoot>
      <HeroMonolith />
      <ConductorLine />
    </SceneRoot>
  );
}
