import type { Group } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'

import { useProjectStore } from '@/stores/main'
import { useSpeckleStore } from '@/stores/speckle'
import { getTextAfterLastDot } from '@/utils/stringUtils'

/**
 * Iteratively searches an object for the specified key and applies the comparison function to its value.
 * Changed for recursive because 2x faster
 * @param obj Object to search
 * @param field The key whose value should be checked
 * @param comparisonFn Function to compare the value of the key
 * @param filterValue The value to compare against
 * @returns boolean
 */
function iterativeValueCheck(
  obj: Record<string, any>,
  field: string,
  comparisonFn: (a: any, b: any) => boolean,
  filterValue: any
): boolean | null {
  const stack = [obj]

  while (stack.length > 0) {
    const current = stack.pop()

    if (typeof current !== 'object' || current === null) {
      continue
    }

    for (const [key, value] of Object.entries(current)) {
      // If we find the field
      if (key === field) {
        // If it's an object with a 'value' property, compare that
        if (value && typeof value === 'object' && 'value' in value) {
          return comparisonFn(value.value, filterValue)
        }
        // Otherwise compare directly
        return comparisonFn(value, filterValue)
      }

      // If the property is an object, push it onto the stack
      if (typeof value === 'object' && value !== null) {
        stack.push(value)
      }
    }
  }

  // If we never found the field or matching condition
  return false
}

/**
 * Iteratively searches for the value of the specified field in an object.
 * @param obj Object to search
 * @param field Target field name
 * @returns The value of the field, or null if not found
 */
function iterativeFieldSearch(obj: Record<string, any>, field: string): any | null {
  const stack = [obj]

  while (stack.length > 0) {
    const current = stack.pop()

    if (typeof current !== 'object' || current === null) {
      continue
    }

    // Go through all keys and values in the object
    for (const [key, value] of Object.entries(current)) {
      // We found the field, return its value
      if (key === field) {
        // If the value is an object, return its value property
        if (value && typeof value === 'object' && 'value' in value) {
          return value.value
        }
        return value
      }

      if (typeof value === 'object' && value !== null) {
        stack.push(value)
      }
    }
  }

  return null
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
          // Search specified object iteratively for value, changed for recursive because 2x faster          
          const matches = iterativeValueCheck(obj.parameters, field, comparisonFn, filterValue)

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

        // Search specified object iteratively for value, changed for recursive because 2x faster
        const fieldValue = iterativeFieldSearch(obj.parameters, field) || "No Data"
        
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
