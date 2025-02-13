import type { LifeCycleStage } from "lcax"
import type { ExtendedImpactCategoryKey } from '@/models/material'
import type { BuildingCodeItem } from '@/models/buildingCode'
import type { MaterialFilterParam, MaterialSortingParam } from '@/models/material'

import { Source } from '@/models/material'
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
  }
}

export interface MaterialSettings {
  Source: Source
  includeCollections: boolean
  globalAssemblies: boolean
  filterParams: MaterialFilterParam[]
  sortingParams: MaterialSortingParam[]
}

export interface AppSettings {
  colorscheme: string
  area: number
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
 * TODO Move the project specific settings to a seperate interface?
 */
export const standardAppSettings: AppSettings = {
  colorscheme: 'light',
  area: 1000
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
    id: "25477842e5",
    secret: "c5a683ccc4"
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
  Source: Source.Revalu,
  includeCollections: true,
  globalAssemblies: false,
  filterParams: [
    {
      paramName: 'metaData.Collection',
      displayName: 'Revalu Collection',
      selected: true
    },
    {
      paramName: 'source',
      displayName: 'Source',
      selected: true
    },
    {
      paramName: 'metaData.materialType',
      displayName: 'Material Type',
      selected: true
    },
    {
      paramName: 'isAssembly',
      displayName: 'Assembly',
      selected: true
    },
  ],
  sortingParams: [
    {
      filterName: 'name',
      displayName: 'Name',
      selected: true
    },
    {
      filterName: 'unit',
      displayName: 'Unit',
      selected: true
    },
    {
      filterName: 'emission.gwp.a1a3',
      displayName: 'Emission',
      selected: true
    },
  ]
}