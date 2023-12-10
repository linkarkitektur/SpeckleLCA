import type { Group } from "@/models/filters";

export function createNestedObject(data: Group[]): NestedObject {
  const nestedObject: NestedObject = { name: 'root', objects: 0, children: [] };

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

export interface NestedObject {
  name: string;
  objects: number;
  children: NestedObject[];
}