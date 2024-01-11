import type { Group } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'

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
    objects: [],
    id: crypto.randomUUID(),
    children: [],
  }

  data.forEach(entry => {
    let currentLevel = nestedObject

    entry.path.forEach(level => {
      let existingLevel = currentLevel.children.find(
        child => child.name === level
      )

      if (!existingLevel) {
        existingLevel = { 
          name: level, 
          objects: [], 
          id: entry.id,
          children: [] 
        }
        currentLevel.children.push(existingLevel)
      }

      existingLevel.objects.push(...entry.elements)
      currentLevel = existingLevel
    })
  })

  return nestedObject
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
  name: string
  objects: GeometryObject[]
  id: string
  children: NestedGroup[]
}
