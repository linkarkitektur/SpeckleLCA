import { ExportFormat } from '@/models/exportModel'
import { saveAs } from 'file-saver'

import type { ExportConfig } from '@/models/exportModel'
import type { GroupedResults, ResultList } from '@/models/resultModel'
import { useSettingsStore } from '@/stores/settingStore'

export class ExportManager {
	private config: ExportConfig
	private resultList: ResultList

	// Default to latest result
	// TODO: Push results into first slot when saving new on objects
	constructor(config: ExportConfig, resultList: ResultList) {
		this.config = {
			resultKey: Number.MIN_SAFE_INTEGER,
			...config
		}
		this.resultList = resultList
	}

	/**
	 * Switch format to export to on already existing class
	 * @param format
	 */
	public switchFormat(format: ExportFormat): void {
		this.config.format = format
	}

	/**
	 * Takes the current geometry and settings and exports it.
	 * The file is automatically downloaded in the browser.
	 */
	public exportData(): void {
		let exportedContent: string | Blob

		switch (this.config.format) {
			case ExportFormat.JSON: {
				const jsonData = this.exportToJSON()
				exportedContent = JSON.stringify(jsonData, null, 2)
				this.downloadFile(exportedContent, 'export.json', 'application/json')
				break
			}
			case ExportFormat.CSV: {
				const csvData = this.exportToCSV()
				exportedContent = csvData
				this.downloadFile(exportedContent, 'export.csv', 'text/csv')
				break
			}
			case ExportFormat.Excel: {
				const excelData = this.exportToExcel()
				exportedContent = excelData
				this.downloadFile(
					exportedContent,
					'export.xlsx',
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				)
				break
			}
			default:
				throw new Error('Unsupported export format')
		}
	}

	/**
	 * Recursively cleans the data by:
	 *  - Removing properties named "geoId"
	 *  - Skipping any objects or arrays that are empty.
	 */
	private cleanData(value: any): any {
		// Check if array clean that
		if (Array.isArray(value)) {
			const cleanedArray = value
				.map((item) => this.cleanData(item))
				.filter((item) => item !== undefined)

			return cleanedArray.length > 0 ? cleanedArray : undefined
			// If object we clean that
		} else if (value && typeof value === 'object') {
			const cleanedObj: any = {}

			Object.keys(value).forEach((key) => {
				// Remove geoIds
				if (key === 'geoId') return
				// Recursively clean
				const cleanedVal = this.cleanData(value[key])
				if (cleanedVal !== undefined) {
					cleanedObj[key] = cleanedVal
				}
			})
			// If the object has no own properties, return undefined.
			return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined
		}

		return value
	}

	/**
	 * Simply exports the result list as JSON.
	 */
	private exportToJSON(): any {
		// Clean data for nicer export, removes empty arrays and objects
		const cleanedResultList = this.cleanData(this.resultList)
		return cleanedResultList
	}

	/**
	 * Converts the result list to CSV format.
	 */
	private exportToCSV(): string {
		const settingsStore = useSettingsStore()
		const impactCategory =
			settingsStore.calculationSettings.standardImpactCategory

		// Clean data first and then remove items without data
		const cleanedResultList: ResultList = this.cleanData(
			this.resultList
		).filter((item) => item.data)
		const rows: string[] = []

		const emissionKeys = new Set<string>()
		const quantityKeys = new Set<string>()
		let maxDepth = 2

		// Helper to ensure we get no commas or other disturbing data into csv
		const sanitize = (value: any): string => {
			if (value == null) return ''
			return value.toString().replace(/,/g, '')
		}

		// Collect keys and find max depth
		const collectKeysAndDepth = (group: GroupedResults, depth: number) => {
			maxDepth = Math.max(maxDepth, depth)
			// Add headers for quantity
			if (group.quantity && typeof group.quantity === 'object') {
				Object.keys(group.quantity).forEach((key) =>
					quantityKeys.add(sanitize(key))
				)
			}
			// Add headers for emissions
			if (group.data?.emission?.[impactCategory]) {
				Object.keys(group.data.emission[impactCategory]).forEach((key) =>
					emissionKeys.add(sanitize(key))
				)
			}
			// Recursively search to get max depth and any nested headers
			if (Array.isArray(group.nested)) {
				for (const nestedGroup of group.nested) {
					collectKeysAndDepth(nestedGroup, depth + 1)
				}
			}
		}

		// Start the recursive header and depth search
		for (const resultItem of cleanedResultList) {
			for (const group of resultItem.data) {
				collectKeysAndDepth(group, 2)
			}
		}

		const quantityCols = Array.from(quantityKeys)
		const emissionCols = Array.from(emissionKeys)

		// Add headers to document
		const levelHeaders = Array.from(
			{ length: maxDepth },
			(_, i) => `Level ${i + 1}`
		)
		const header = [...levelHeaders, ...quantityCols, ...emissionCols]
		rows.push(header.join(','))

		// Recursive flattening
		const flattenGroupData = (group: GroupedResults, hierarchy: string[]) => {
			const row: string[] = []
			const levels = [...hierarchy, group.parameter]

			// Pad levels to match max depth
			while (levels.length < maxDepth) levels.push('')

			// Sanitize each level to remove commas
			const sanitizedLevels = levels.slice(0, maxDepth).map(sanitize)
			row.push(...sanitizedLevels)

			for (const key of quantityCols) {
				const value = group.quantity?.[key] ?? ''
				row.push(sanitize(value))
			}

			for (const stage of emissionCols) {
				const value = group.data?.emission?.[impactCategory]?.[stage] ?? ''
				row.push(sanitize(value))
			}

			rows.push(row.join(','))

			if (Array.isArray(group.nested)) {
				for (const nested of group.nested) {
					flattenGroupData(nested, [...hierarchy, group.parameter])
				}
			}
		}

		for (const resultItem of cleanedResultList) {
			for (const group of resultItem.data) {
				flattenGroupData(group, [resultItem.parameter])
			}
		}

		return rows.join('\n')
	}

	/**
	 * Exports the data to Excel format, for now this is just csv as excel blob.
	 * TODO: More rich excel exports
	 */
	private exportToExcel(): Blob {
		const csv = this.exportToCSV()
		return new Blob([csv], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		})
	}

	/**
	 * Creates a downloadable file in the browser.
	 * @param content The file content, either as a string or Blob.
	 * @param filename The name of the file to download.
	 * @param mimeType The MIME type of the file.
	 */
	private downloadFile(
		content: string | Blob,
		filename: string,
		mimeType: string
	): void {
		let blob: Blob
		if (typeof content === 'string') {
			blob = new Blob([content], { type: mimeType })
		} else {
			blob = content
		}
		saveAs(blob, filename)
	}
}
