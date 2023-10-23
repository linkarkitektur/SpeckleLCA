import { defineStore } from "pinia";
import type { GeometryObject } from "@/models/GeometryObject";
import type { Project, Results } from "@/models/Project";

/**
 * Defines the project store, which contains the current project and its geometry and results.
 */
export const useProjectStore = defineStore({
  id: "projectStore",
  state: () =>
    {
      return {
        currProject: null as Project | null, // The current project being worked on
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
      
      if(index === -1) return;
      
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
      if(this.currProject?.results != null)
        this.currProject.results.push(result);
      else if(this.currProject != null)
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
  state: () =>
    {
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