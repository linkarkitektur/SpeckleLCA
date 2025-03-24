import type { GeometryObject } from '@/models/geometryModel'

/**
 * Filters done in correct sequencing with arguments to be used for each step
 */
export interface FilterList {
	name: string
	id: string
	callStack: Filter[]
}

/**
 * Interface for filterList
 * name: The name of the filter that is added to the registry
 * field: GeoObject property which to run filter on
 * value: Optional value to use for comparrison in the filter
 * remove: Optional boolean if you want to remove all false results
 */
export interface Filter {
	name: string
	field: string
	value?: string
	remove?: boolean
}

/**
 * Grouped geometryObjects with path and color information
 */
export interface Group {
	id: string
	name: string
	// Path describes how group is shown in the tree view.
	// Always put in the root first and then final name last
	// eg. ["Wall", "Inner Wall", "Type 1"]
	path: string[]
	elements: GeometryObject[]
	color?: string
}

/**
 * Filter registry to store all filter functions
 */
export class FilterRegistry {
	public filters: {
		[filterName: string]: Function
	} = {}

	public filterCallStack: FilterList = {
		name: '',
		id: '',
		callStack: []
	}

	/**
	 * Add functions to registry by providing a name and the function with 3 set parameters
	 * @param name
	 * @param filter
	 * required inputs on filter (inGroup: Group[], field: string, value: string)
	 * required output Group[]
	 */
	addFilter(
		name: string,
		filter: (
			inGroup: Group[],
			field: string,
			value?: string,
			remove?: boolean
		) => Group[]
	) {
		this.filters[name] = filter
	}

	/**
	 * Call Filter defined in registry and return grouping
	 * @param name name of filter
	 * @param inGroup group to filter, has to have a root level atleast
	 * @param field field to filter upon
	 * @param value value to use for filtering true or false
	 * @param remove remove all false results
	 * @returns Group[] from filter
	 */
	callFilter(
		name: string,
		inGroup: Group[],
		field: string,
		value?: string,
		remove?: boolean
	) {
		const filter = this.filters[name]
		if (typeof filter === 'function') {
			return filter(inGroup, field, value, remove)
		} else {
			throw new Error(`Function '${name}' not found.`)
		}
	}

	/**
	 * Get all filternames available for the registry, currently using real function name
	 * Should maybe be changed to a more proper name later
	 * @returns list of filter names available for registry
	 */
	getFilterNames(): string[] {
		return Object.keys(this.filters)
	}

	/**
	 * Check if filter exists in registry
	 * @param name name of filter
	 * @returns boolean if filter exists
	 */
	hasFilter(name: string): boolean {
		return Object.hasOwn(this.filters, name)
	}
}

/**
 * Interface for tree created for grouped up object list
 */
export interface NestedGroup {
	name: string
	objects: GeometryObject[]
	id: string
	children: NestedGroup[]
	color?: string
}
