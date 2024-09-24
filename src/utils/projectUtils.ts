import type { NestedGroup, Filter, Group } from '@/models/filters'
import type { GeometryObject } from '@/models/geometryObject'
import type { EPD } from 'lcax'
import type { ChartData } from '@/models/chartModels'
import { useProjectStore } from '@/stores/main'
import { useSpeckleStore } from '@/stores/speckle'
import { baseColors, getValueColorFromGradient } from '@/utils/colors'

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
    const outGroup: { [field: string]: Group } = {};
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
 * Calculate the groups based on the filters and the project
 * @param reCalc 
 */
export function calculateGroups(reCalc: boolean) {
  const projectStore = useProjectStore()
  let groups: Group[] = []
  // First time running we need to define the groups from scratch
  if (reCalc) {
    //Create geometry objects from the project
    const geo: GeometryObject[] = []
    projectStore.currProject?.geometry.forEach((element) => {
      geo.push(element)
    })

    //Root for the group, this should not be needed
    groups = [
      {
        id: 'test',
        name: 'root',
        path: ['root'],
        elements: geo,
        color: 'hsl(151, 100%, 50%)'
      }
    ]

    //Go through each filter and iterate over them
    let reverseStack: Filter[] = []
    if (projectStore.filterRegistry)
      reverseStack = projectStore.filterRegistry.filterCallStack.callStack

    reverseStack.forEach((el) => {
      if (el.value) {
        groups = projectStore.filterRegistry?.callFilter(
          `${el.name}`,
          groups,
          `${el.field}`,
          `${el.value}`,
          el.remove
        )
      } else {
        groups = projectStore.filterRegistry?.callFilter(
          `${el.name}`,
          groups,
          `${el.field}`
        )
      }

      //Remove root in path since we had to add it
      groups.forEach((element) => {
        if (element.path[0] === 'root') element.path.splice(0, 1)
      })
    })
  } else {
    if (projectStore.projectGroups) {
      groups = projectStore.projectGroups
    }
  }

  groups.sort((a, b) => b.elements.length - a.elements.length)

  //Update groups
  projectStore.updateGroups(groups)
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
 * Set the color based on results, if no object is provided it will set all objects in the project
 * @param objects optional for specfic material updates
 * @param colorRange optional number of steps of colors in the gradient
 * @returns gradient groups with increments for results
 */
export function setResultsColorGroup(objects: GeometryObject[] = null, colorRange: number = 10) {
  const projectStore = useProjectStore()
  const groups: { objectIds: string[], color: string }[] = []

  //Create all colorRange groups including no results
  const neutralGroup: { objectIds: string[], color: string } = 
    { objectIds: [], color: baseColors.primaryGrey }

  if (!objects) {
    //Get all objects from the project
    const groups = projectStore.projectGroups
    if (groups) {
      groups.forEach(group => {
        group.elements.forEach(element => {
          assignColorGroup(element)
        })
      })
    }
  } else {
    objects.forEach((element) => {
      assignColorGroup(element)
    })
  }
  
  //Add groups to main
  groups.push(neutralGroup)

  return groups

  function assignColorGroup(object: GeometryObject) {
    //Check if we have a result to map
    if (object && object.results) {
      //Get the last result
      const result = object.results[object.results.length - 1]
      if (result && result.emission) {
        //Get the gwp value
        const gwp = result.emission.gwp
        let totalGwp = 0
        for (const phase in gwp) {
          totalGwp += gwp[phase]
        }
        //Calculate the color based on the gwp value
        const color = getValueColorFromGradient(totalGwp, 0, 10000)
        groups.push({ objectIds: [object.id], color: color })
      }
    } else {
      //No result mapped set color to grey
      neutralGroup.objectIds.push(object.id)
    }
  }
}

/**
 * Set the color of the material based on if it is mapped or not, if no object is provided it will set all objects in the project
 * @param object optional for specifik material updates
 * @returns greenGroup and redGroup with objectIds and color
 */
export function setMappingColorGroup(objects: GeometryObject[] = null) {
  const projectStore = useProjectStore()
  //Create two groups for the mapping colors, one red and one green and move objects between them to match if mapped materials or not
  const greenGroup: { objectIds: string[], color: string } = 
    { objectIds: [], color: baseColors.primaryGreen }
  const redGroup: { objectIds: string[], color: string } =
    { objectIds: [], color: baseColors.primaryRed }

  if (!objects) {
    //Get all objects from the project
    const groups = projectStore.projectGroups
    if (groups) {
      groups.forEach(group => {
        group.elements.forEach(element => {
          assignColorGroup(element)
        })
      })
    }
  } else {
    objects.forEach((element) => {
      assignColorGroup(element)
    })
  }
  
  return [ greenGroup, redGroup ]

  function assignColorGroup(object: GeometryObject) {
    //Check if we have a material to map
    if (object && object.material) {
      //Add the object to the green group
      greenGroup.objectIds.push(object.id)
    } else {
      //No material mapped
      redGroup.objectIds.push(object.id)
    }
  }
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