import { ImpactCategoryKey, LifeCycleStage } from "lcax";

export enum EPDSource {
  EcoPortal,
  Revalu,
  LCAByg,
  Other
}

/**
 * Simple interface for stage inclusion
 */
export interface includedStages {
  relevantStages: [
    included: boolean,
    stage: LifeCycleStage
  ]
}