import { defineStore } from 'pinia'

/**
 * Navigation store that is used by the navigation bar in the application view
 */
/**
 * Defines a store for managing navigation state.
 */
export const useNavigationStore = defineStore({
	id: 'navigationStore',
	state: () => {
		return {
			activePage: 'Projects' as string, // The current page
			activeColor: '#e4ecec' as string,
			slideoverOpen: false,
			editName: null as string | null,
			groupModalOpen: false,
			mappingModalOpen: false,
			loading: false,
			groupColorMode: false,
			detailBarShow: true,
			sideBarShow: true,
			saveModalOpen: false,
			assemblyModalOpen: false,
			assemblyTableShow: false,
			settingsModalOpen: false,

		}
	},
	actions: {
		/**
		 * Set the application that is being used in the application view
		 * @param page page that is currently active in the application view
		 */
		setActivePage(page: string) {
			this.activePage = page
		},

		/**
		 * Sets the active color
		 * @param color 
		 */
		setActiveColor(color: string) {
			this.activeColor = color
		},

		/**
		 * Toggle slideover where its present on the app
		 */
		toggleSlideover() {
			this.slideoverOpen = !this.slideoverOpen
		},

		/**
		 * Toggle loading state on the app
		 */
		toggleLoading() {
			this.loading = !this.loading
		},

		/**
		 * Toggle new group modal interface
		 */
		toggleGroupModal() {
			this.groupModalOpen = !this.groupModalOpen
		},

		/**
		 * Toggle mapping modal interface
		 */
		toggleMappingModal() {
			this.mappingModalOpen = !this.mappingModalOpen
		},

		toggleSettingsModal() {
			this.settingsModalOpen = !this.settingsModalOpen
		},

		/**
		 * Toggle edit name for groups
		 */
		toggleEditName(id: string) {
			if (this.editName === id) {
				this.editName = null
			} else {
				this.editName = id
			}
		},

		/**
		 * Toggle color mode for groups
		 */
		toggleColorMode() {
			this.groupColorMode = !this.groupColorMode
		},

		/**
		 * Toggle sidebar on the app
		 */
		toggleSideBar() {
			this.sideBarShow = !this.sideBarShow
		},

		/**
		 * Toggle save modal on the app
		 */
		toggleSaveModal() {
			this.saveModalOpen = !this.saveModalOpen
		},

		/**
		 * Toggle assembly modal on the app
		 */
		toggleAssemblyModal() {
			this.assemblyModalOpen = !this.assemblyModalOpen
		},

		/**
		 * Toggle assembly table on the app
		 */
		toggleAssemblyTable() {
			this.assemblyTableShow = !this.assemblyTableShow
		}

	},
	getters: {
		getActivePage: (state) => state.activePage,
		getSlideoverOpen: (state) => state.slideoverOpen
	}
})