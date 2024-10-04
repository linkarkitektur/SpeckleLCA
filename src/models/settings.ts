import type { ImpactCategoryKey, LifeCycleStage } from "lcax";

export interface AppSettings {
  epdSource: EPDSource
  includedStages: IncludedStages
  standardImpactCategory: StandardImpactCategory
}

export enum EPDSource {
  EcoPortal,
  Revalu,
  LCAByg,
  Other
}

/**
 * Simple interface for stage inclusion
 */
interface IncludedStages {
  relevantStages: Array<{
    included: boolean;
    stage: LifeCycleStage;
  }>
}

/**
 * Simple interface for impact category inclusion
 * TODO: This should be expanded to include more data
 */
interface StandardImpactCategory {
  impactCategory: ImpactCategoryKey
}

/**
 * Default settings for the application
 */
export const standardSettings: AppSettings = {
  epdSource: EPDSource.Revalu,
  includedStages: {
    relevantStages: [
      { included: true, stage: "a1a3" as LifeCycleStage }, // Manufacturing
      { included: true, stage: "a4" as LifeCycleStage }, // Transport
      { included: true, stage: "a5" as LifeCycleStage }, // Assembly
      { included: true, stage: "b1" as LifeCycleStage }, // Use
      { included: true, stage: "c1" as LifeCycleStage }, // End of life
    ]
  },
  standardImpactCategory: { impactCategory: "gwp" as ImpactCategoryKey }
}