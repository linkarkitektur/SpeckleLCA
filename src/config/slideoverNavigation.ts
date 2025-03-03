import { 
  PencilSquareIcon, 
  Square3Stack3DIcon,
  DocumentArrowDownIcon,
  DocumentCheckIcon
} from '@heroicons/vue/24/solid'

import type { PageType, NavigationButtonConfig } from '@/models/pageLogic'
import { MapIcon, PaperAirplaneIcon } from '@heroicons/vue/20/solid'

export const pages: PageType[] = ['Filtering', 'Mapping', 'Results', 'Benchmark']

export const sidebarButtons: NavigationButtonConfig[] = [
  {
    text: 'Edit Filters',
    icon: PencilSquareIcon,
    action: 'toggleSlideover',
    showOn: ['Filtering']
  },
  {
    text: 'Show Materials',
    icon: MapIcon,
    action: 'toggleSlideover',
    showOn: ['Mapping']
  },
  {
    text: 'Edit Mapping',
    icon: PencilSquareIcon,
    action: 'toggleSlideover',
    showOn: ['Mapping']
  },
  {
    text: 'Edit Assemblies',
    icon: Square3Stack3DIcon,
    action: 'toggleAssemblyModal',
    showOn: ['Mapping']
  },
  {
    text: 'Save Results',
    icon: DocumentCheckIcon,
    action: 'toggleSlideover',
    showOn: ['Results', 'Benchmark']
  },
  {
    text: 'Export Results',
    icon: PaperAirplaneIcon,
    action: 'toggleSlideover',
    showOn: ['Results', 'Benchmark']
  }
]