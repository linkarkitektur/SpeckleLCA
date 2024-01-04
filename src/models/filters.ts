import type { GeometryObject } from "./geometryObject"
import { getTextAfterLastDot } from "@/utils/projectUtils"

/**
 * Filters done in correct sequencing with arguments to be used for each step
 */
export interface FilterList {
    name: string
    filters: Filter[]
}

/**
 * Interface for filterList
 * name: The name of the filter that is added to the registry
 * field: GeoObject property which to run filter on
 * value: Optional value to use for comparrison in the filter
 */
export interface Filter {
    name: string
    field: string
    value?: string
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
        filters: []
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
        filter: (inGroup: Group[], field: string, value?: string) => Group[]
    ){
        this.filters[name] = filter
    }

    /**
     * Call Filter defined in registry and return grouping
     * @param name name of filter
     * @param inGroup 
     * @param field 
     * @param value 
     * @returns Group[] from filter
     */
    callFilter(
        name: string,
        inGroup: Group[],
        field: string,
        value?: string
    ){
        const filter = this.filters[name]
        if (typeof filter === 'function') {
            return filter(inGroup, field, value)
        } else {
            throw new Error(`Function '${name}' not found.`)
        }
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
    registry.addFilter('equalsFilter', (inGroup, field, value) => {
        if (value == undefined)
            throw new Error(`No value provided for equalsFilter.`) 
        const groupObj: { [value: string]: Group } = {}
        for (const grp of inGroup) {
            for (const obj of grp.elements) {
                // Find the parameter field
                if (obj.parameters == undefined)
                    throw new Error(`No parameters found for '${obj.id}'.`)
                if (field in obj.parameters) {
                    // Check if the value is equal to the parameter
                    if (obj.parameters[field] == value) {
                        // Add to groupObj
                        if (value in groupObj) {
                            let temp = groupObj[value]
                            temp!.elements.push(obj)
    
                            groupObj[value] = temp!
                        } else {
                            //Copy old path and push the new value at the end of the path
                            let paths = grp.path
                            paths.push(value)

                            let temp: Group = {
                                id: crypto.randomUUID(),
                                name: `${value}`,
                                path: grp.path,
                                elements: [obj],
                            }

                            groupObj[value] = temp!
                        }
                    } else {
                        // Add to groupObj
                        let nonValue : string = `!${value}`
                        if (nonValue in groupObj){
                            let temp = groupObj[nonValue]
                            temp!.elements.push(obj)
    
                            groupObj[nonValue] = temp!
                        } else {
                            //Copy old path and push the new cleaned up value at the end of the path
                            const pathName = getTextAfterLastDot(obj.parameters[field])
                            const paths: [string] = [...grp.path]
                            paths.push(pathName)

                            let temp: Group = {
                                id: crypto.randomUUID(),
                                name: nonValue,
                                path: paths,
                                elements: [obj],
                            }

                            groupObj[nonValue] = temp!
                        }
                    }
                } else {
                    throw new Error(`Parameter in '${obj.id}' with the name '${field}' not found.`)
                }    
            }
        }
    
        // Create the output groups from the object
        let group: Group[] = [] 
        for (const key in groupObj)
            group.push(groupObj[key])
        return group
    })

    /**
     * Groupby filter using only field
     */
    registry.addFilter('groupByFilter', (inGroup, field, value) => {
        const groupObj: { [field: string]: Group } = {}
        for (const grp of inGroup) {
            for (const obj of grp.elements) {
                // Find the parameter field
                if (obj.parameters == undefined)
                    throw new Error(`No parameters found for '${obj.id}'.`)
                if (field in obj.parameters) {
                    // Group objects based on the field
                    if (obj.parameters[field] in groupObj) {
                        let temp = groupObj[obj.parameters[field]]
                        temp!.elements.push(obj)
                        
                        groupObj[obj.parameters[field]] = temp!
                    } else {
                        //Copy old path and push the new cleaned up value at the end of the path
                        const pathName = getTextAfterLastDot(obj.parameters[field])
                        const paths: [string] = [...grp.path]
                        paths.push(pathName)
                        
                        let temp: Group = {
                            id: crypto.randomUUID(),
                            name: obj.parameters[field],
                            path: paths,
                            elements: [obj],
                        }
                       
                        groupObj[obj.parameters[field]] = temp
                    }
                } else {
                    throw new Error(`Parameter in '${obj.id}' with the name '${field}' not found.`)
                }    
            }
        }
    
        // Create the output groups from the object
        let group: Group[] = [] 
        for (const key in groupObj)
            group.push(groupObj[key])
        return group
    })
}