import type { Group } from '@/models/filters'
import type { FilterRegistry, NestedGroup } from '@/models/filters'
import type { Assembly } from '@/models/project'
import type { EPD } from 'lcax'

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

/**
 * Gets the mapped material and returns a color based on it
 * @param group 
 * @returns 
 */
export function getMappedMaterial(group: NestedGroup) {
  const objects = group.objects
  if (objects) {
    const materialNames = objects.map(obj => obj.material?.name)
    const uniqueMaterialNames = [...new Set(materialNames)]
    
    // Check if there are objects without materials to turn the card yellow
    const objectsWithoutMaterials = objects.filter(obj => obj.material == undefined).length > 0

    if (uniqueMaterialNames.length === 1) {
      if (uniqueMaterialNames[0] == undefined) {
        return {
          name: "No material mapped",
          color: "bg-red-50"
        }
      } else {
        return {
          name: uniqueMaterialNames[0],
          color: "bg-green-50"
        }
      }
    } else {
      return {
        name: "Mixed",
        color: objectsWithoutMaterials? "bg-yellow-50" : "bg-green-50"
      }
    }
  } else {
    return {
          name: "No material mapped",
          color: "bg-red-50"
        }
  }
}

/**
 * Checks if the object is an EPD
 * @param obj 
 * @returns 
 */
export function isEPD(obj: any): obj is EPD {
  return obj && obj.Type === 'EPD'
}

/**
 * Checks if the object is an Assembly
 * @param obj 
 * @returns 
 */
export function isAssembly(obj: any): obj is Assembly {
  return obj && obj.Type === 'Assembly';
}