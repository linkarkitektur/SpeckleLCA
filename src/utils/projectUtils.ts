import type { Group } from '@/models/filters'
import type { FilterRegistry, NestedGroup } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'
import type { EPD, ImpactCategory } from 'lcax'
import type { Emissions } from '@/models/project'
import type { ChartData } from '@/models/chartModels'
import { Chart } from 'chart.js'

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
  registry.addFilter('groupBy', (inGroup, field) => {
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
export function getMappedMaterial(objects: GeometryObject[]) {
  if (objects) {
    const materialNames = objects.map(obj => obj.material?.name)
    const uniqueMaterialNames = [...new Set(materialNames)]
    
    // Check if there are objects without materials to turn the card yellow
    const objectsWithoutMaterials = objects.filter(obj => obj.material == undefined).length > 0

    if (uniqueMaterialNames.length === 1) {
      if (uniqueMaterialNames[0] == undefined) {
        return {
          name: "No material mapped",
          color: "red-50"
        }
      } else {
        return {
          name: uniqueMaterialNames[0],
          color: "green-50"
        }
      }
    } else {
      return {
        name: "Mixed",
        color: objectsWithoutMaterials? "yellow-50" : "green-50"
      }
    }
  } else {
    return {
          name: "No material mapped",
          color: "red-50"
        }
  }
}

/**
 * Calculate the emissions of the current geo and attach the results to the geo
 * @param geo
 * @returns 
 */
export function calculateEmissions(geo: GeometryObject): boolean {
  let success = false
  if (geo.material) {
    const material = geo.material
    //TODO: make this dynamic so we can change which impact categories are included
    const emissions = { gwp: {} }
    //Check if assembly
    if (material instanceof Object 
      && 'isAssembly' in material
     ) {
      const materialObj = material as { materials?: EPD[] }
      materialObj.materials.forEach((mat: EPD) => {
        //Go through and check if mat has any gwp values
        if (mat.gwp) {
          for (const phase in mat.gwp) {
            const value = mat.gwp[phase]
            if (typeof value === 'number' && mat.gwp[phase] !== null) {
              //TODO: This needs to check thickness if needed for conversions or we just precalculate it on the material
              emissions['gwp'][phase] = value * geo.quantity[mat.declared_unit]
            }
          }
        }
      })
      //Add the emissions to the geo 
      if(geo.results) {
        geo.results.push({
          id: crypto.randomUUID(),
          date : new Date(),
          emission: emissions
        })
        success = true
      } else {
        geo.results = [{
          id: crypto.randomUUID(),
          date : new Date(),
          emission: emissions
        }]
        success = true
      }
    } 
    // If its not assembly its and EPD
    else {
      //TODO: make this dynamic so we can change which impact categories are included
      const emissions = { gwp: {} }
      const materialObj = material as EPD
      if (materialObj.gwp) {
        for (const phase in materialObj.gwp) {
          const value = materialObj.gwp[phase]
          if (typeof value === 'string' && materialObj.gwp[phase] !== null) {
            emissions['gwp'][phase] = parseFloat(value) * geo.quantity[materialObj.declared_unit]
          }
        }
      }
      //Add the emissions to the geo
      if(geo.results) {
        geo.results.push({
          id: crypto.randomUUID(),
          date : new Date(),
          emission: emissions
        })
        success = true
      } else {
        geo.results = [{
          id: crypto.randomUUID(),
          date : new Date(),
          emission: emissions
        }]
        success = true
      }
    }
  }
  return success
}

/**
 * Create a list of colors based on the number of objects
 * Rainbow style for now, we can limit this range later
 * @param n number of colors
 * @returns list of HSL colors
 */
export function generateColors(n: number): string[] {
  const colors: string[] = []
  for (let i = 0; i < n; i++) {
    const hue = Math.round(360 * i / n)
    colors.push(`hsl(${hue}, 100%, 80%)`)
  }
  return colors
}

/**
* Updates the colors of the groups in the project
* Autmatically setting all colors, optional to change specific ones
* @param id Optional: Ids of groups to change
* @param color Optional: colors to change to
*/
export function updateGroupColors(tree: NestedGroup[], id: string[] = [], color: string[] = []) {
  const colors = generateColors(tree.length)
  for (let i = 0; i < tree.length; i++) {
    if (id.includes(tree[i].id)) {
      tree[i].color = color[id.indexOf(tree[i].id)]
    } else {
      tree[i].color = colors[i]
    }
  }
  return tree
}

/**
 * Convert hsl to hex, https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
 * @param h hue
 * @param s saturation
 * @param l lightness
 * @returns Hex color
 */
export function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Converter of geometry object results into aggregated ChartData for specific LifeCycleStages (LCS)
 * @param objects geometry objects to convert
 * @param impactCategory optional impact category to get results for that category
 * @param resultKey optional key to get specific result
 */
export function geometryToLCSChartData(objects: GeometryObject[], impactCategory: string = 'gwp', resultKey: number = Number.MIN_SAFE_INTEGER): ChartData[] {
  const groupedData = new Map<string, number>()

  // Go through each selected object and get aggregated labels and emission data
  for (const obj of objects) {
    const results = obj.results
    if (!results) continue

    // Check if we got any resultKey otherwise just take the last one
    const result = resultKey === Number.MIN_SAFE_INTEGER ? results[results.length - 1] : results[resultKey]
    if (!result || !result.emission) continue

    for (const lifeCycleStage in result.emission[impactCategory]) {
      const currentValue = groupedData.get(lifeCycleStage) || 0
      groupedData.set(lifeCycleStage, currentValue + result.emission[impactCategory][lifeCycleStage])
    }
  }

  const data: ChartData[] = Array.from(groupedData, ([lifeCycleStage, value]) => ({
    label: lifeCycleStage,
    value: Math.round(value)
  }))

  return data
}

/**
 * Converter of geometry object results into aggregated ChartData for all unique materials
 * @param objects geometry objects to convert
 * @param impactCategory optional impact category to get results for that category
 * @param resultKey optional key to get specific result
 */
export function geometryToMaterialChartData(objects: GeometryObject[], impactCategory: string = 'gwp', resultKey: number = Number.MIN_SAFE_INTEGER): ChartData[] {
  const groupedData = new Map<string, { value: number, ids: Set<string> }>()

  // Go through each selected object and get aggregated labels and emission data
  for (const obj of objects) {
    const materialName = obj.material?.name
    const results = obj.results
    if (!results || !materialName) continue

    const result = resultKey === Number.MIN_SAFE_INTEGER ? results[results.length - 1] : results[resultKey]
    if (!result || !result.emission) continue

    if (!groupedData.has(materialName)) {
      groupedData.set(materialName, { value: 0, ids: new Set<string>() })
    }

    const materialData = groupedData.get(materialName)!

    for (const lifeCycleStage in result.emission[impactCategory]) {
      materialData.value += result.emission[impactCategory][lifeCycleStage]
    }
    materialData.ids.add(obj.id)
  }

  const data: ChartData[] = Array.from(groupedData, ([material, { value, ids }]) => ({
    label: material,
    value: Math.round(value),
    ids: Array.from(ids)
  }))

  return data
}

/**
 * Truncate text down to set length
 * @param text 
 * @param maxLength 
 * @returns 
 */
export function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}