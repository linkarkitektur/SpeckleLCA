import type { Group } from "@/models/filters";

export function createNestedObject(data: Group[]): NestedGroup {
  const nestedObject: NestedGroup = { name: 'root', objects: 0, children: [] };

  data.forEach(entry => {
    let currentLevel = nestedObject;

    entry.path.forEach(level => {
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
 * Returns a text without any dots in them and returning the last text
 * Used for speckleTypes and such to clean them up
 * @param text that should be cleaned 
 * @returns cleaned text with last segement included
 */
export function getTextAfterLastDot(text: string): string {
  if (typeof text !== 'string') {
    return text
  }

  const lastIndex = text.lastIndexOf('.')
  if (lastIndex !== -1) {
      return text.substring(lastIndex + 1)
  }
  return text
}

/**
 * Interface for tree created for grouped up object list
 */
export interface NestedGroup {
  name: string;
  objects: number;
  children: NestedGroup[];
}
