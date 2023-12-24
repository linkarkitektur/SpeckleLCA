import type { Group } from "@/models/filters";

/**
 * Creates a nested object from an array of Group objects.
 * Each Group object represents a path, and the function creates a nested structure based on the paths.
 * The resulting nested object contains the total number of objects at each level of the hierarchy.
 *
 * @param data An array of Group objects representing the paths.
 * @returns A NestedGroup object representing the nested structure.
 */
export function createNestedObject(data: Group[]): NestedGroup {
  const nestedObject: NestedGroup = {
    name: 'root',
    objects: 0,
    children: []
  };

  data.forEach(entry => {
    const pathArray = entry.path.split('/');
    let currentLevel = nestedObject;

    pathArray.forEach(level => {
      let existingLevel = currentLevel.children.find(child => child.name === level);


      if (!existingLevel) {
        existingLevel = { name: level, objects: 0, children: [] };
        currentLevel.children.push(existingLevel);
      }

      existingLevel.objects += entry.elements.length;
      currentLevel = existingLevel;
    });
  });

  return nestedObject;
}

/**
 * Represents nested groups with names & number of objects.
 */
export interface NestedGroup {
  name: string;
  objects: number;
  children: NestedGroup[];
}
