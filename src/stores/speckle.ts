import { defineStore } from "pinia";
import type { Version, ProjectDetails } from "@/models/speckle/Speckle";
import * as speckleUtils from "@/utils/speckleUtils";

const anySpeckleUtils: any = speckleUtils;

export const useSpeckleStore = defineStore({
    id: "speckleStore",
    state: () => {
        return {
            projectDetails: null as ProjectDetails | null,
            selectedVersion: null as Version | null,
            allVersions: null as {
                id: string, 
                name: string
            }[] | null,
            allModels: null as string[] | null,
            modelsAndVersions: null as  { [modelName: string]: Version[] } | null,
        }
    },
    actions: {
        // Define your actions here
        async getStreamAction(streamId: string, limit: number, cursor: Date | null) {
          try {
            const projDet: ProjectDetails = await anySpeckleUtils.getProjectVersions(streamId, limit, cursor).data;
            const allVers = projDet.versions?.items?.map((el, key) => {
              return { id: el.id, name: el?.message ?? "Version " + key };
            });
            
            let allModels: string[];
            let modelVers: { [modelName: string]: Version[] } = {};

            if (
              projDet.versions?.items &&
              projDet.versions?.items.length > 0)
            {
              projDet.versions?.items?.forEach((version) => {
                const { modelName } = version;
                if (!modelVers[modelName]) {
                  modelVers[modelName] = [];
                }
                modelVers[modelName].push(version);
              });
              
              allModels = projDet.versions?.items?.map(function(version) {
                return version?.modelName;
              });
            }
    
            // Use this.$patch instead of commit to update state
            this.$patch((state) => {
              state.projectDetails = projDet;
              state.selectedVersion = projDet.versions.items?.[0];
              state.allVersions = allVers;
              state.allModels = allModels;
              state.modelsAndVersions = modelVers;
            });
          } catch (err) {
            console.error(err);
          }
        },
      },
})