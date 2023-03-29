/* ============
 * State of the materialmapper Module
 * ============
 *
 * The initial state of the materialmapper Module.
 * 
 * loading - Set to true or false for universal loading display 
 * use local loading if needed
 * 
 * assignMaterials - selected objects for mapping
 *      open: bool set if we should display materialList
 *      category: name of category for mapping
 *      type: name of type for mapping
 * 
 * resourceList - List of all materials that can be used in mapping, can contain GWP values
 *      This is mostly to keep from reloading each time but can be for calculations
 * 
 * currentMapper - Contains link between materials and speckle objects
 *      key: Name of speckle object category and type combination
 *      staticFullName: name of resource that speckle object is mapped towards
 *      id: resource ID
 *      temporary: bool set to distinguish manually added materials so that we dont save the mapping
 *      area: area of speckle objects, if left at 0.0 its ignored
 *      volume: volume of speckle objects, if left at 0.0 its ignored
 * 
 * resourceEmissions - saved results from calculation, based on 1x metric of material which we remap
 *      modelId: this is the resourceListID which may differ from the resultsId in some cases, can be same as parentId
 *      parentId: parent results construction id, if we only have results one layer this should match childId
 *      parentName: name of parent construction
 *      children: list of children for construction, this should be all the materials the object consists of
 *      childId: child material id, if we only have results one layer this should match parentId
 *      childName: name of children, e.g clt wood, insulation etc.
 *      GWP: GWP value for each phase, if not calculated kept as 0.0
 *      metric: set this to volume or area depending on what metric we want to map towards
 * 
 * results - remapped results towards areas or volumes
 *      key: name and key to currentMapper
 *      resources: any resources mapped towards speckle object
 *      id: id of resource for results mapping
 *      resourcefullName: name of resource for displaying
 *      GWP: Remapped GWP value for each phase
 * 
 */

export default {
    loading: false,
    asignMaterials: {
        open: false,
        category: "",
        type: "",
    },
    objectArr: [],
    resourceList: {},
    currentMapper: {
        key: {
            staticFullName: "",
            _id: "",
            temporary: false,
            area: 0.0,
            volume: 0.0,
        }
    },
    //Not sure this is needed in the store
    resourceEmissions: {
        modelId: {
            parentId: "",
            parentName: "",
            children: [{
                childId: "",
                childName: "",
                GWP: {
                    A1A3: 0.0,
                    A4: 0.0,
                    A5: 0.0,
                    C3: 0.0,
                    C4: 0.0,
                },
            }],
            sumGWP: {
                A1A3: 0.0,
                A4: 0.0,
                A5: 0.0,
                C3: 0.0,
                C4: 0.0,
            },
            metric: "area",
        },
    },
    results: {
    },
};