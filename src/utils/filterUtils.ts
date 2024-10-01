import type { Group } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'

import { useProjectStore } from '@/stores/main'
import { useSpeckleStore } from '@/stores/speckle'
import { getTextAfterLastDot } from '@/utils/stringUtils'
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
      if (filterValue == undefined)
        throw new Error(`No value provided for ${name}.`)
      const outGroup: { [key: string]: Group } = {}
      // Go through each group and find the objects that match the comparison function
      for (const grp of inGroup) {
        // Go through each obj in group
        for (const obj of grp.elements) {
          // Check if parameter exists, if not hide object
          if (!obj.parameters && remove) 
            speckleStore.addHiddenObject(obj)            
          // Search specified object for value
          const objValue = obj.parameters[field]
          if (objValue !== undefined) {
            if (comparisonFn(objValue, filterValue))
              addObjToGroup(outGroup, obj, true, grp, filterValue)
            else if (remove)
              speckleStore.addHiddenObject(obj)
            else if (!remove)
              addObjToGroup(outGroup, obj, false, grp, filterValue)
          } else if (remove){
            speckleStore.addHiddenObject(obj)
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
  createComparisonFilter('greaterThan', (a, b) => !isNaN(Number(a)) && Number(a) > Number(b))

  /**
   * Groupby filter using only field
   */
  addFilter('groupBy', (inGroup, field) => {
    const outGroup: { [field: string]: Group } = {}
    for (const grp of inGroup) {
      for (const obj of grp.elements) {
        if (!obj.parameters) throw new Error(`No parameters found for '${obj.id}'.`)
        const fieldValue = obj.parameters[field] || "No Data"
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
