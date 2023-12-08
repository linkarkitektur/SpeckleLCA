import { defineStore } from "pinia";
import type { GeometryObject } from "@/models/geometryObject";
import type { Project, Results } from "@/models/project";
import type { Group } from "@/models/filters";
import type { SubChild } from "@/components/Sidebar/SubGroup.vue";
import { createNestedObject } from '@/utils/projectUtils'

/**
 * Defines the project store, which contains the current project and its geometry and results.
 */
export const useProjectStore = defineStore({
  id: "projectStore",
  state: () => {
    return {
      currProject: null as Project | null, // The current project being worked on
      projectGroups: null as Group[] | null, // Groups that have been created for geometry objects
    }
  },

  actions: {
    /**
     * Creates a new project.
     * @param project The project to create.
     */
    createNewProject(project: Project) {
      this.currProject = project;
    },

    /**
     * Creates or updated the current groups set on the project
     * @param groups 
     */
    updateProjectGroups(groups: Group[]) {
      this.projectGroups = groups;
    },

    /**
     * Updates the current project.
     * @param project The project to update.
     */
    updateProject(project: Project) {
      this.currProject = project;
    },

    /**
     * Adds a geometry object to the current project.
     * @param geometryObject The geometry object to add.
     */
    addGeometry(geometryObject: GeometryObject) {
      this.currProject?.geometry.push(geometryObject);
    },

    /**
     * Removes a geometry object from the current project.
     * @param id The ID of the geometry object to remove.
     */
    removeGeometry(id: string) {
      const index = this.findGeometryIndexById(id);

      if (index === -1) return;

      if (index != undefined)
        this.currProject?.geometry.splice(index, 1);
    },

    /**
     * Updates a geometry object in the current project.
     * @param payload The updated geometry object.
     * @param id The ID of the geometry object to update.
     */
    updateGeometry(payload: GeometryObject, id: string) {
      if (!id || !payload || this.currProject === null) return;

      const index = this.findGeometryIndexById(id);

      if (index !== -1 && index != undefined)
        this.currProject.geometry[index] = payload;
    },

    /**
     * Adds results to the current project.
     * @param result The results to add.
     */
    addResults(result: Results) {
      if (this.currProject?.results != null)
        this.currProject.results.push(result);
      else if (this.currProject != null)
        this.currProject.results = [result];
    },

    /**
     * Updates results in the current project.
     * @param payload The updated results.
     * @param id The ID of the results to update.
     */
    updateResults(payload: Results, id: string) {
      if (!id || !payload || this.currProject === undefined) return;

      const index = this.findResultIndexById(id);

      if (index !== -1 && index != undefined && this.currProject?.results != null)
        this.currProject.results[index] = payload;
    },

    /**
     * Returns tree structure of current filter groupings in the project
     */
    getGroupTree() {
      console.log("Getting Group tree");
      const testGroups: Group[] = [
        {
          id: "testId1",
          name: "testName1",
          path: "test1/test1",
          elements: [{name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}, {name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}],
        },
        {
          id: "testId2",
          name: "testName2",
          path: "test1/test2",
          elements: [{name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}, {name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}],
        },
        {
          id: "testId3",
          name: "testName3",
          path: "test2/test1",
          elements: [{name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}, {name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}],
        },
        {
          id: "testId4",
          name: "testName4",
          path: "test2/test2",
          elements: [{name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}, {name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}],
        },
        {
          id: "testId5",
          name: "testName5",
          path: "test3/test1",
          elements: [{name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}, {name: "test", id: "test", quantity: {M: 0, M2: 0, M3: 0, KG: 0, TONES: 0, PCS: 0, L: 0, M2R1: 0, UNKNOWN: 0}}],
        },
      ];

      this.projectGroups = testGroups;

      if (this.projectGroups) {
        const data = this.projectGroups;
      
        // Creating the nested object
        const nestedObject = createNestedObject(testGroups);
        
        console.log(JSON.stringify(nestedObject, null, 2));

        return nestedObject;
      } else {
        console.log("No groups found to create tree structure in current project");
      }
    },

    /**
     * Finds the index of a geometry object in the current project by its ID.
     * @param id The ID of the geometry object to find.
     * @returns The index of the geometry object, or -1 if not found.
     */
    findGeometryIndexById(id: string) {
      return this.currProject?.geometry.findIndex((item) => item.id === id);
    },

    /**
     * Finds the index of results in the current project by its ID.
     * @param id The ID of the results to find.
     * @returns The index of the results, or -1 if not found.
     */
    findResultIndexById(id: string) {
      return this.currProject?.geometry.findIndex((item) => item.id === id);
    },


  },
});

export const useMaterialStore = defineStore({
  id: "materialStore",
  state: () => {
    return {
      currProject: null as Project | null,
    }
  },

  actions: {
    createNewProject(project: Project) {
      this.currProject = project;
    },
  }
});

/**
 * Navigation store that is used by the navigation bar in the application view
 */
export const useNavigationStore = defineStore({
  id: 'navigationStore',
  state: () => {
    return {
      activePage: "Projects" as string, // The current page
      slideoverOpen: true, 
    }
  },
  actions: {
    /**
     * Set the application that is being used in the application view
     * @param page page that is currently active in the application view
     */
    setActivePage(page: string) {
      this.activePage = page;
    },
    
    toggleSlideover() {
      this.slideoverOpen = !this.slideoverOpen;
    },

    getSlideoverOpenTest() {
      return this.slideoverOpen;
    }
  },
  getters: {
    /**
     * Returns the current page for the application view
     * @returns currentPage
     */
    getActivePage: (state) => state.activePage,
    
    getSlideoverOpen: (state) => state.slideoverOpen,
  },
});

interface NestedObject {
  name: string;
  objects: number;
  children: { [key: string]: NestedObject };
}