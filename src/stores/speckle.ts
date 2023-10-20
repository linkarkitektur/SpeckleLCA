import { defineStore } from "pinia";
import type { Version, ProjectDetails, VersionId, ModelsAndVersions, User, ServerInfo } from "@/models/speckle/Speckle";
import { getProjectVersions, goToSpeckleAuthPage, speckleLogOut, exchangeAccessCode, getUserData } from "@/utils/speckleUtils";
import router from "@/router";
export const useSpeckleStore = defineStore({
  id: "speckleStore",
  state: () => {
    return {
      projectDetails: null as ProjectDetails | null,
      selectedVersion: null as Version | null,
      allVersions: null as VersionId[] | null,
      allModels: null as string[] | null,
      modelsAndVersions: null as ModelsAndVersions | null,
      user: null as User | null,
      serverInfo: null as ServerInfo | null,
    }
  },
  actions: {
    // Define your actions here
    async login() {
      goToSpeckleAuthPage();
    },

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

    async exchangeAccessCodes(accessCode: string) {
      // Here, you can save the tokens to the store if necessary.
      return exchangeAccessCode(accessCode);
    },

    async getUser() {
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

    setProjectDetails(project: ProjectDetails) {
      this.projectDetails = project;
    },

    setVersion(version: Version) {
      this.selectedVersion = version;
    },

    setAllVersions(allVer: VersionId[]) {
      this.allVersions = allVer;
    },

    setAllModels(allModels: string[]) {
      this.allModels = allModels;
    },

    setModelsAndVersions(modelVer: ModelsAndVersions) {
      this.modelsAndVersions = modelVer;
    },

    async getStreamAction(streamId: string, limit: number, cursor: Date | null) {
      try {
        const response = await getProjectVersions(streamId, limit, cursor);
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
    projectDetails: (state) => state.projectDetails,
    selectedVersion: (state) => state.selectedVersion,
    allVersions: (state) => state.allVersions,
    allModels: (state) => state.allModels,
    modelsAndVersions: (state) => state.modelsAndVersions,
    isAuthenticated: (state) => state.user !== null,
    getUserInfo: (state) => state.user,
  },
})