import {
	calculateQuantity,
	processSimpleObject,
	processCompositeObject
} from '@/utils/speckleUtils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createTestPinia } from '@/tests/setup/testUtils'
import type { ResponseObject } from '@/models/speckleModel'

const data = {
	id: '01323df7c2a400afa7838bfba0a3ad57',
	data: {
		id: '01323df7c2a400afa7838bfba0a3ad57',
		area: 3.3799999999999977,
		geometry: {
			id: '5643faebb9cd3c14c78c78528a58f0f6',
			area: 0,
			bbox: {
				id: '685f6b12a833b6e60e5161c165013749',
				area: 22.286808817993574,
				bbox: null,
				units: 'm',
				xSize: {
					id: '3d5bbd3eedf1112f1a0d94b8e76c1108',
					end: 2.3775954246520996,
					start: 1.4049190282821655,
					speckle_type: 'Objects.Primitive.Interval',
					applicationId: null,
					totalChildrenCount: 0
				},
				ySize: {
					id: 'ce760d102d7e1ae50f654cdc4a2af6e5',
					end: 6.7760491371154785,
					start: 4.364846229553223,
					speckle_type: 'Objects.Primitive.Interval',
					applicationId: null,
					totalChildrenCount: 0
				},
				zSize: {
					id: '7a215cb3430e50bf1bab2cfdb89bf40d',
					end: 11.499649047851,
					start: 8.899649620056152,
					speckle_type: 'Objects.Primitive.Interval',
					applicationId: null,
					totalChildrenCount: 0
				},
				volume: 6.097831061112385,
				basePlane: {
					id: 'e431a36940705fb29db462d770e01e61',
					xdir: {
						x: 1,
						y: 0,
						z: 0,
						id: '494940761939ca395c1391af6f3cfc34',
						bbox: null,
						units: 'm',
						speckle_type: 'Objects.Geometry.Vector',
						applicationId: null,
						totalChildrenCount: 0
					},
					ydir: {
						x: 0,
						y: 1,
						z: 0,
						id: '5e25a88f9f54b4ad7860423ea8222b99',
						bbox: null,
						units: 'm',
						speckle_type: 'Objects.Geometry.Vector',
						applicationId: null,
						totalChildrenCount: 0
					},
					units: 'm',
					normal: {
						x: 0,
						y: 0,
						z: 1,
						id: 'c68c9ea2125b4fbee95c451182c700d0',
						bbox: null,
						units: 'm',
						speckle_type: 'Objects.Geometry.Vector',
						applicationId: null,
						totalChildrenCount: 0
					},
					origin: {
						x: 0,
						y: 0,
						z: 0,
						id: 'b89c253405ee564f70b24cab19b97ab1',
						units: 'm',
						speckle_type: 'Objects.Geometry.Point',
						applicationId: null,
						totalChildrenCount: 0
					},
					speckle_type: 'Objects.Geometry.Plane',
					applicationId: null,
					totalChildrenCount: 0
				},
				speckle_type: 'Objects.Geometry.Box',
				applicationId: null,
				totalChildrenCount: 0
			},
			faces: [
				{
					referencedId: 'fcc9a59576fd3cc3ba9164b96bd8fd56',
					speckle_type: 'reference'
				}
			],
			units: 'm',
			colors: [
				{
					referencedId: 'be0e77a52f60ce503333c968076789eb',
					speckle_type: 'reference'
				}
			],
			volume: 0,
			vertices: [
				{
					referencedId: '6d8e815f44b0da3375aea91b22a922cc',
					speckle_type: 'reference'
				}
			],
			speckle_type: 'Objects.Geometry.Mesh',
			applicationId: null,
			textureCoordinates: [
				{
					referencedId: 'a3b583e068f736623aab9b5b6ab41617',
					speckle_type: 'reference'
				}
			],
			totalChildrenCount: 0
		},
		elementType: 'wall',
		speckle_type: 'Base',
		applicationId: null,
		totalChildrenCount: 0
	}
}

describe('processSimpleObject', () => {
	beforeEach(() => {
		createTestPinia()
	})

	it('should process the object correctly', () => {
		const materialObjects = []
		const sourceApplication = 'Grasshopper8'
		const geoObjects = []
		processSimpleObject(data, materialObjects, sourceApplication, geoObjects)

		expect(geoObjects.length).toEqual(1)
	})
})

