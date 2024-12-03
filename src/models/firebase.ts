import type { FilterList } from '@/models/filters'
import type { Assembly, Mapping } from '@/models/material'
import type { ResultList } from '@/models/result'
import type { CalculationSettings } from '@/models/settings'


export interface FilterLog {
  projectId: string
  stackName: string
  filterCallStack: FilterList
  date: Date
}

export interface MappingLog {
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
