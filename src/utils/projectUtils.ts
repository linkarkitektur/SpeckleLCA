import type { NestedGroup, Filter, Group } from '@/models/filterModel'
import type { GeometryObject } from '@/models/geometryModel'

import { useProjectStore } from '@/stores/projectStore'
import { useResultStore } from '@/stores/resultStore'
import { useSettingsStore } from '@/stores/settingStore'
import { 
  baseColors, 
  getValueColorFromGradient,
  ColorManager 
} from '@/utils/colorUtils'
import { 
  ResultCalculator,
  extractEmissionsFromResultItem,
  sumEmissions,
  emissionToNumber
} from '@/utils/resultUtils'

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

    //TODO Change this to map instead for performance so we dont use find
    entry.path.forEach(level => {
      let existingLevel = currentLevel.children.find(
        child => child.name === level
      )

      if (!existingLevel) {
        existingLevel = {
          color: entry.color,  
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
 * Calculate the groups based on the filters and the project
 * @param reCalc 
 */
export function updateProjectGroups() {
  const projectStore = useProjectStore()
  let groups: Group[] = []
  
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
export function updateGroupColors(
  tree: NestedGroup[],
  id: string[] = [],
  color: string[] = []
): void {
  const colorMngr = new ColorManager()
  const colors = colorMngr.getMostDistinctColors(tree.length > 0 ? tree.length : 1)
  tree.map((group, index) => {
    if (id.includes(group.id)) {
      tree[index].color = color[id.indexOf(group.id)]
    } else {
      tree[index].color = colors[index]
    }
  })
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
    if (object && object.results) {
      // Calculate the resultlist for the object
      // TODO: Check if this is super inefficient nice to have it gathered into one function for all results
      const resCalc = new ResultCalculator([object])
      resCalc.aggregate(false)

      // Find the result for the active parameter
      const resItem = resCalc.resultList.find((item) => item.parameter === 'material.name')
      
      // Extract emissions from the result
      const emissionList = extractEmissionsFromResultItem(resItem)
      const emission = sumEmissions(emissionList)

      // We use a log10 scale, I think it makes sense
      // TODO: Remake this since we are using emission based on BTA and lifespan now so need to recalculate this to work
      const sizeFactor = object ? Math.log10(object.quantity.m2 + 1) : 1
      const normalisedEmissions = (emissionToNumber(emission) / object.quantity.m2) * sizeFactor
      //Calculate the color based on the gwp value
      const color = getValueColorFromGradient(normalisedEmissions, 0, 0.1, baseColors.modelGreen, baseColors.modelYellow, baseColors.modelRed)
      groups.push({ objectIds: [object.id], color: color })
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
    { objectIds: [], color: baseColors.modelGreen }
  const redGroup: { objectIds: string[], color: string } =
    { objectIds: [], color: baseColors.modelRed }

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