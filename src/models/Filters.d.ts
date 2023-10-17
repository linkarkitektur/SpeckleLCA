import type { group } from "console";
import type { GeometryObject } from "./GeometryObject";

/**
 * Filters done in correct sequencing with arguments to be used for each step
 */
interface FilterList {
    name: string;
    filters: Filters[
        'Equals'
    ]
}

/**
 * Grouped geometryObjects with path information
 */
interface Group {
    id: string;
    name: string;
    // Path describes how group is shown and the name/val ... val/name heirarchy
    // eg. Wall/Inner Wall/Type 1
    path: string;
    elements: GeometryObject[];
}   

/**
 * Filter registry to store all filter functions
 */
class FilterRegistry {
    private filters: Map<string, Function>;

    /**
     * Add functions to registry by providing a name and the function with 3 set parameters
     * @param name 
     * @param filter 
     * required inputs on filter (inGroup: Group[], field: string, value: string)
     * required output Group[]
     */
    addFilter(
        name: string, 
        filter: (inGroup: Group[], field: string, value: string) => Group[]
    ){
        this.filters.set(name, filter);
    }

    /**
     * Call Filter and return grouping
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
        value: string
    ){
        const filter = this.filters.get(name);
        if (typeof filter === 'function') {
            return func(inGroup, field, value);
        } else {
            throw new Error(`Function '${name}' not found.`);
        }
    }
  
}

/**
 * Example of usage and adding an equality filter to the registry
 */
const exampleRegistry = new FilterRegistry();

exampleRegistry.addFilter('equalsFilter', (inGroup, field, value) => {
    const groupMap = new Map<string, Group>();
    for (const grp of inGroup) {
        for (const obj of grp.elements) {
            // Find the parameter field
            if (obj.parameters?.has(field)) {
                // Check if the value is equal to the parameter
                if (obj.parameters?.get(field) == value){
                    // Add to groupMap
                    if (this.groupMap.has(value)){
                        let temp = this.groupMap.get(value);
                        temp.elements.push(obj);

                        this.groupMap.set(value, temp);
                    } else {
                        let temp: Group;
                        temp.id = crypto.randomUUID();
                        temp.name = value;
                        temp.path = `${grp.path}/${value}`;
                        temp.elements.push(obj);

                        this.groupMap.set(value, temp);
                    }
                } else {
                    // Add to groupMap
                    if (this.groupMap.has(value)){
                        let temp = this.groupMap.get(value);
                        temp.elements.push(obj);
                        
                        this.groupMap.set(value, temp);
                    } else {
                        let temp: Group;
                        temp.id = crypto.randomUUID();
                        temp.name = `!${value}`;
                        temp.path = `${grp.path}/!${value}`;
                        temp.elements.push(obj);

                        this.groupMap.set(value, temp);
                    }
                }
            } else {
                throw new Error(`Parameter in '${obj.id}' with the name '${field}' not found.`);
            }    
        }
    }

    // Create the output groups from the Map
    let group: Group[];
    tempGroup.forEach((value: Group, key: string) => {
        group.push(value);
    });
    return group;
});

/* Old filter logic, new filter registry instead
abstract class Filter {
    private _objects: GeometryObject[];
    private _field: string;
    private _value: string;

    // String is what will be shown in the path for the grouping
    public groups: Map<string, GeometryObject[]>;

    // Should always include getGroups which contains the logic
    getGroups() {
        return this.groups;
    }
}

// Example of how to extend Filter with an equality Filter
class Equals implements Filter{
    constructor(geometryObjects: GeometryObject[], field: string, value: string) {
        this._objects = geometryObjects;
        this._field = field;
        this._value = value;
    }
    
    //Logic of filter
    getGroups() {
        this._objects.forEach(element => {
            if(element.parameters?.has(this._field)) {
                if(element.parameters?.get(this._field) == value) {
                    // Set field name for path creation
                    this.groups.set(this._field, element);
                }
                else {
                    // Set field name for path creation
                    this.groups.set("!" + this._field, element);
                }
            };
        });

        return this.groups;
    }
}
*/