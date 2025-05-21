import {
	PencilSquareIcon,
	Square3Stack3DIcon,
	DocumentCheckIcon
} from '@heroicons/vue/24/solid'

import type { PageType, NavigationButtonConfig } from '@/models/pageModel'
import { MapIcon, PaperAirplaneIcon, PlusIcon } from '@heroicons/vue/20/solid'

export const pages: PageType[] = [
	'Filtering',
	'Mapping',
	'Results',
	'Benchmark'
]

export const sidebarButtons: NavigationButtonConfig[] = [
	{
		text: 'Edit Filters',
		icon: PencilSquareIcon,
		action: 'toggleSlideover',
		showOn: ['Filtering']
	},
	{
		text: 'Add Group',
		icon: PlusIcon,
		action: 'toggleSlideover',
		showOn: ['Filtering']
	},
	{
		text: 'New Filter',
		icon: DocumentCheckIcon,
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
		action: 'toggleSlideover',
		showOn: ['Mapping']
	},
	{
		text: 'Save Mapping',
		icon: DocumentCheckIcon,
		action: 'toggleSlideover',
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
