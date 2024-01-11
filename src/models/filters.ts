import type { GeometryObject } from "./geometryObject"
import { getTextAfterLastDot } from "@/utils/projectUtils"

/**
 * Filters done in correct sequencing with arguments to be used for each step
 */
export interface FilterList {
  name: string
  callStack: Filter[]
}

/**
 * Interface for filterList
 * name: The name of the filter that is added to the registry
 * field: GeoObject property which to run filter on
 * value: Optional value to use for comparrison in the filter
 * remove: Optional boolean if you want to remove all false results
 */
export interface Filter {
  name: string
  field: string
  value?: string
  remove?: boolean
}

/**
 * Grouped geometryObjects with path information
 */
export interface Group {
  id: string
  name: string
  // Path describes how group is shown in the tree view. 
  // Always put in the root first and then final name last
  // eg. ["Wall", "Inner Wall", "Type 1"]
  path: [
    string
  ]
  elements: GeometryObject[]
}

/**
 * Filter registry to store all filter functions
 */
export class FilterRegistry {
  private filters: {
    [filterName: string]: Function
  } = {}

  public filterCallStack: FilterList = {
    name: "",
    callStack: []
  }

  /**
   * Add functions to registry by providing a name and the function with 3 set parameters
   * @param name 
   * @param filter 
   * required inputs on filter (inGroup: Group[], field: string, value: string)
   * required output Group[]
   */
  addFilter(
    name: string,
    filter: (inGroup: Group[], field: string, value?: string, remove?: boolean) => Group[]
  ) {
    this.filters[name] = filter
  }

  /**
   * Call Filter defined in registry and return grouping
   * @param name name of filter
   * @param inGroup group to filter, has to have a root level atleast
   * @param field field to filter upon
   * @param value value to use for filtering true or false
   * @param remove remove all false results
   * @returns Group[] from filter
   */
  callFilter(
    name: string,
    inGroup: Group[],
    field: string,
    value?: string,
    remove?: boolean
  ) {
    const filter = this.filters[name]
    if (typeof filter === 'function') {
      return filter(inGroup, field, value, remove)
    } else {
      throw new Error(`Function '${name}' not found.`)
    }
  }

  /**
   * Get all filternames available for the registry, currently using real function name
   * Should maybe be changed to a more proper name later
   * @returns list of filter names available for registry
   */
  getFilterNames(): string[] {
    return Object.keys(this.filters)
  }
}



/**
 * Exmaple of how filters are structured
 * Creates standardfilters
 * @param registry 
 */
