/**
 * @file This file defines the `useSpeckleStore` store, which is used to manage the state of the Speckle integration in the application.
 * It exports a Pinia store object that contains the state, actions, and getters for the Speckle integration.
 * The store is used to manage the user's authentication status, project details, versions, models, and versions of models.
 * The store also provides methods to interact with the Speckle API, such as logging in, logging out, exchanging access codes, and getting user data.
 * The store is defined using the `defineStore` function from the Pinia library.
 * @see https://pinia.esm.dev/api/define-store.html
 */

import type {
  ModelsAndVersions,
  ObjectParameter,
  ProjectDetails,
  ProjectId,
  ServerInfo,
  User,
  Version,
} from '@/models/speckle'
import router from '@/router'
import { logMessageToSentry } from '@/utils/monitoring'
import {
  exchangeAccessCode,
  getObjectParameters,
  getProjectVersions,
  getProjectsData,
  getUserData,
  navigateToAuthPage,
  speckleLogOut,
} from '@/utils/speckleUtils'; // TODO Is this the right import in the wider structure?
import { Viewer } from '@speckle/viewer'
import { defineStore } from 'pinia'

/**
 * The `useSpeckleStore` is a store that manages the state and actions related to the Speckle integration.
 * It provides access to project details, versions, models, user information, and server information.
 * The store also includes actions for logging in, logging out, updating user data, updating projects,
 * updating project versions, getting objects for a project, and managing custom parameters.
 */
