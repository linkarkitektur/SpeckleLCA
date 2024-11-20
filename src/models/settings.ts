import type { LifeCycleStage } from "lcax"
import type { ExtendedImpactCategoryKey } from '@/models/material'
import type { BuildingCodeItem } from '@/models/buildingCode'
import { BSAB96 } from '@/models/buildingCode'

/**
 * Settings for external connections such as API keys and configurations
 */
export interface KeySettings {
  materialKeys: MaterialKeys,
  githubApiKey: string
  firebaseConfig: FirebaseConfig
  speckleConfig: SpeckleConfig
}

export interface CalculationSettings {
  includedStages: IncludedStages
  standardImpactCategory: ExtendedImpactCategoryKey
  buildingCode: {
    key: string,
    data: BuildingCodeItem[],
  },

}

export interface MaterialSettings {
  epdSource: EPDSource
}

export interface AppSettings {
  colorscheme: string
}

export enum EPDSource {
  EcoPortal,
  Revalu,
  LCAByg,
  Other
}

export interface SettingView {
  name: string,
  icon: any,
  current: boolean
}


interface SpeckleConfig {
  serverUrl: string
  id: string
  secret: string
}

/**
 * Configuration for firebase, this is using an auto creation of users to the project
 * TODO: Check if this is the best way or move to Speckle
 */
interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

/**
 * External API keys, add more here if needed
 */
interface MaterialKeys {
  revalu: string
  ecoPortal: string
}

/**
 * Simple interface for stage inclusion
 */
interface IncludedStages {
  relevantStages: Array<{
    included: boolean
    stage: LifeCycleStage
  }>
}

/**
 * Default settings for the application
 */
export const standardAppSettings: AppSettings = {
  colorscheme: 'light'
}

/**
 * Default settings for the material settings
 */
export const standardKeySettings: KeySettings = {
  materialKeys: {
    revalu: null,
    ecoPortal: null
  },
  githubApiKey: null,
  firebaseConfig: {
    apiKey: null,
    authDomain: "specklca.firebaseapp.com",
    projectId: "specklca",
    storageBucket: "specklca.appspot.com",
    messagingSenderId: "660785821928",
    appId: "1:660785821928:web:236a8b63b72bf6abcc715d",
    measurementId: "G-EKQGVJLEEG"
  },
  speckleConfig: {
    serverUrl: "https://app.speckle.systems",
    id: null,
    secret: null
  }
}

export const standardCalculationSettings: CalculationSettings = {
  includedStages: {
    relevantStages: [
      { included: true, stage: "a1a3" as LifeCycleStage }, // Manufacturing
      { included: true, stage: "a4" as LifeCycleStage }, // Transport
      { included: true, stage: "a5" as LifeCycleStage }, // Assembly
      { included: true, stage: "b1" as LifeCycleStage }, // Use
      { included: true, stage: "c1" as LifeCycleStage }, // End of life
    ]
  },
  standardImpactCategory: 'gwp',
  buildingCode: {
    key: 'BSAB96',
    data: BSAB96
  }
}

export const standardMaterialSettings: MaterialSettings = {
  epdSource: EPDSource.Revalu
}