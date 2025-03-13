import { ref, computed } from 'vue'
import type { Assembly, Product } from '@/models/material'
import { isAssembly } from '@/utils/EPDUtils'
import { getNestedPropertyValue } from '@/utils/material'
import { getEnumEntries } from '@/utils/dataUtils'
import { APISource } from '@/models/material'
import type { Option } from '@/components/Base/DropdownMulti.vue'

export function useSearch(initialData: (Product | Assembly)[]) {
  const searchQuery = ref('')
  const selectedFilters = ref<Record<string, any[]>>({})
  const manualMode = ref(false)

  const filteredData = computed(() => {
    if (manualMode.value) {
      return initialData
    }

    // Rest of filtering logic with deduplication
    const seenIds = new Set<string>()
    return initialData.filter((item) => {
      const id = item.id
      if (seenIds.has(id)) {
        return false // Skip duplicate
      }
      seenIds.add(id)

      const searchMatch = !searchQuery.value || 
        item.name.toLowerCase().includes(searchQuery.value.toLowerCase())

      const filterMatch = Object.entries(selectedFilters.value).every(
        ([key, selectedOptions]) => {
          // Skip empty filters
          if (!selectedOptions || selectedOptions.length === 0) return true

          // Special handling for assembly filter
          if (key === 'isAssembly') {
            const itemType = isAssembly(item) ? 'assembly' : 'product'
            return selectedOptions.includes(itemType)
          }

          // Regular filter matching
          const itemValue = getNestedPropertyValue(item, key)
          return itemValue !== undefined && selectedOptions.includes(itemValue)
        }
      )

      return searchMatch && filterMatch
    })
  })

  const resetSearchMode = () => {
    manualMode.value = false
    searchQuery.value = ''
    return initialData
  }

  const getOptionsForParameter = (paramName: string): Option[] => {
    // Special handling for predefined filters
    if (paramName === 'source') {
      return getEnumEntries(APISource).map((entry) => ({
        label: entry.label,
        value: entry.value,
        selected: selectedFilters.value[paramName]?.includes(entry.value),
      }))
    }

    if (paramName === 'isAssembly') {
      return [
        {
          label: 'Assembly',
          value: 'assembly',
          selected: selectedFilters.value[paramName]?.includes('assembly'),
        },
        {
          label: 'Product',
          value: 'product',
          selected: selectedFilters.value[paramName]?.includes('product'),
        },
      ]
    }

    // Dynamic filter options based on data
    const optionsSet = new Set<string>()
    initialData.forEach((item) => {
      const value = getNestedPropertyValue(item, paramName)
      if (value !== undefined) {
        optionsSet.add(value.toString())
      }
    })
    
    return Array.from(optionsSet).map((option) => ({
      label: option,
      value: option,
      selected: selectedFilters.value[paramName]?.includes(option),
    }))
  }

  return {
    searchQuery,
    selectedFilters,
    filteredData,
    manualMode,
    resetSearchMode,
    getOptionsForParameter
  }
}