import type { LifeCycleStage } from "lcax"
import type { ExtendedImpactCategoryKey } from '@/models/material'
import type { BuildingCodeItem } from '@/models/buildingCode'
import type { MaterialFilterParam, MaterialSortingParam } from '@/models/material'

import { APISource } from '@/models/material'
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

/**
 * Settings for how we do the emission calculations
 */
export interface CalculationSettings {
  includedStages: IncludedStages
  standardImpactCategory: ExtendedImpactCategoryKey
  buildingCode: {
    key: string,
    data: BuildingCodeItem[],
  }
}

/**
 * Settings for material loading and filtering
 */
export interface MaterialSettings {
  APISource: {
    [key in APISource]: boolean
  }
  includeCollections: boolean
  globalAssemblies: boolean
  filterParams: MaterialFilterParam[]
  sortingParams: MaterialSortingParam[]
}

/**
 * General application settings
 */
export interface AppSettings {
  colorscheme: string
}

/**
 * Settings for specific project
 * This loads from firebase for the project
 */
export interface ProjectSettings {
  area: number
  threshold: number
  lifespan: number
  emissionPerYear: boolean
}


export interface SettingView {
  name: string,
  icon: any,
  current: boolean
}

/**
 * Speckle configuration, to change what server you are using
 */
interface SpeckleConfig {
  serverUrl: string
  id: string
  secret: string
}

/**
 * Configuration for firebase, this is using an auto creation of users to the project
 * TODO: Check if this is the best way or move everything to Speckle
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
 * Default settings for all projects, we could make one for each country but not needed I think
 */
export const standardProjectSettings: ProjectSettings = {
  area: 100,
  threshold: 300,
  lifespan: 50,
  emissionPerYear: false
}

/**
 * Default settings for the application
 */
export const standardAppSettings: AppSettings = {
  colorscheme: 'light',
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
    apiKey: 'AIzaSyB7JP_Nx3PpMBUjnCcXdoYDxAMAHwx43fU',
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
  APISource: {
    [APISource.Revalu]: true,
    [APISource.Boverket]: true,
    [APISource.ECOPortal]: false,
    [APISource.LCAbyg]: true,
    [APISource.Organisation]: false,
  },
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