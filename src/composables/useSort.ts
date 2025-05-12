import { ref, computed } from 'vue'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/vue/20/solid'

export interface SortingParam {
	filterName: string
	displayName: string
}

export function useSort(sortingParam: SortingParam[]) {
	const sorting = ref<{ parameter: string; direction: 'asc' | 'desc' }>({
		parameter: '',
		direction: 'asc'
	})

	const sortItems = computed(() =>
		sortingParam.map((param) => ({
			name: param.displayName,
			data: param.filterName,
			icon:
				sorting.value.parameter === param.filterName
					? sorting.value.direction === 'asc'
						? ChevronUpIcon
						: ChevronDownIcon
					: undefined
		}))
	)

	const sortData = <T extends Record<string, any>>(data: T[]) => {
		if (!sorting.value.parameter) return data

		return [...data].sort((a, b) => {
			const dir = sorting.value.direction === 'asc' ? 1 : -1
			const aVal = a[sorting.value.parameter]
			const bVal = b[sorting.value.parameter]
			return aVal < bVal ? -1 * dir : aVal > bVal ? 1 * dir : 0
		})
	}

	const setSortOption = (parameterName: string) => {
		if (sorting.value.parameter === parameterName) {
			sorting.value.direction =
				sorting.value.direction === 'asc' ? 'desc' : 'asc'
		} else {
			sorting.value.parameter = parameterName
			sorting.value.direction = 'asc'
		}
	}

	return {
		sorting,
		sortItems,
		sortData,
		setSortOption
	}
}