describe('processCompositeObject', () => {
	beforeEach(() => {
		createTestPinia()
	})

	it('should process the object correctly', () => {
		const revitObject = {
			id: '02a3f9092df1ec93dc67be7dd7b93f45',
			data: {
				id: '02a3f9092df1ec93dc67be7dd7b93f45',
				type: 'Wall - Timber Clad',
				level: null,
				units: 'mm',
				family: 'Basic Wall',
				height: 3900.0000000002296,
				flipped: true,
				baseLine: null,
				elements: null,
				topLevel: null,
				elementId: '849032',
				topOffset: -299.99999999977047,
				baseOffset: -1200,
				parameters: null,
				structural: false,
				speckle_type:
					'Objects.BuiltElements.Wall:Objects.BuiltElements.Revit.RevitWall',
				applicationId: '98e2f96c-ccbd-4abb-a697-e7e5136106ee-000cf488',
				isRevitLinkedModel: false,
				materialQuantities: [
					{
						id: '19f1dce61e9a5b71eebc9fa3bdbd305e',
						area: 42.751800000004096,
						units: 'm',
						volume: 0.555773400000053,
						material: {
							id: 'e48668b7059433ada6f932b7d5a8c2fb',
							name: 'Finishes - Interior - Plasterboard',
							units: 'mm',
							elementId: '198369',
							shininess: 128,
							parameters: {
								id: 'ff4f88d3a16e76944556506201cae235',
								speckle_type: 'Base',
								applicationId: null,
								totalChildrenCount: 0
							},
							smoothness: 50,
							speckle_type: 'Objects.Other.Material:Objects.Other.Revit.RevitMaterial',
							transparency: 0,
							applicationId: 'ef57b02a-5e81-49e7-93bb-ae5f002d921c-000306e1',
							materialClass: 'Unassigned',
							renderMaterial: null,
							materialCategory: 'Unassigned',
							isRevitLinkedModel: false,
							materialQuantities: null,
							totalChildrenCount: 0,
							revitLinkedModelPath:
								'C:\\Program Files\\Autodesk\\Revit 2022\\Samples\\rac_basic_sample_project.rvt'
						},
						speckle_type: 'Objects.Other.MaterialQuantity',
						applicationId: null,
						totalChildrenCount: 0
					},
					{
						id: '7f312e99f87ae8ece0e511b8980f8b81',
						area: 42.75180000000411,
						units: 'm',
						volume: 1.0687950000001032,
						material: {
							id: '8a1430e2d0d1e6406e0ef0d1911697cc',
							name: 'Wood - Stud Layer',
							units: 'mm',
							elementId: '198370',
							shininess: 64,
							parameters: {
								id: '31af981f5eb00e798dc192c2f3952662',
								speckle_type: 'Base',
								applicationId: null,
								totalChildrenCount: 0
							},
							smoothness: 50,
							speckle_type: 'Objects.Other.Material:Objects.Other.Revit.RevitMaterial',
							transparency: 0,
							applicationId: 'ef57b02a-5e81-49e7-93bb-ae5f002d921c-000306e2',
							materialClass: 'Unassigned',
							renderMaterial: null,
							materialCategory: 'Unassigned',
							isRevitLinkedModel: false,
							materialQuantities: null,
							totalChildrenCount: 0,
							revitLinkedModelPath:
								'C:\\Program Files\\Autodesk\\Revit 2022\\Samples\\rac_basic_sample_project.rvt'
						},
						speckle_type: 'Objects.Other.MaterialQuantity',
						applicationId: null,
						totalChildrenCount: 0
					},
					{
						id: 'd46cb488f00e4b0714cba45a27eb7702',
						area: 42.75180000000411,
						units: 'm',
						volume: 4.788201600000462,
						material: {
							id: '0297dadaa90ba4aa7dc832ea44356c85',
							name: 'Structure - Timber Insulated Panel - Insulation',
							units: 'mm',
							elementId: '198372',
							shininess: 64,
							parameters: {
								id: '07c688587badada7d8ea4ca500e5c84d',
								speckle_type: 'Base',
								applicationId: null,
								totalChildrenCount: 0
							},
							smoothness: 50,
							speckle_type: 'Objects.Other.Material:Objects.Other.Revit.RevitMaterial',
							transparency: 0,
							applicationId: 'ef57b02a-5e81-49e7-93bb-ae5f002d921c-000306e4',
							materialClass: 'Unassigned',
							renderMaterial: null,
							materialCategory: 'Unassigned',
							isRevitLinkedModel: false,
							materialQuantities: null,
							totalChildrenCount: 0,
							revitLinkedModelPath:
								'C:\\Program Files\\Autodesk\\Revit 2022\\Samples\\rac_basic_sample_project.rvt'
						},
						speckle_type: 'Objects.Other.MaterialQuantity',
						applicationId: null,
						totalChildrenCount: 0
					},
					{
						id: 'c5745becdc86e35d0133d5461f81afb2',
						area: 85.5036000000082,
						units: 'm',
						volume: 1.282554000000124,
						material: {
							id: 'b70c4f940fe8cbaf6eb9788bdc5106fc',
							name: 'Structure - Timber Insulated Panel - OSB',
							units: 'mm',
							elementId: '198373',
							shininess: 64,
							parameters: {
								id: 'd2548b9b54200b8d5c7b26e1f93baef7',
								speckle_type: 'Base',
								applicationId: null,
								totalChildrenCount: 0
							},
							smoothness: 50,
							speckle_type: 'Objects.Other.Material:Objects.Other.Revit.RevitMaterial',
							transparency: 0,
							applicationId: 'ef57b02a-5e81-49e7-93bb-ae5f002d921c-000306e5',
							materialClass: 'Unassigned',
							renderMaterial: null,
							materialCategory: 'Unassigned',
							isRevitLinkedModel: false,
							materialQuantities: null,
							totalChildrenCount: 0,
							revitLinkedModelPath:
								'C:\\Program Files\\Autodesk\\Revit 2022\\Samples\\rac_basic_sample_project.rvt'
						},
						speckle_type: 'Objects.Other.MaterialQuantity',
						applicationId: null,
						totalChildrenCount: 0
					},
					{
						id: '8bc92de987b40a85d64a2f1795df6521',
						area: 42.75180000000411,
						units: 'm',
						volume: 0.9405396000000906,
						material: {
							id: '4a8975aa3e809d4bd7beb2fcf94d48d2',
							name: 'Finishes - Exterior - Timber Cladding',
							units: 'mm',
							elementId: '198374',
							shininess: 128,
							parameters: {
								id: '432a80bad8a5bc12f70d39ac180f14ae',
								speckle_type: 'Base',
								applicationId: null,
								totalChildrenCount: 0
							},
							smoothness: 50,
							speckle_type: 'Objects.Other.Material:Objects.Other.Revit.RevitMaterial',
							transparency: 0,
							applicationId: 'ef57b02a-5e81-49e7-93bb-ae5f002d921c-000306e6',
							materialClass: 'Wood',
							renderMaterial: null,
							materialCategory: 'Wood',
							isRevitLinkedModel: false,
							materialQuantities: null,
							totalChildrenCount: 0,
							revitLinkedModelPath:
								'C:\\Program Files\\Autodesk\\Revit 2022\\Samples\\rac_basic_sample_project.rvt'
						},
						speckle_type: 'Objects.Other.MaterialQuantity',
						applicationId: null,
						totalChildrenCount: 0
					}
				],
				totalChildrenCount: 0,
				revitLinkedModelPath:
					'C:\\Program Files\\Autodesk\\Revit 2022\\Samples\\rac_basic_sample_project.rvt'
			}
		}
		const materialObjects = []
		const sourceApplication = 'Revit2022'
		const geoObjects = []
		processCompositeObject(
			revitObject,
			materialObjects,
			sourceApplication,
			geoObjects
		)

		expect(geoObjects.length).toEqual(5)
	})
})

describe('calculateQuantity', () => {
	it('should process the quantity correctly', () => {
		const { m2, m3 } = calculateQuantity(data as unknown as ResponseObject)

		expect(m2).toEqual(3.3799999999999977)
		expect(m3).toEqual(0)
	})
})