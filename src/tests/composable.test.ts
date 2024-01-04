import { FilterRegistry, createStandardFilters } from '@/models/filters'
import { useProjectStore } from '@/stores/main'

import type { Group } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'
import type { Project } from '@/models/project'
import type { Unit } from 'lcax'

import crypto from 'node:crypto'
import { expect, test } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { createPinia, setActivePinia } from 'pinia'

import jsonData from './objects/testObjects.json'

// /**
//  * Test equalityfilter and return a filtered list
//  * TODO: Expand the geometry object creation from a dummy json file which we can import
//  */
// test("useEqualityFilter", () => {
//     const exampleRegistry = new FilterRegistry();

//     let geoObject: GeometryObject = jsonData.GeoObjects[0];
//     let geoObject2: GeometryObject = jsonData.GeoObjects[1];

//     expect(geoObject.name).toBe("Wall1");
//     expect(geoObject2.name).toBe("Wall1");

//     let group: Group = {
//         id: crypto.randomUUID(),
//         name: "",
//         path: "",
//         elements: [geoObject, geoObject2],
//     };

//     expect(group.elements.length).toBe(2);

//     createStandardFilters(exampleRegistry);

//     let testGroup: [Group];
//     testGroup = exampleRegistry.callFilter("equalsFilter", [group], "testField", "testValue");

//     expect(testGroup.length).toBe(2);
//     expect(testGroup[0].elements.length).toBe(1);
// })

// test("createProjectStore", () => {
//     // creates a fresh pinia and makes it active
//     // so it's automatically picked up by any useStore() call
//     // without having to pass it to it: `useStore(pinia)`
//     setActivePinia(createPinia())

//     let project: Project = jsonData.ProjectObjects;
//     const projectStore = useProjectStore();
//     projectStore.createNewProject(project);

//     expect(projectStore.$state.currProject?.geometry.length).toBe(2);

//     let geoObject: GeometryObject = jsonData.GeoObjects[2];
//     projectStore.addGeometry(geoObject);

//     expect(projectStore.$state.currProject?.geometry.length).toBe(3);

//     projectStore.removeGeometry(geoObject.id);
//     expect(projectStore.$state.currProject?.geometry.length).toBe(2);
// })
