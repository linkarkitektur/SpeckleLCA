import type { 
	LifeCycleStage, 
	ImpactCategoryKey, 
	Assembly as LcaxAssembly,
	Product as LcaxProduct 
} from 'lcax'
import type { FilterList } from './filters'

// Material and Assembly interfaces

export enum Source {
  LCAbyg,
  Organisation,
  Revalu,
  ECOPortal,
}


export type Emission = Partial<{
	[impactCategory in ImpactCategoryKey]: 
		LifeCycleStageEmission
}>

export type LifeCycleStageEmission = {
	[lifecycleStage in LifeCycleStage]: number
}

/**
 * Product interface, extends LcaxProduct and adds emission data
 */
export interface Product extends LcaxProduct {
  emission: Emission
  source: Source
}

/**
 * Assembly interface, extends LcaxAssembly and adds emission data and replaces products with local one
 */
export interface Assembly extends Omit<LcaxAssembly, 'products'> {
	products: Record<string, Product>
	emission: Emission
}

/**
 * Mapping step used in saving and restoring mappings
 */
export interface MappingStep {
	filterId: string
	nestedGroupId: string
	material: Product | Assembly
}

/**
 * Mapping interface, stores all metadata of the mapping.
 * Keeps a list of all filters so we dont have to cross reference with relationships
 */
export interface Mapping {
  id: string
  name: string
	filters: FilterList[]  
	steps: MappingStep[]
}

/**
 * Filter parameters for material and assembly list.
 */
export interface MaterialFilterParam {
	name: string,
	selected: boolean,
	filterParamter: string
}

/**
 * Sorting option for material and assembly list.
 */
export interface MaterialSortingOption {
	parameter: string
	direction: string
}

/**
 * Units for materials and assemblies.
 */
export type MetricUnits = "m" | "m2" | "m3" | "pcs" | "kg" | "l" | "tonnes"

/**
 * Extended impact categories for application
 * Array of possible impact categories to use, increase as needed
 */
export type ExtendedImpactCategoryKey = 'gwp-total' | 'gwp-fossil' | 'gwp-biogenic' | 'gwp-LULUC' | ImpactCategoryKey
export const extendedImpactCategoryKeys: ExtendedImpactCategoryKey[] = [
  'gwp',
  'gwp-total',
  'gwp-fossil',
  'gwp-biogenic',
  'gwp-LULUC',
  'odp',
  'ap',
  'pocp',
] as const


/**
 * BASAB codes for buildingParts
 * TODO: Find a better place to store these.
 */
export const BSAB96 = [
  {
    name: '0 SANERING OCH RIVNING',
    children: [
      { name: '00 Sammansatta' },
      { name: '01 Demontoring' },
      { name: '02 Sanering och lätt rivning' },
      { name: '03 Tung rivning' },
      { name: '04 Efterlagning' },
      { name: '06 Håltagning' },
      { name: '07 Arbeten för installationer' },
    ],
  },
  {
    name: '1 MARK',
    children: [
      { name: '10 Sammansatta' },
      { name: '11 Röjning, rivning och flyttning' },
      { name: '12 Schakter, fyllning' },
      { name: '13 Markförstärkning, dränering' },
      { name: '15 Ledningar, kulvertar, tunnlar' },
      { name: '16 Vägar, planer' },
      { name: '17 Trädgård' },
      { name: '18 Markrutt, Stödmurar, komplementbyggnader' },
      { name: '19 Mark övrigt' },
    ],
  },
  {
    name: '2. HUSUNDERBYGGNAD',
    children: [
      { name: '20 Sammansatta' },
			{ name: '22 Schakt, fyllning' },
      { name: '23 Markförstärkning, dränering' },
      { name: '24 Grundkonstruktioner' },
      { name: '25 Kulvertar, tunnlar' },
      { name: '26 Garage' },
      { name: '27 Platta på mark' },
      { name: '28 Huskomplementering, husunderbyggnad' },
      { name: '29 Husunderbyggnad övrigt' },
    ],
  },
  {
    name: '3. STOMME',
    children: [
      { name: '30 Sammansatta' },
      { name: '31 Stomme - väggar' },
      { name: '32 Stomme - pelare' },
      { name: '33 Prefab' },
      { name: '34 Stomme bjälklag, balkar' },
      { name: '35 Smide' },
      { name: '36 Stomme, trappor, hisschakt' },
      { name: '37 Samverkande takstomme' },
      { name: '38 Huskomplementering, stomme' },
      { name: '39 Stomme övrigt' },
    ],
  },
  {
    name: '4. YTTERTAK',
    children: [
      { name: '40 Sammansatta' },
      { name: '41 Tak-stomme' },
      { name: '42 Taklagskomplettering' },
      { name: '43 Taktäckning' },
      { name: '44 Takfot och gavlar' },
      { name: '45 Öppningskompletteringar, yttertak' },
      { name: '46 Plåt' },
      { name: '47 Terasstak, altaner' },
      { name: '48 Huskomplettering, yttertak' },
      { name: '49 Yttertak övrigt' },
    ],
  },
  {
    name: '5. FASADER',
    children: [
      { name: '50 Sammansatta' },
      { name: '51 Stomkomplement, utfackning' },
      { name: '53 Fasadbeklädnad' },
      { name: '55 Fönster, dörrar, partier, portar' },
      { name: '58 Huskomplettering ytterväggar' },
      { name: '59 Ytterväggar övrigt' },
    ],
  },
  {
    name: '6. STOMKOMPL. RUMSBILDN.',
    children: [
      { name: '60 Sammansatta' },
      { name: '61 Insida yttervägg' },
      { name: '62 Undergolv' },
      { name: '63 Innerväggar' },
      { name: '64 Innertak' },
      { name: '65 Invändiga dörrar, glaspartier' },
      { name: '66 Invändiga trappor' },
      { name: '68 Huskomplettering, rumsbildning' },
      { name: '69 Rumsbildning övrigt' },
    ],
  },
  {
    name: '7. INVÄNDIGA YTSKIKT RUMSKOMPL.',
    children: [
      { name: '70 Sammansatta' },
      { name: '72 Ytskikt golv, sporer' },
      { name: '73 Ytskikt vägg' },
      { name: '74 Ytskikt tak, undertak' },
      { name: '75 Målning' },
      { name: '76 Vitvaror' },
      { name: '77 Skåpsinsikter' },
      { name: '78 Rumsinsikter' },
      { name: '79 Rumsinsikter övrigt' },
    ],
  },
  {
    name: '8 INSTALLATIONER',
    children: [
      { name: '80 Sammansatta' },
      { name: '82 Process' },
      { name: '83 Storkök' },
      { name: '84 Sanitet, värme' },
      { name: '85 Kyla, luft' },
      { name: '86 El' },
      { name: '87 Transport' },
      { name: '88 Styr och regler' },
      { name: '89 Installationer övrigt' },
    ],
  },
  {
    name: '9. GEMENSAMMA ARBETEN',
    children: [
      { name: '90 Gemensamma arbeten sammansatta' },
      { name: '91 Gemensamma arbeten' },
    ],
  },
]