import type { Group, NestedGroup } from '@/models/filterModel'
import type { GeometryObject, Quantity } from '@/models/geometryModel'

import { useProjectStore } from '@/stores/projectStore'
import { useSpeckleStore } from '@/stores/speckleStore'
import { getNestedPropertyValue } from './materialUtils'
import { roundNumber } from './mathUtils'

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
  
  // Check if we have the full path, if we do just return it.
  const directValue = getNestedPropertyValue(obj, field)
  if (directValue !== undefined) {
    if (typeof directValue === 'object' && directValue !== null) {
      if ('value' in directValue) {
        return comparisonFn(directValue.value, filterValue)
      }
      if ('name' in directValue) {
        return comparisonFn(directValue.name, filterValue)
      }
    }
    return comparisonFn(directValue, filterValue)
  }

  const visited = new WeakSet()

  while (stack.length > 0) {
    const current = stack.pop()
    
    if (typeof current !== 'object' || current === null || visited.has(current)) {
      continue
    }
    visited.add(current)

    for (const [key, value] of Object.entries(current)) {
      if (key === field) {
        // Handle primitive values first (most common case)
        if (typeof value !== 'object' || value === null) {
          return comparisonFn(value, filterValue)
        }
        // Handle object cases
        if ('value' in value) {
          return comparisonFn(value.value, filterValue)
        }
        if ('name' in value) {
          return comparisonFn(value.name, filterValue)
        }
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

const fieldCache = new WeakMap<object, Map<string, any>>()

/**
 * Iteratively searches for the value of the specified field in an object.
 * @param obj Object to search
 * @param field Target field name
 * @returns The value of the field, or null if not found
 */
export function iterativeFieldSearch(obj: Record<string, any>, field: string): any | null {
  // Check cache first
  if (fieldCache.has(obj)) {
    const objCache = fieldCache.get(obj)!
    if (objCache.has(field)) {
      return objCache.get(field)!
    }
  } else {
    fieldCache.set(obj, new Map())
  }

  // Direct access check on the object return if we have full path
  const directValue = getNestedPropertyValue(obj, field)
  if (directValue !== undefined) {
    if (typeof directValue === 'object' && directValue !== null) {
      if ('value' in directValue) {
        return directValue.value
      }
      if ('name' in directValue) {
        return directValue.name
      }
    }
    return directValue
  }

  const stack = [obj]
  const visited = new WeakSet()
  let result: any | null = null

  while (stack.length > 0) {
    const current = stack.pop()
    
    if (!current || typeof current !== 'object' || visited.has(current)) {
      continue
    }
    visited.add(current)

    for (const [key, value] of Object.entries(current)) {
      if (key === field) {
        result = value?.value ?? value?.name ?? value
        fieldCache.get(obj)!.set(field, result)
        return result
      }

      if (typeof value === 'object' && value !== null) {
        stack.push(value)
      }
    }
  }

  fieldCache.get(obj)!.set(field, null)
  return null
}

/**
 * Searches for any field in an object whose key includes the searchText and returns the extracted value
 * if found, otherwise returns null.
 * @param obj Object to search
 * @param searchText The text to match against property keys (case insensitive)
 * @returns The extracted value if the key includes searchText, otherwise null
 */
export function iterativeKeySearchIncludes(
  obj: Record<string, any>,
  searchText: string
): any | null {
  const stack = [obj]
  const visited = new WeakSet()
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || typeof current !== 'object' || visited.has(current)) {
      continue
    }
    visited.add(current)
    for (const [key, value] of Object.entries(current)) {
      if (key.toLowerCase().includes(searchText.toLowerCase())) {
        const extracted = value?.value ?? value?.name ?? value
        return extracted
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
          const matches = iterativeValueCheck(obj, field, comparisonFn, filterValue)

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
        const fieldValue = iterativeFieldSearch(obj, field) || "No Data"
        const pathName = fieldValue
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

/**
 * Calculate linked quantities for geometry linked to group from the grouplist
 * @param linkedGroup 
 * @param percentage 
 * @returns 
 */
export function calculateLinkedQuantities(linkedGroup: NestedGroup, percentage: number): Quantity {
  let M = 0,
      M2 = 0,
      M3 = 0,
      KG = 0,
      PCS = 0
  const processedParents = new Set<string>()

  linkedGroup.objects.forEach((obj) => {
      const key = obj.id
      if (!processedParents.has(key)) {
          M += obj.quantity.m || 0
          M2 += obj.quantity.m2 || 0
          KG += obj.quantity.kg || 0
          processedParents.add(key)
      }
      // Always add the cubic value since that is still relevant
      M3 += obj.quantity.m3 || 0
      PCS += 1
  })

  const multiplier = percentage / 100

  return {
      m: roundNumber(M * multiplier, 2),
      m2: roundNumber(M2 * multiplier, 2),
      m3: roundNumber(M3 * multiplier, 2),
      kg: roundNumber(KG * multiplier, 2),
      pcs: roundNumber(PCS * multiplier, 0)
  }
}

// Make internal functions exportable for tests
export { 
  iterativeValueCheck,
  addFilter,
  createComparisonFilter,
  addObjToGroup
}