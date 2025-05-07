export interface BoverketData {
	ResourceId: number
	SourceVersion: string
	ProductSystemId: number
	ProductSystemResourceId: string
	Location: string
	Publisher: string
	Version: string
	Copyright: boolean
	TimeStamp: string
	Name: string
	Names: {
		EN: string
		SV: string
	}
	StdName: string
	StdDescription: string
	StdCalc: string
	UseAdviceForDataSet: string
	TechnologicalApplicability: string
	GeneralComment: string
	Synonyms: string
	TechnologyDescriptionAndIncludedProcesses: string
	GeographicalRepresentativenessDescription: string
	TimeRepresentativenessDescription: string
	UpdatedTime: string
	InventoryUnit: string
	CalculatedBiogenicCarbon: number
	ConservativeDataConversionFactor: number
	WasteFactor: number
	RefServiceLifeNormal: string
	RefServiceLifeNormalComment: string
	ComparativeProperty: string
	A4ValueBackground: string
	AnnualSupplyOrProductionVolume: string
	Conversions: {
		Field: string
		Unit: string
		Value: number
	}[]
	DataItems: {
		PropertyId: number
		PropertyName: string
		PropertyCode: string
		PropertyTypeId: number
		PropertyUnitCode: string
		DataValueItems: {
			DataModuleCode: string
			Value: number
		}[]
	}[]
	Categories: {
		ClassificationType: string
		Code?: string
		Text: string
	}[]
	TransportItems: {
		NameId: number
		Name: string
		GenericDistance: number
		TransportTypeId: number
		TransportTypeName: string
		EnergyUseId: number
		EnergyUseName: string
		EnergyUseValue: number
		FuelTypeId: number
		FuelTypeName: string
		FuelTypeResourceId: number
	}[]
}
