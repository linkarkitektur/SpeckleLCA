import { describe, it, expect, beforeEach } from 'vitest'
import { FilterRegistry } from '@/models/filterModel'
import { updateProjectGroups } from '@/utils/projectUtils'
import { loadProject } from '@/utils/speckleUtils'
import {
	createTestPinia,
	setupSpeckleStore,
	setupFilterRegistry,
	setupMaterialStore,
	setupMapping
} from '../setup/testUtils'
import { useProjectStore } from '@/stores/projectStore'
import { useSettingsStore } from '@/stores/settingStore'
import { useResultStore } from '@/stores/resultStore'
import { standardCalculationSettings } from '@/models/settingModel'
import { updateMapping } from '@/utils/materialUtils'
import { EmissionCalculator } from '@/utils/emissionUtils'
import {
	ResultCalculator,
	resultItemToChartData,
	resultItemToNestedChartData
} from '@/utils/resultUtils'
import { ExportManager } from '@/utils/exportUtils'
import { ExportFormat } from '@/models/exportModel'

describe('Full Workflow Test', () => {
	beforeEach(() => {
		createTestPinia()
	})

	it('should load project and convert objects correctly', async () => {
		setupSpeckleStore()

		// 1. Load project
		await loadProject(false)

		// Get projectStore directly
		const projectStore = useProjectStore()

		// Verify project was created with correct objects
		expect(projectStore.currProject).toBeDefined()
		expect(projectStore.currProject.geometry.length).toBe(11) // All mock objects

		// Verify object properties were converted correctly
		const wall = projectStore.currProject.geometry.find(
			(obj) => obj.id === 'wall-1'
		)
		expect(wall).toBeDefined()
		expect(wall.simpleParameters.category).toBe('Walls')
		expect(wall.simpleParameters.type).toBe('Basic Wall')
		expect(wall.simpleParameters.materialName).toBe('Concrete')
		expect(wall.quantity.m2).toBe(25)
		expect(wall.quantity.m3).toBe(7.5)

		// Check if all objects have both m² and m³
		projectStore.currProject.geometry.forEach((obj) => {
			expect(obj.quantity.m2).toBeGreaterThan(0)
			expect(obj.quantity.m3).toBeGreaterThan(0)
			expect(obj.simpleParameters.category).toBeDefined()
			expect(obj.simpleParameters.type).toBeDefined()
			expect(obj.simpleParameters.materialName).toBeDefined()
			expect(obj.simpleParameters.code).toBeDefined()
		})

		// Verify material distribution
		const concreteElements = projectStore.currProject.geometry.filter(
			(obj) => obj.simpleParameters.materialName === 'Concrete'
		)
		expect(concreteElements.length).toBe(7) // 2 walls, 2 columns, 2 slabs, 1 beam

		const otherMaterials = new Set(
			projectStore.currProject.geometry
				.filter((obj) => obj.simpleParameters.materialName !== 'Concrete')
				.map((obj) => obj.simpleParameters.materialName)
		)
		expect(Array.from(otherMaterials).sort()).toEqual([
			'EPDM',
			'Glass',
			'Steel',
			'Wood'
		])
	})

	it('should process objects through filtering workflow', async () => {
		// 1. Set up speckle store and load project first
		setupSpeckleStore()
		await loadProject(false)

		// 2. Set up filter registry
		const registry = new FilterRegistry()
		const projectStore = setupFilterRegistry(registry)

		// 3. Apply filters and update groups
		updateProjectGroups()
		const tree = projectStore.getGroupTree()

		// Verify group tree structure
		expect(tree).toBeDefined()
		expect(tree.children.length).toBeGreaterThan(0)

		// Verify all categories are present
		const categories = new Set(tree.children.map((g) => g.name))
		expect(categories).toContain('Walls')
		expect(categories).toContain('Columns')
		expect(categories).toContain('Floors')
		expect(categories).toContain('Beams')
		expect(categories).toContain('Windows')
		expect(categories).toContain('Doors')
		expect(categories).toContain('Roofs')

		// Verify quantities for concrete walls
		const wallGroup = tree.children.find((g) => g.name === 'Walls')
		expect(
			wallGroup.objects.reduce((sum, el) => sum + (el.quantity.m2 || 0), 0)
		).toBe(55) // 25 + 30
		expect(
			wallGroup.objects.reduce((sum, el) => sum + (el.quantity.m3 || 0), 0)
		).toBe(16.5) // 7.5 + 9.0

		// Verify quantities for floor slabs
		const floorGroup = tree.children.find((g) => g.name === 'Floors')
		expect(
			floorGroup.objects.reduce((sum, el) => sum + (el.quantity.m2 || 0), 0)
		).toBe(220) // 100 + 120
		expect(
			floorGroup.objects.reduce((sum, el) => sum + (el.quantity.m3 || 0), 0)
		).toBe(44) // 20 + 24

		// Verify material distribution
		const materialGroups = new Map<string, number>()
		tree.children
			.flatMap((g) => g.objects)
			.forEach((el) => {
				const material = el.simpleParameters.materialName
				materialGroups.set(material, (materialGroups.get(material) || 0) + 1)
			})

		// Check all materials are present with correct counts
		expect(materialGroups.get('Concrete')).toBe(7) // 2 walls, 2 columns, 2 slabs, 1 beam
		expect(materialGroups.get('Steel')).toBe(1)
		expect(materialGroups.get('Glass')).toBe(1)
		expect(materialGroups.get('Wood')).toBe(1)
		expect(materialGroups.get('EPDM')).toBe(1)

		// Verify total quantities are preserved
		const totalArea = tree.children
			.flatMap((g) => g.objects)
			.reduce((sum, el) => sum + (el.quantity.m2 || 0), 0)
		const totalVolume = tree.children
			.flatMap((g) => g.objects)
			.reduce((sum, el) => sum + (el.quantity.m3 || 0), 0)

		expect(totalArea).toBe(473.4) // Sum of all areas
		expect(totalVolume).toBe(84) // Sum of all volumes
	})

	it('should execute complete workflow from load to material mapping', async () => {
		// Setup stores
		setupSpeckleStore()
		setupMaterialStore()

		// Set up settings store with standard calculation settings
		const settingsStore = useSettingsStore()
		settingsStore.updateCalculationSettings(standardCalculationSettings)

		// 1. Load and convert objects
		await loadProject(false)
		const projectStore = useProjectStore()

		// Verify initial load
		expect(projectStore.currProject).toBeDefined()
		expect(projectStore.currProject.geometry.length).toBe(11)

		// 2. Set up filtering
		const registry = new FilterRegistry()
		setupFilterRegistry(registry)

		// 3. Apply filters and get groups
		updateProjectGroups()
		const tree = projectStore.getGroupTree()
		expect(tree).toBeDefined()

		// 4. Create mapping steps and apply them
		const mockMapping = setupMapping()
		updateMapping(mockMapping)

		// 5. Calculate emissions
		const calculator = new EmissionCalculator()
		const emissionResults = calculator.calculateEmissions()
		expect(emissionResults).toBe(true)

		// Verify emission results
		// Verify emission calculations for concrete walls
		const wallGroup = tree.children.find((g) => g.name === 'Walls')
		const wallEmissions = wallGroup.objects.map(
			(el) => el.results[el.results.length - 1]
		)

		// Wall emission values:
		// Wall 1: 7.5m³ volume -> 750 (a1a3) and 75 (a4)
		// Wall 2: 9.0m³ volume -> 900 (a1a3) and 90 (a4)
		expect(wallEmissions[0].emission.gwp.a1a3).toBe(750) // Concrete emission * volume (100 * 7.5)
		expect(wallEmissions[0].emission.gwp.a4).toBe(75) // Transport emission * volume (10 * 7.5)
		expect(wallEmissions[1].emission.gwp.a1a3).toBe(900) // Concrete emission * volume (100 * 9.0)
		expect(wallEmissions[1].emission.gwp.a4).toBe(90) // Transport emission * volume (10 * 9.0)

		// Verify emission calculations for concrete walls
		const columnGroup = tree.children.find((g) => g.name === 'Columns')
		const columnEmissions = columnGroup.objects.map(
			(el) => el.results?.[el.results.length - 1]
		)

		expect(columnEmissions[0].emission.gwp.a1a3).toBe(40 * 12) // Wood emission 40 unit m2
		expect(columnEmissions[0].emission.gwp.a4).toBe(5 * 12) // Transport emission 5
		expect(columnEmissions[1].emission.gwp.a1a3).toBe(100 * 3.2) // Concrete emission * volume (100 * 3.2)
		expect(columnEmissions[1].emission.gwp.a4).toBe(10 * 3.2) // Transport emission * volume (10 * 3.2)

		// Verify emission calculations for steel beam
		// Later steps should overwrite the initial wood material
		const beamGroup = tree.children.find((g) => g.name === 'Beams')
		const steelBeam = beamGroup.objects.find(
			(el) => el.simpleParameters.materialName === 'Steel'
		)
		const steelEmission = steelBeam.results[steelBeam.results.length - 1]
		expect(steelEmission.emission.gwp.a1a3).toBe(150 * 0.8) // Steel emission * volume
		expect(steelEmission.emission.gwp.a4).toBe(15 * 0.8) // Transport emission * volume

		// Verify all structural elements have emissions calculated
		const allStructuralElements = tree.children
			.flatMap((g) => g.objects)
			.filter((el) =>
				['Walls', 'Columns', 'Floors', 'Beams'].includes(
					el.simpleParameters.category
				)
			)
		allStructuralElements.forEach((el) => {
			expect(el.results).toBeDefined()
			expect(el.results.length).toBe(1)
			expect(el.results[0].emission.gwp).toBeDefined()
		})
	})

	it('should execute complete workflow from load to results aggregation', async () => {
		// Setup stores
		setupSpeckleStore()
		setupMaterialStore()

		// Set up settings store with standard calculation settings
		const settingsStore = useSettingsStore()
		settingsStore.updateCalculationSettings(standardCalculationSettings)

		// 1. Load and convert objects
		await loadProject(false)
		const projectStore = useProjectStore()

		// 2. Set up filtering
		const registry = new FilterRegistry()
		setupFilterRegistry(registry)

		// 3. Apply filters and get groups
		updateProjectGroups()
		projectStore.getGroupTree()

		// 4. Create and apply mapping
		const mockMapping = setupMapping()
		updateMapping(mockMapping)

		// 5. Calculate emissions
		const calculator = new EmissionCalculator()
		const emissionResults = calculator.calculateEmissions()
		expect(emissionResults).toBe(true)

		// 6. Aggregate results
		const resultStore = useResultStore()
		const resultCalculator = new ResultCalculator()
		resultCalculator.aggregate()

		// Verify result aggregation
		const aggregatedResults = resultStore.resultList

		// Check category grouping
		const categoryResults = aggregatedResults.find(
			(r) => r.parameter === 'parameters.category'
		)
		expect(categoryResults).toBeDefined()
		expect(categoryResults.data.length).toBeGreaterThan(0)

		// Check lifecycle stages grouping
		const lifecycleResults = aggregatedResults.find(
			(r) => r.parameter === 'lifeCycleStages'
		)
		expect(lifecycleResults).toBeDefined()
		expect(lifecycleResults.data.length).toBeGreaterThan(0)

		// Verify concrete walls total emission
		const wallsGroup = categoryResults.data.find((g) => g.parameter === 'Walls')
		expect(wallsGroup).toBeDefined()
		expect(wallsGroup.data.emission.gwp.a1a3).toBe(100 * 16.5) // Concrete rate * total wall volume
		expect(wallsGroup.data.emission.gwp.a4).toBe(10 * 16.5) // Transport rate * total wall volume

		// Verify lifecycle stage totals
		const a1a3Stage = lifecycleResults.data.find((g) => g.parameter === 'a1a3')
		expect(a1a3Stage).toBeDefined()
		expect(a1a3Stage.data.emission.gwp.a1a3).toBeGreaterThan(0)
		expect(Object.keys(a1a3Stage.data.geoId).length).toBeGreaterThan(0)

		// Verify stage quantities are aggregated
		expect(wallsGroup.quantity.m2).toBe(55) // Total wall area
		expect(wallsGroup.quantity.m3).toBe(16.5) // Total wall volume
	})

	it('should convert results to chart data formats', async () => {
		// Setup and run through the full workflow first
		setupSpeckleStore()
		setupMaterialStore()
		const settingsStore = useSettingsStore()
		settingsStore.updateCalculationSettings(standardCalculationSettings)

		// 1. Load and convert objects
		await loadProject(false)
		const projectStore = useProjectStore()

		// 2. Set up filtering
		const registry = new FilterRegistry()
		setupFilterRegistry(registry)

		// 3. Apply filters and get groups
		updateProjectGroups()
		const tree = projectStore.getGroupTree()

		// 4. Create and apply mapping
		const mockMapping = setupMapping()
		updateMapping(mockMapping)

		// 5. Calculate emissions
		const calculator = new EmissionCalculator()
		calculator.calculateEmissions()

		// 6. Aggregate results
		const resultStore = useResultStore()
		const resultCalculator = new ResultCalculator()
		resultCalculator.aggregate()
		const aggregatedResults = resultStore.resultList

		// 7. Convert category results to flat chart data
		const categoryResults = aggregatedResults.find(
			(r) => r.parameter === 'parameters.category'
		)
		const flatChartData = resultItemToChartData(categoryResults)

		// Verify flat chart data structure
		expect(flatChartData).toBeDefined()
		expect(flatChartData.length).toBeGreaterThan(0)
		flatChartData.forEach((item) => {
			expect(item).toHaveProperty('label')
			expect(item).toHaveProperty('value')
			expect(item).toHaveProperty('ids')
			expect(item.value).toBeTypeOf('number')
			expect(Array.isArray(item.ids)).toBe(true)
		})

		// Verify concrete walls data
		const wallsData = flatChartData.find((item) => item.label === 'Walls')
		expect(wallsData).toBeDefined()
		expect(wallsData.value).toBe(18.15) // (100 + 10) * 16.5 / 100 (Project Area) = 18.15 kg CO2e / m2

		// 8. Convert lifecycle results to nested chart data
		const lifecycleResults = aggregatedResults.find(
			(r) => r.parameter === 'lifeCycleStages'
		)
		const nestedChartData = resultItemToNestedChartData(lifecycleResults)

		// Verify nested chart data structure
		expect(nestedChartData).toBeDefined()
		expect(nestedChartData.length).toBeGreaterThan(0)
		nestedChartData.forEach((group) => {
			expect(group).toHaveProperty('label')
			expect(group).toHaveProperty('value')
			expect(Array.isArray(group.value)).toBe(true)

			group.value.forEach((item) => {
				expect(item).toHaveProperty('label')
				expect(item).toHaveProperty('value')
				expect(item).toHaveProperty('ids')
				expect(item.value).toBeTypeOf('number')
				expect(Array.isArray(item.ids)).toBe(true)
			})
		})

		// Verify nested data for production stages (A1-A3)
		const a1a3Data = nestedChartData.find((group) =>
			group.value.some((item) => item.label === 'a1a3')
		)
		expect(a1a3Data).toBeDefined()
		const a1a3Item = a1a3Data.value.find((item) => item.label === 'a1a3')
		expect(a1a3Item).toBeDefined()
		expect(a1a3Item.value).toBeGreaterThan(0)

		// 5. Verify chart data matches original emissions
		const totalWallEmission = wallsData.value
		const wallElements = tree.children.find((g) => g.name === 'Walls').objects
		const calculatedWallEmission = wallElements.reduce((sum, wall) => {
			const result = wall.results[wall.results.length - 1]
			return sum + result.emission.gwp.a1a3 + result.emission.gwp.a4
		}, 0)
		expect(totalWallEmission).toBe(calculatedWallEmission / 100)
	})

	it('should export results to JSON format', async () => {
		// Setup stores
		setupSpeckleStore()
		setupMaterialStore()
		const settingsStore = useSettingsStore()
		settingsStore.updateCalculationSettings(standardCalculationSettings)

		// 1. Load project
		await loadProject(false)
		const projectStore = useProjectStore()

		// 2. Set up filtering
		const registry = new FilterRegistry()
		setupFilterRegistry(registry)

		// 3. Update groups and filters
		updateProjectGroups()
		projectStore.getGroupTree()

		// 4. Map materials
		const mockMapping = setupMapping()
		updateMapping(mockMapping)

		// 5. Calculate emissions
		const calculator = new EmissionCalculator()
		calculator.calculateEmissions()

		// 6. Set up result calculation with parameter chain
		const resultCalculator = new ResultCalculator()
		resultCalculator.setGroupingChain(['parameters.category', 'material.name'])
		resultCalculator.aggregate()

		// 7. Export to JSON
		const config = {
			format: ExportFormat.JSON
		}
		const exporter = new ExportManager(config, resultCalculator.resultList)

		// Call private exportToJSON method to verify data structure
		const jsonData = exporter['exportToJSON']()

		// Verify JSON structure
		expect(jsonData).toBeDefined()
		expect(Array.isArray(jsonData)).toBe(true)
		expect(jsonData.length).toBeGreaterThan(0)

		// Should have category results
		const stageResults = jsonData.find(
			(item) => item.parameter === 'lifeCycleStages'
		)
		expect(stageResults).toBeDefined()
		expect(stageResults.data).toBeDefined()
		expect(Array.isArray(stageResults.data)).toBe(true)

		// Verify wall data in JSON
		const a1a3Data = stageResults.data.find((g) => g.parameter === 'a1a3')
		expect(a1a3Data).toBeDefined()
		expect(a1a3Data.data.emission.gwp.a1a3).toBe(11690) // 100 * 16.5

		// Verify nested material data
		const nestedResults = jsonData.find(
			(item) => item.parameter === 'parameters.category -> material.name'
		)
		const nestedWalls = nestedResults.data.find(
			(item) => item.parameter === 'Walls'
		)
		expect(nestedWalls.nested).toBeDefined()
		expect(Array.isArray(nestedWalls.nested)).toBe(true)
		const concreteData = nestedWalls.nested.find(
			(m) => m.parameter === 'Ready-mix concrete'
		)
		expect(concreteData).toBeDefined()
		expect(concreteData.data.emission.gwp.a1a3).toBe(1650)
		expect(concreteData.data.emission.gwp.a4).toBe(165)
	})
})
