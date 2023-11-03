/**
 * @file This file defines the `useSpeckleStore` store, which is used to manage the state of the Speckle integration in the application.
 * It exports a Pinia store object that contains the state, actions, and getters for the Speckle integration.
 * The store is used to manage the user's authentication status, project details, versions, models, and versions of models.
 * The store also provides methods to interact with the Speckle API, such as logging in, logging out, exchanging access codes, and getting user data.
 * The store is defined using the `defineStore` function from the Pinia library.
 * @see https://pinia.esm.dev/api/define-store.html
 */

import { defineStore } from "pinia";
import type { Version, ProjectDetails, VersionId, ModelsAndVersions, User, ServerInfo, ProjectId } from "@/models/speckle/Speckle";
import { getProjectVersions, goToSpeckleAuthPage, speckleLogOut, exchangeAccessCode, getUserData, getProjectsData } from "@/utils/SpeckleUtils";
import router from "@/router";

/**
 * The `useSpeckleStore` store object that contains the state, actions, and getters for the Speckle integration.
 * The store is defined using the `defineStore` function from the Pinia library.
 * @see https://pinia.esm.dev/api/define-store.html
 */
export const useSpeckleStore = defineStore({
  id: "speckleStore",
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
       * An array of all the projects available to the application on the server
       */
      allProjects: null as ProjectId[] | null,

      /**
       * An array of all the versions of the project.
       * @type {VersionId[] | null}
       */
      allVersions: null as VersionId[] | null,

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
    }
  },
  actions: {
    /**
     * The `login` action redirects the user to the Speckle authentication page.
     * @returns {void}
     */
    async login() {
      goToSpeckleAuthPage();
    },

    /**
     * The `logout` action logs the user out of the Speckle integration and redirects them to the login page.
     * @returns {void}
     */
    async logout() {
      this.$patch((state) => {
        state.user = null;
        state.serverInfo = null;
        state.projectDetails = null;
        state.selectedVersion = null;
      });
      // Wipe the tokens
      speckleLogOut();
      router.push('/login');
    },

    /**
     * The `exchangeAccessCodes` action exchanges the access code for an access token and refresh token.
     * @param {string} accessCode - The access code to exchange for tokens.
     * @returns {Promise<void>}
     */
    async exchangeAccessCodes(accessCode: string) {
      // Here, you can save the tokens to the store if necessary.
      return exchangeAccessCode(accessCode);
    },

    /**
     * The `updateUser` action gets and updates the user data for the currently authenticated user.
     * @returns {Promise<void>}
     */
    async updateUser() {
      try {
        const json = await getUserData();
        const data = json.data;

        this.$patch((state) => {
          state.user = data.user;
          state.serverInfo = data.serverInfo;
        });
      } catch (err) {
        console.error(err);
      }
    },

    /**
     * The `updateUser` action gets and updates the projectlist available for the application
     * @returns {Promise<void>}
     */
    async updateProjects() {
      try {
        const json = await getProjectsData();
        const data = json.data;

        this.$patch((state) => {
          //Clear projects before we update so we dont always increase the list
          state.allProjects = [];
          data.streams.items.forEach((el: { name: string; id: string; }) => {
            let proj: ProjectId = {
              name: el.name,
              id: el.id,
            };
            state.allProjects?.push(proj);
          });
        });
      } catch (err) {
        console.error(err);
      }
    },

    /**
     * The `setProjectDetails` action sets the project details for the currently selected project.
     * @param {ProjectDetails} project - The project details to set.
     * @returns {void}
     */
    setProjectDetails(project: ProjectDetails) {
      this.projectDetails = project;
    },

    /**
     * The `setVersion` action sets the currently selected version of the project.
     * @param {Version} version - The version to set.
     * @returns {void}
     */
    setVersion(version: Version) {
      this.selectedVersion = version;
    },

    /**
     * The `setAllVersions` action sets the array of all versions of the project.
     * @param {VersionId[]} allVer - The array of all versions to set.
     * @returns {void}
     */
    setAllVersions(allVer: VersionId[]) {
      this.allVersions = allVer;
    },

    /**
     * The `setAllModels` action sets the array of all models in the project.
     * @param {string[]} allModels - The array of all models to set.
     * @returns {void}
     */
    setAllModels(allModels: string[]) {
      this.allModels = allModels;
    },

    /**
     * The `setModelsAndVersions` action sets the object that maps each model to an array of its versions.
     * @param {ModelsAndVersions} modelVer - The object to set.
     * @returns {void}
     */
    setModelsAndVersions(modelVer: ModelsAndVersions) {
      this.modelsAndVersions = modelVer;
    },

    /**
     * The `getStreamAction` action gets the project versions for the specified project.
     * @param {string} projectId - The ID of the project to get versions for.
     * @param {number} limit - The maximum number of versions to get.
     * @param {Date | null} cursor - The cursor to use for pagination.
     * @returns {Promise<void>}
     */
    async getStreamAction(projectId: string, limit: number, cursor: Date | null) {
      try {
        const response = await getProjectVersions(projectId, limit, cursor);
        const projDet: ProjectDetails = await response.json().data;
        let allVers: VersionId[];
        allVers = (projDet.versions?.items || []).map((el, key) => {
          return { id: el.id, name: el?.message ?? "Version " + key };
        });

        let allModels: string[];
        let modelVers: ModelsAndVersions = {};

        if (
          projDet.versions?.items &&
          projDet.versions?.items.length > 0) {
          projDet.versions?.items?.forEach((version) => {
            const { modelName } = version;
            if (!modelVers[modelName]) {
              modelVers[modelName] = [];
            }
            modelVers[modelName].push(version);
          });

          allModels = projDet.versions?.items?.map(function (version) {
            return version?.modelName;
          });
        }

        // Use this.$patch instead of commit to update state
        this.$patch((state) => {
          state.projectDetails = projDet;
          state.selectedVersion = projDet.versions?.items?.[0];
          state.allVersions = allVers;
          state.allModels = allModels;
          state.modelsAndVersions = modelVers;
        });
      } catch (err) {
        console.error(err);
      }
    },
  },
  getters: {
    /**
     * The `projectDetails` getter returns the project details for the currently selected project.
     * @returns {ProjectDetails | null}
     */
    getProjectDetails: (state) => state.projectDetails,

    /**
     * The `selectedVersion` getter returns the currently selected version of the project.
     * @returns {Version | null}
     */
    getSelectedVersion: (state) => state.selectedVersion,

    /**
     * The `allVersions` getter returns an array of all the versions of the project.
     * @returns {VersionId[] | null}
     */
    getAllVersions: (state) => state.allVersions,

    /**
     * The `allModels` getter returns an array of all the models in the project.
     * @returns {string[] | null}
     */
    getAllModels: (state) => state.allModels,

    /**
     * The `modelsAndVersions` getter returns an object that maps each model to an array of its versions.
     * @returns {ModelsAndVersions | null}
     */
    getModelsAndVersions: (state) => state.modelsAndVersions,

    /**
     * The `isAuthenticated` getter returns a boolean indicating whether the user is authenticated.
     * @returns {boolean}
     */
    isAuthenticated: (state) => state.user !== null,

    /**
     * The `getUserInfo` getter returns the user object for the currently authenticated user.
     * @returns {User | null}
     */
    getUserInfo: (state) => state.user,

    /**
     * The `getProjectsInfo` getter returns all projects available to the applications
     * @returns {ProjectId[] | null}
     */
    getProjectsInfo: (state) => state.allProjects,
  },
})
