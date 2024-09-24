import type { FilterList } from '@/models/filters'
import type { Mapping } from '@/models/material'
import type { Results } from '@/models/project'

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
  results: Results
  date: Date
}
