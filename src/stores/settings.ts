import { defineStore } from 'pinia'

import { 
	standardAppSettings, 
	standardCalculationSettings, 
	standardKeySettings,
	standardMaterialSettings,
	standardProjectSettings,
} from '@/models/settings'
import type { 
	AppSettings,
	CalculationSettings,
	KeySettings,
	MaterialSettings,
	ProjectSettings
 } from '@/models/settings'

export const useSettingsStore = defineStore({
	id: 'settingsStore',
	state: () => {
		return {
			projectSettings: standardProjectSettings as ProjectSettings, 
			appSettings: standardAppSettings as AppSettings, 
			calculationSettings: standardCalculationSettings as CalculationSettings,
			keySettings: standardKeySettings as KeySettings,
			materialSettings: standardMaterialSettings as MaterialSettings
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
		 * Updates projectsettings directly
		 * @param projectSettings 
		 */
		updateProjectSettings(projectSettings: ProjectSettings) {
			this.projectSettings = projectSettings
		},

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
		updateEPDSource(APISource: MaterialSettings['APISource']) {
			this.materialSettings.APISource = APISource
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
	}
})