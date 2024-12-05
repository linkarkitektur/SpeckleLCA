import { defineStore } from 'pinia'

import { 
	standardAppSettings, 
	standardCalculationSettings, 
	standardKeySettings,
	standardMaterialSettings,
} from '@/models/settings'
import type { 
	AppSettings,
	CalculationSettings,
	KeySettings,
	MaterialSettings,
 } from '@/models/settings'

export const useSettingsStore = defineStore({
	id: 'settingsStore',
	state: () => {
		return {
			appSettings: standardAppSettings as AppSettings, // Application settings
			calculationSettings: standardCalculationSettings as CalculationSettings, // Calculation settings
			keySettings: standardKeySettings as KeySettings, // Key settings
			materialSettings: standardMaterialSettings as MaterialSettings // Material settings
		}
	},
	// Save the store to local storage so we dont have to create new settings every time
	persist: {
    storage: localStorage,
		afterHydrate: (ctx) => {
      console.log(`just hydrated '${ctx.store.$id}'`)
    }
	},
	actions: {
		
		/**
		 * Updates the firebase configuration in the app settings.
		 * @param firebaseConfig The new firebase configuration.
		 */
		updateFirebaseSettings(firebaseConfig: KeySettings['firebaseConfig']) {
			this.keySettings.firebaseConfig = firebaseConfig
		},

		/**
		 * Updates the speckle configuration in the app settings.
		 * @param speckleConfig The new speckle configuration.
		 */
		updateSpeckleSettings(speckleConfig: KeySettings['speckleConfig']) {
			this.keySettings.speckleConfig = speckleConfig
		},

		/**
		 * Updates the material keys in the app settings.
		 * @param materialKeys The new material keys.
		 */
		updateMaterialKeys(materialKeys: KeySettings['materialKeys']) {
			this.keySettings.materialKeys = materialKeys
		},

		/**
		 * Updates the EPD source in the app settings.
		 * @param epdSource The new EPD source.
		 */
		updateEPDSource(epdSource: MaterialSettings['epdSource']) {
			this.materialSettings.epdSource = epdSource
		},

		
		updateGithubApiKey(githubApiKey: KeySettings['githubApiKey']) {
			this.keySettings.githubApiKey = githubApiKey
		},

		/**
		 * Updates the included stages in the app settings.
		 * @param includedStages The new included stages.
		 */
		updateIncludedStages(includedStages: CalculationSettings['includedStages']) {
			this.calculationSettings.includedStages = includedStages
		},

		/**
		 * Updates the standard impact category in the app settings.
		 * @param standardImpactCategory The new standard impact category.
		 */
		updateStandardImpactCategory(standardImpactCategory: CalculationSettings['standardImpactCategory']) {
			this.calculationSettings.standardImpactCategory = standardImpactCategory
		},

		/**
		 * Updates the building code in the app settings.
		 * @param buildingCode The new building code.
		 */
		updateBuildingCode(buildingCode: CalculationSettings['buildingCode']) {
			this.calculationSettings.buildingCode = buildingCode
		},

		updateArea(area: AppSettings['area']) {
			this.appSettings.area = area
		},
	}
})