export function createStandardFilters(registry: FilterRegistry) {
  /**
   * Equality filter checking if field matches value
   */
  registry.addFilter('equalsFilter', (inGroup, field, value, remove) => {
    if (value == undefined)
      throw new Error(`No value provided for equalsFilter.`)
    const groupObj: { [value: string]: Group } = {}
    for (const grp of inGroup) {
      // Create unique identifier for this group and path
      const uniqueTrueField = value + grp.path.join('')
      const nonVal: string = `!${value}`
      const uniqueFalseField = nonVal + grp.path.join('')
      for (const obj of grp.elements) {
        // Find the parameter field
        if (obj.parameters == undefined)
          throw new Error(`No parameters found for '${obj.id}'.`)
        if (field in obj.parameters) {
          // Check if the value is equal to the parameter
          if (obj.parameters[field] == value) {

            // Add to groupObj
            if (uniqueTrueField in groupObj) {
              const temp = groupObj[uniqueTrueField]
              temp!.elements.push(obj)

              groupObj[uniqueTrueField] = temp!
            } else {
              //Copy old path and push the new value at the end of the path
              const paths: [string] = [...grp.path]
              paths.push(value)

              const temp: Group = {
                id: crypto.randomUUID(),
                name: `${value}`,
                path: paths,
                elements: [obj],
              }

              groupObj[uniqueTrueField] = temp!
            }
          } else if (!remove) {
            // Add to groupObj
            // Check if we have the unique identifier in the group already
            if (uniqueFalseField in groupObj) {
              const temp = groupObj[uniqueFalseField]
              temp!.elements.push(obj)

              groupObj[uniqueFalseField] = temp!
            } else {
              //Copy old path and push the new cleaned up value at the end of the path
              const pathName = getTextAfterLastDot(nonVal)
              const paths: [string] = [...grp.path]
              paths.push(pathName)

              const temp: Group = {
                id: crypto.randomUUID(),
                name: nonVal,
                path: paths,
                elements: [obj],
              }

              groupObj[uniqueFalseField] = temp!
            }
          }
        } else {
          //throw new Warning(`Parameter in '${obj.id}' with the name '${field}' not found.`)
        }
      }
    }

    // Create the output groups from the object
    const group: Group[] = []
    for (const key in groupObj)
      group.push(groupObj[key])
    return group
  })

  /**
   * Groupby filter using only field
   */
  registry.addFilter('groupByFilter', (inGroup, field) => {
    const groupObj: { [field: string]: Group } = {}
    for (const grp of inGroup) {
      for (const obj of grp.elements) {
        // Find the parameter field
        if (obj.parameters == undefined)
          throw new Error(`No parameters found for '${obj.id}'.`)
        if (field in obj.parameters) {
          // Group objects based on the field
          const uniqueField = obj.parameters[field] + grp.path.join('')
          if (uniqueField in groupObj) {
            const temp = groupObj[uniqueField]
            temp!.elements.push(obj)

            groupObj[uniqueField] = temp!
          } else {
            //Copy old path and push the new cleaned up value at the end of the path
            const pathName = getTextAfterLastDot(obj.parameters[field])
            const paths: [string] = [...grp.path]
            paths.push(pathName)

            const temp: Group = {
              id: crypto.randomUUID(),
              name: obj.parameters[field],
              path: paths,
              elements: [obj],
            }

            groupObj[uniqueField] = temp
          }
        } else {
          // Group objects based on the field
          const uniqueField = "NoData" + grp.path.join('')
          if (uniqueField in groupObj) {
            const temp = groupObj[uniqueField]
            temp!.elements.push(obj)

            groupObj[uniqueField] = temp!
          } else {
            //Copy old path and push the new cleaned up value at the end of the path
            const pathName = "No Data"
            const paths: [string] = [...grp.path]
            paths.push(pathName)

            const temp: Group = {
              id: crypto.randomUUID(),
              name: "No data",
              path: paths,
              elements: [obj],
            }

            groupObj[uniqueField] = temp
          }
        }
      }
    }

    // Create the output groups from the object
    const group: Group[] = []
    for (const key in groupObj)
      group.push(groupObj[key])
    return group
  })

   /**
   * Equality filter checking if field matches value
   */
   registry.addFilter('greaterThan', (inGroup, field, value, remove) => {
    if (value == undefined)
      throw new Error(`No value provided for greaterThan filter.`)
    const groupObj: { [value: string]: Group } = {}
    for (const grp of inGroup) {
      // Create unique name to add to objs and search for so we add all path options
      const valName = `>${value}`
      const uniqueTrueField = valName + grp.path.join('')
      const nonVal: string = `<${value}`
      const uniqueFalseField = nonVal + grp.path.join('')
      for (const obj of grp.elements) {
        // Find the parameter field
        if (obj.parameters == undefined)
          throw new Error(`No parameters found for '${obj.id}'.`)

        if (field in obj.parameters) {
          // Check if the value is equal to the parameter
          if (!isNaN(Number(obj.parameters[field])) && Number(obj.parameters[field]) > Number(value)) {
            // Add to groupObj
            if (uniqueTrueField in groupObj) {
              const temp = groupObj[uniqueTrueField]
              temp!.elements.push(obj)

              groupObj[uniqueTrueField] = temp!
            } else {
              //Copy old path and push the new value at the end of the path
              const paths: [string] = [...grp.path]
              paths.push(valName)

              const temp: Group = {
                id: crypto.randomUUID(),
                name: valName,
                path: paths,
                elements: [obj],
              }

              groupObj[uniqueTrueField] = temp!
            }
          } else if (!remove) {
            // Add to groupObj
            if (uniqueFalseField in groupObj) {
              const temp = groupObj[uniqueFalseField]
              temp!.elements.push(obj)

              groupObj[uniqueFalseField] = temp!
            } else {
              //Copy old path and push the new cleaned up value at the end of the path
              const pathName = getTextAfterLastDot(nonVal)
              const paths: [string] = [...grp.path]
              paths.push(pathName)

              const temp: Group = {
                id: crypto.randomUUID(),
                name: nonVal,
                path: paths,
                elements: [obj],
              }

              groupObj[uniqueFalseField] = temp!
            }
          }
        } else {
          //throw new Warning(`Parameter in '${obj.id}' with the name '${field}' not found.`)
        }
      }
    }

    // Create the output groups from the object
    const group: Group[] = []
    for (const key in groupObj)
      group.push(groupObj[key])
    return group
  })
}