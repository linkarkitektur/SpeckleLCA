import { defineStore } from "pinia";

export const useProjectStore = defineStore({
  id: "projectStore",
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

    updateProject(project: Project) {
      this.currProject = project;
    },

    addGeometry(geometryObject: GeometryObject) {
      this.currProject?.geometry.push(geometryObject);
    },

    removeGeometry(id: string) {
      const index = this.findGeometryIndexById(id);
      
      if(index === -1) return;
      
      if (index != undefined)
        this.currProject?.geometry.splice(index, 1);
    },

    updateGeometry(payload: GeometryObject, id: string) {
      if (!id || !payload || this.currProject === null) return;

      const index = this.findGeometryIndexById(id);

      if (index !== -1 && index != undefined)
        this.currProject.geometry[index] = payload;
    },

    addResults(result: Results) {
      if(this.currProject?.results != null)
        this.currProject.results.push(result);
      else if(this.currProject != null)
        this.currProject.results = [result];
    },

    updateResults(payload: Results, id: string) {
      if (!id || !payload || this.currProject === undefined) return;

      const index = this.findResultIndexById(id);

      if (index !== -1 && index != undefined && this.currProject?.results != null)
        this.currProject.results[index] = payload;
    },

    findGeometryIndexById(id: string) {
      return this.currProject?.geometry.findIndex((item) => item.id === id);
    },

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