export const useSpeckleStore = defineStore({
  id: 'speckleStore',
  state: () => {
    return {
      /**
       * The project details for the currently selected project.
       * @type {ProjectDetails | null}
       */
      projectDetails: null as ProjectDetails | null,

      /**
       * The currently selected version of the project.
       * @type {Version | null}
       */
      selectedVersion: null as Version | null,

      /**
       * The currently loaded project in the speckle store
       */
      selectedProject: null as ProjectId | null,

      /**
       * An array of all the projects available to the application on the server
       */
      allProjects: null as ProjectId[] | null,

      /**
       * An array of all the versions of the project.
       * @type {Version[] | null}
       */
      allVersions: null as Version[] | null,

      /**
       * An array of all the models in the project.
       * @type {string[] | null}
       */
      allModels: null as string[] | null,

      /**
       * An object that maps each model to an array of its versions.
       * @type {ModelsAndVersions | null}
       */
      modelsAndVersions: null as ModelsAndVersions | null,

      /**
       * The user object for the currently authenticated user.
       * @type {User | null}
       */
      user: null as User | null,

      /**
       * The server info object for the Speckle server.
       * @type {ServerInfo | null}
       */
      serverInfo: null as ServerInfo | null,

      /**
       * Array of specific parameters that are included in the project that the application
       * will get information for the objects from
       * @type {ObjectParameter[] | null}
       */
      customParameters: null as ObjectParameter[] | null,

      viewer: null as Viewer | null,
    }
  },
  actions: {
    /**
     * The `login` action logs the user into the Speckle integration and redirects them to the authorisation page.
     * @returns {Promise<void>}
     */
    async login(): Promise<void> {
      navigateToAuthPage()
    },

    /**
     * Logs out the user and clears the state and tokens.
     * @returns A promise that resolves when the logout process is complete.
     */
    async logout(): Promise<void> {
      this.$patch((state) => {
        state.user = null
        state.serverInfo = null
        state.projectDetails = null
        state.selectedVersion = null
      })
      // Wipe the tokens
      speckleLogOut()
      router.push('/login')
    },

    /**
     * Exchanges the provided access code for tokens and saves them to the store if necessary.
     * @param accessCode The access code to exchange.
     * @returns A promise that resolves when the access code is exchanged and tokens are saved.
     */
    async exchangeAccessCodes(accessCode: string): Promise<void> {
      // Here, you can save the tokens to the store if necessary.
      return exchangeAccessCode(accessCode)
    },

    /**
     * Updates the user data by fetching it from the server.
     * @returns A Promise that resolves to void.
     */
    async updateUser(): Promise<void> {
      try {
        const json = await getUserData()
        const data = json.data

        this.$patch((state) => {
          state.user = data.user
          state.serverInfo = data.serverInfo
        })
      } catch (err: any) {
        logMessageToSentry(err as string, 'info')
      }
    },

    /**
     * Updates the projects by fetching the latest data from the server.
     * Clears the existing projects list and populates it with the updated data.
     * @returns A promise that resolves when the projects are successfully updated.
     */
    async updateProjects(): Promise<void> {
      try {
        const json = await getProjectsData()
        const data = json.data

        // Ensure enpepotemce criteria is met.
        this.$patch((state) => {
          state.allProjects = []
          data.streams.items.forEach(
            (el: { name: string; id: string; updatedAt: Date }) => {
              const proj: ProjectId = {
                name: el.name,
                id: el.id,
                updatedAt: el.updatedAt,
              }
              state.allProjects?.push(proj)
            }
          )
        })
      } catch (err: any) {
        logMessageToSentry(err as string, 'info')
      }
    },

    /**
     * The `updateProjectVersions` action updates the project versions for the specified project.
     * @param {string} projectId - The ID of the project to get versions for.
     * @param {number} limit - The maximum number of versions to get.
     * @param {Date | null} cursor - The cursor to use for pagination.
     * @returns {Promise<void>}
     */
    async updateProjectVersions(
      projectId: string,
      limit: number,
      cursor: Date | null
    ): Promise<void> {
      try {
        const response = await getProjectVersions(projectId, limit, cursor)
        const data = response.data
        const projDet: ProjectDetails = data

        const selectedProj: ProjectId = {
          name: projDet.stream.name,
          id: projDet.stream.id,
          updatedAt: projDet.stream.updatedAt,
        }

        let allModels: string[]
        const allVers: Version[] = []
        const modelVers: ModelsAndVersions = {}

        // Get versions for this project, and store them in an array.
        if (
          projDet.stream.commits?.items &&
          projDet.stream.commits?.items.length > 0
        ) {
          projDet.stream.commits?.items?.forEach((version) => {
            allVers.push(version)

            const { branchName } = version
            if (!modelVers[branchName]) {
              modelVers[branchName] = []
            }
            modelVers[branchName].push(version)
          })

          // Get the list of all models if available, returning the branch name.
          allModels = projDet.stream.commits?.items?.map(function (version) {
            return version?.branchName
          })
        }

        // Use this.$patch instead of commit to update state
        this.$patch((state) => {
          state.selectedProject = selectedProj
          state.projectDetails = projDet
          state.allVersions = allVers
          state.allModels = allModels
          state.modelsAndVersions = modelVers
        })
      } catch (err: any) {
        logMessageToSentry(err as string, 'info')
      }
    },

    /**
     * Get all objects for the currently loaded project and the selected version
     * @param projectId projectId to get objects for
     * @returns
     */
    async getObjects(): Promise<any> {
      try {
        if (this.selectedProject && this.selectedVersion) {
          const objs = await getObjectParameters(
            this.selectedProject.id,
            this.selectedVersion.referencedObject,
            this.selectedVersion.sourceApplication
          )
          return objs
        } else {
          return null
        }
      } catch (err: any) {
        logMessageToSentry(err as string, 'info')
      }
    },

    /**
     * The `setProjectDetails` action sets the project details for the currently selected project.
     * @param {ProjectDetails} project - The project details to set.
     * @returns {void}
     */
    setProjectDetails(project: ProjectDetails): void {
      this.projectDetails = project
    },

    /**
     * The `setAllVersions` action sets the array of all versions of the project.
     * @param {Version[]} allVer - The array of all versions to set.
     * @returns {void}
     */
    setAllVersions(allVer: Version[]): void {
      this.allVersions = allVer
    },

    /**
     * The `setAllModels` action sets the array of all models in the project.
     * @param {string[]} allModels - The array of all models to set.
     * @returns {void}
     */
    setAllModels(allModels: string[]): void {
      this.allModels = allModels
    },

    /**
     * The `setModelsAndVersions` action sets the object that maps each model to an array of its versions.
     * @param {ModelsAndVersions} modelVer - The object to set.
     * @returns {void}
     */
    setModelsAndVersions(modelVer: ModelsAndVersions): void {
      this.modelsAndVersions = modelVer
    },

    /**
     * Sets the currently selected version in the store
     * @param version
     */
    setSelectedVersion(version: Version) {
      this.selectedVersion = version
    },


    /**
     * Sets the viewer instance.
     * @param viewerInstance The viewer instance to set.
     */
    setViewerInstance(viewerInstance: Viewer) {
      this.viewer = viewerInstance
    },

    /**
     * Add new parameter to list of parameters to include in fetching of speckle objects
     * @param parameter
     */
    addCustomParameter(parameter: ObjectParameter) {
      if (!this.parameterNameCheck(parameter.name)) {
        if (this.customParameters) this.customParameters.push(parameter)
        else this.customParameters = [parameter]
      } else {
        console.warn('Duplicate name found. Object not added.')
      }
    },

    /**
     * Checks a if a name already exists within objects in parameters
     * @param newName name to check
     * @returns true if its already in parameters, false if not
     */
    parameterNameCheck(newName: string): boolean {
      if (this.customParameters)
        return this.customParameters.some((obj) => obj.name === newName)
      else return false
    },

    /**
     * Removes a customParameter on its name
     *  @param name name to remove, will never be duplicate since we check
     */
    removeCustomParameter(name: string) {
      if (this.customParameters)
        this.customParameters = this.customParameters?.filter(
          (item) => item.name !== name
        )
    },
  },

  getters: {
    /**
     * The `projectDetails` getter returns the project details for the currently selected project.
     * @returns {ProjectDetails | null}
     */
    getProjectDetails: (state): ProjectDetails | null => state.projectDetails,

    /**
     * The `selectedVersion` getter returns the currently selected version of the project.
     * @returns {Version | null}
     */
    getSelectedVersion: (state): Version | null => state.selectedVersion,

    /**
     * The `allVersions` getter returns an array of all the versions of the project.
     * @returns {Version[] | null}
     */
    getAllVersions: (state): Version[] | null => state.allVersions,

    /**
     * The `allModels` getter returns an array of all the models in the project.
     * @returns {string[] | null}
     */
    getAllModels: (state): string[] | null => state.allModels,

    /**
     * The `modelsAndVersions` getter returns an object that maps each model to an array of its versions.
     * @returns {ModelsAndVersions | null}
     */
    getModelsAndVersions: (state): ModelsAndVersions | null =>
      state.modelsAndVersions,

    /**
     * The `isAuthenticated` getter returns a boolean indicating whether the user is authenticated.
     * @returns {boolean}
     */
    isAuthenticated: (state): boolean => state.user !== null,

    /**
     * The `getUserInfo` getter returns the user object for the currently authenticated user.
     * @returns {User | null}
     */
    getUserInfo: (state): User | null => state.user,

    /**
     * The `getProjectsInfo` getter returns all projects available to the applications
     * @returns {ProjectId[] | null}
     */
    getProjectsInfo: (state): ProjectId[] | null => state.allProjects,

    /**
     * Returns a list of all customParameters for this stream
     * @returns {ObjectParameter[] | null}
     */
    getCustomParameters: (state): ObjectParameter[] | null =>
      state.customParameters,

    /**
    * The `getViewerInstance` getter returns the viewer instance.
    * @returns {Viewer | null}
    */
    getViewerInstance: (state): Viewer => state.viewer as Viewer,
  },
})
