export interface Step {
	name: string
	href: string
}

export interface DropdownOption {
	label: string
	value: string
	selected: boolean
}

export type PageType =
	| 'Projects'
	| 'Overview'
	| 'Filtering'
	| 'Mapping'
	| 'Results'
	| 'Benchmark'
	| 'Report'

export interface NavigationButtonConfig {
	text: SlideoverFunction
	icon: any
	action: string
	showOn: PageType[]
}

export type SlideoverFunction =
	| 'Edit Filters'
	| 'New Filter'
	| 'Add Group'
	| 'Show Materials'
	| 'Edit Mapping'
	| 'Edit Assemblies'
	| 'New Mapping'
	| 'Save Results'
	| 'Export Results'
