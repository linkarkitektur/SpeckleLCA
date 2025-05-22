import type { ImpactCategoryKey, LifeCycleModule } from 'lcax'
import type { BuildingCodeItem } from '@/models/buildingCodeModel'
import type {
	MaterialFilterParam,
	MaterialSortingParam
} from '@/models/materialModel'

import { APISource, EnergyType } from '@/models/materialModel'
import { BSAB96 } from '@/models/buildingCodeModel'

/**
 * Settings for external connections such as API keys and configurations
 */
export interface KeySettings {
	materialKeys: MaterialKeys
	githubApiKey: string
	firebaseConfig: FirebaseConfig
	speckleConfig: SpeckleConfig
}

/**
 * Settings for how we do the emission calculations
 */
export interface CalculationSettings {
	includedStages: IncludedStages
	standardImpactCategory: ImpactCategoryKey
	buildingCode: {
		key: string
		data: BuildingCodeItem[]
	}
	// Controls whether B4 is calculated from A1-A3, A4, A5 or from EPD
	replaceB4WithProductionStages: boolean
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
	color: string
	area: number
	threshold: number
	lifespan: number
	emissionPerYear: boolean
	electricityConsumption: number | null // kWh/m²/year
	energyType: EnergyType | null
}

export interface SettingView {
	name: string
	icon: any
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
		stage: LifeCycleModule
	}>
}

/**
 * Default settings for all projects, we could make one for each country but not needed I think
 */
export const standardProjectSettings: ProjectSettings = {
	color: 'grey',
	area: 100,
	threshold: 300,
	lifespan: 50,
	emissionPerYear: false,
	electricityConsumption: null,
	energyType: null
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
		apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
		authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
		projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
		storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
		appId: import.meta.env.VITE_FIREBASE_APP_ID,
		measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
	},
	speckleConfig: {
		serverUrl: import.meta.env.VITE_SPECKLE_SERVER_URL as string,
		id: import.meta.env.VITE_SPECKLE_ID, //"25477842e5",
		secret: import.meta.env.VITE_SPECKLE_SECRET //"c5a683ccc4"
	}
}

export const standardCalculationSettings: CalculationSettings = {
	includedStages: {
		relevantStages: [
			{ included: true, stage: 'a1a3' as LifeCycleModule }, // Manufacturing
			{ included: true, stage: 'a4' as LifeCycleModule }, // Transport
			{ included: true, stage: 'a5' as LifeCycleModule } // Assembly
		]
	},
	standardImpactCategory: 'gwp',
	buildingCode: {
		key: 'BSAB96',
		data: BSAB96
	},
	replaceB4WithProductionStages: false
}

export const standardMaterialSettings: MaterialSettings = {
	APISource: {
		[APISource.Revalu]: true,
		[APISource.Boverket]: true,
		[APISource.ECOPortal]: false,
		[APISource.LCAbyg]: true,
		[APISource.Organisation]: false
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
		}
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
		}
	]
}
