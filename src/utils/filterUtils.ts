import type { Group } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'

import { useProjectStore } from '@/stores/main'
import { useSpeckleStore } from '@/stores/speckle'
import { getTextAfterLastDot } from '@/utils/stringUtils'

/**
 * Recursively searches an object for the specified key and applies the comparison function to its value.
 * @param obj Object to search
 * @param field The key whose value should be checked
 * @param comparisonFn Function to compare the value of the key
 * @param filterValue The value to compare against
 * @returns boolean
 */
function recursiveValueCheck(
  obj: Record<string, any>,
  field: string,
  comparisonFn: (a: any, b: any) => boolean,
  filterValue: any
): boolean | null {
  let hasField = false

  //Check top level of object
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      // Check if the current key matches the field and apply the comparison function
      if (key === field) {
        hasField = true
        // If the value is an object, check if it has a 'value' property and compare that
        if (typeof value === 'object') { 
          if ('value' in value && value.value != null) {
            if (comparisonFn(value.value, filterValue)) {
              return true
            } else {
              return false
            }
          }
        }
        if (comparisonFn(value, filterValue)) {
          return true
        } else {
          return false
        }
      }
    }
  }

  // If the field was not found in the object we check deeper
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      // If the value is an object, recurse into it
      if (typeof value === 'object') {
        const result = recursiveValueCheck(value, field, comparisonFn, filterValue)
        if (result) {
          return result // Return the value as soon as it's found
        }
      }
    }
  }

  return false
}

/**
 * Recursively searches for the value of the specified field in an object.
 * @param obj Object to search
 * @param field Target field name
 * @returns The value of the field, or null if not found
 */
function recursiveFieldSearch(obj: Record<string, any>, field: string): any | null {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // If the key matches the target field, return its value
      if (key === field) {
        const value = obj[key]
        if (typeof value === 'object')
          if ('value' in value && value.value != null)
            return value.value // If the value is an object, return its value property
        if (typeof value === 'string' || typeof value === 'number') // Check type here so we dont get array or some strange object
          return value 
      }
    }
  }

  // If we didnt find at first level we go deeper
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      // If the value is an object and we didnt match field, recurse into it
      if (typeof value === 'object') {
        const result = recursiveFieldSearch(value, field)
        if (result) {
          return result // Return the value as soon as it's found
        }
      }
    }
  }


  return false
}

/**
 * Generic function to add filters to a registry
 * @param name name of filter
 * @param filterFn function of filter always returns an array of groups
 * @param registry registry to add filters to
 */
function addFilter(
  name: string,
  filterFn: (inGroup: Group[], field: string, value?: any, remove?: boolean) => Group[]
) {
  const projectStore = useProjectStore()
  const registry = projectStore.filterRegistry
  registry.addFilter(name, filterFn)
}

/**
 * generic function to create a filter that uses boolean comparisons on a field with specified value
 * @param comparisonFn function for comparison
 * @param name name of filter
 */
function createComparisonFilter (
  name: string,
  comparisonFn: (a: any, b: any) => boolean,
) {
  const speckleStore = useSpeckleStore()
  addFilter(
    name,
    (inGroup, field, filterValue, remove) => {
      const outGroup: { [key: string]: Group } = {}
      // Go through each group and find the objects that match the comparison function
      for (const grp of inGroup) {
        // Go through each obj in group
        for (const obj of grp.elements) {
          // Check if parameter exists, if not hide object
          if (!obj.parameters && remove) {
            speckleStore.addHiddenObject(obj)
            continue
          }
          // Search specified object recursively for value           
          const matches = recursiveValueCheck(obj.parameters, field, comparisonFn, filterValue);

          if (matches) {
            addObjToGroup(outGroup, obj, true, grp, filterValue)
          } else if (remove) {
            speckleStore.addHiddenObject(obj)
          } else if (!remove) {
            addObjToGroup(outGroup, obj, false, grp, filterValue)
          }
        }
      }
      return Object.values(outGroup)
    }
  )
}

/**
 * Exmaple of how filters are structured
 * Creates standardfilters
 * @param registry 
 */
export function createStandardFilters() {
  // Define filters
  createComparisonFilter('equalsFilter', (a, b) => a === b)
  createComparisonFilter('notEqualsFilter', (a, b) => a !== b)
  createComparisonFilter('greaterThan', (a, b) => !isNaN(Number(a)) && Number(a) > Number(b))

  /**
   * Groupby filter using only field
   */
  addFilter('groupBy', (inGroup, field) => {
    const outGroup: { [field: string]: Group } = {}
    for (const grp of inGroup) {
      for (const obj of grp.elements) {
        if (!obj.parameters) throw new Error(`No parameters found for '${obj.id}'.`)
        const fieldValue = recursiveFieldSearch(obj.parameters, field) || "No Data"

        const pathName = getTextAfterLastDot(fieldValue)
        addObjToGroup(outGroup, obj, true, grp, pathName)
      }
    }
    return Object.values(outGroup)
  })
}

/**
 * Generic function to push objects into the right group object
 * @param outGroup Groups to add objects to
 * @param obj Obj to add
 * @param condition remove or not
 * @param inGroup Existing group
 * @param fieldValue name of field filtering
 */
function addObjToGroup(
  outGroup: { [key: string]: Group },
  obj: GeometryObject,
  condition: boolean,
  inGroup: Group,
  fieldValue: string
) {
  const pathName = condition ? fieldValue : `!${fieldValue}`
  const uniqueField = pathName + inGroup.path.join('')
  const paths: string[] = [...inGroup.path, pathName]

  if (uniqueField in outGroup) {
    outGroup[uniqueField].elements.push(obj)
  } else {
    outGroup[uniqueField] = {
      id: uniqueField,
      name: pathName,
      path: paths,
      elements: [obj],
    }
  }
}
