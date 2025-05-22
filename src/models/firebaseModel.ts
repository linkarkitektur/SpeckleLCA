import type { FilterList } from '@/models/filterModel'
import type { Assembly, Mapping } from '@/models/materialModel'
import type { ResultList } from '@/models/resultModel'
import type {
	CalculationSettings,
	ProjectSettings
} from '@/models/settingModel'

export interface FilterLog {
	projectId: string
	stackName: string
	filterList: FilterList
	date: Date
}

export interface MappingLog {
	id: string
	projectId: string
	name: string
	mapping: Mapping
	date: Date
}

export interface ResultsLog {
	projectId: string
	name: string
	resultList: ResultList
	date: Date
}

export interface AssemblyList {
	projectId: string
	assemblies: Assembly[]
}

export interface CalculationSettingsLog {
	projectId: string
	name: string
	settings: CalculationSettings
	date: Date
}

export interface ProjectSettingsLog {
	projectId: string
	settings: ProjectSettings
	date: Date
}
