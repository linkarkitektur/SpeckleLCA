/**
 * Combines and gets the selection variable to get proper information from your speckle project
 * @param sourceApplication source application as string
 * @returns array of strings to be set as variables for graphQL queries
 */
export function speckleSelection(sourceApplication: string) {
	const selection: string[] = []
	selection.push(...generalParameters)

	if (sourceApplication.includes('Archicad'))
		selection.push(...archicadParameters)

	if (sourceApplication.includes('Revit')) selection.push(...revitParameters)

	if (sourceApplication.includes('IFC')) selection.push(...ifcParameters)

	if (
		sourceApplication.includes('Rhino') &&
		sourceApplication.includes('Grasshopper')
	)
		selection.push(...rhinoParameters)

	return selection
}

/**
 * General geometry information that speckle sets from all supported applications
 */
const generalParameters = ['name', 'speckleType', 'height', 'width', 'level']

/**
 * Archicad building element information that speckle sets when sent from Archicad
 */
const archicadParameters = [
	'elementType',
	'area',
	'volume',
	'number',
	'sideMaterialName',
	'oppositeMaterialName',
	'referenceMaterialName',
	'botMat',
	'topMat',
	'sideMat',
	'buildingMaterialName',
	'classifications'
]

/**
 * Revit building element information that speckle sets when sent from Revit
 */
const revitParameters = [
	'type',
	'family',
	'category',
	'parameters.HOST_AREA_COMPUTED.value',
	'parameters.HOST_VOLUME_COMPUTED.value'
]

/**
 * IFC building element information that speckle sets when sent from IFC
 * THIS NEEDS TO BE EXPANDED
 */
const ifcParameters = ['Name', 'GlobalId', 'Type', 'BIP', 'Tag']

/**
 * Rhino building element information that speckle sets when sent from Rhino
 */
const rhinoParameters = ['area', 'provenance']
