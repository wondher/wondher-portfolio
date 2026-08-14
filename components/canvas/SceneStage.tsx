"use client";

import { SceneRoot } from "./SceneRoot";
import { HeroMonolith } from "./HeroMonolith";
import { CapabilityMatrix } from "./CapabilityMatrix";
import { CaseViewports } from "./CaseViewports";
import { ConductorLine } from "./ConductorLine";

export function SceneStage() {
  return (
    <SceneRoot>
      <HeroMonolith />
      <CapabilityMatrix />
      <CaseViewports />
      <ConductorLine />
    </SceneRoot>
  );
}
