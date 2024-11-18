import type { ImpactCategoryKey, LifeCycleStage } from "lcax"
import type { ExtendedImpactCategoryKey } from '@/models/material'

export interface AppSettings {
  epdSource: EPDSource
  includedStages: IncludedStages
  standardImpactCategory: ExtendedImpactCategoryKey
  materialKeys: MaterialKeys
  githubApiKey: string
  firebaseConfig: FirebaseConfig
  speckleConfig: SpeckleConfig
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
  standardImpactCategory: { impactCategory: "gwp" as ImpactCategoryKey },
  materialKeys: {
    revalu: "enter key here",
    ecoPortal: "enter key here"
  },
  firebaseConfig: {
    apiKey: null,
    authDomain: "specklca.firebaseapp.com",
    projectId: "specklca",
    storageBucket: "specklca.appspot.com",
    messagingSenderId: "660785821928",
    appId: "1:660785821928:web:236a8b63b72bf6abcc715d",
    measurementId: "G-EKQGVJLEEG"
  },
  githubApiKey: "enter key here",
  speckleConfig: {
    serverUrl: "https://app.speckle.systems",
    id: "enter id here",
    secret: "enter secret here"
  }
}