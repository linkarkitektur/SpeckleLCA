export interface BuildingCodeItem {
  name: string
  selected?: boolean
  children?: BuildingCodeItem[]
}

/**
 * BASAB codes for buildingParts
 */
export const BSAB96: BuildingCodeItem[] = [
  {
    name: '0 SANERING OCH RIVNING',
    children: [
      { name: '00 Sammansatta', selected: false },
      { name: '01 Demontoring', selected: false },
      { name: '02 Sanering och lätt rivning', selected: false },
      { name: '03 Tung rivning', selected: false },
      { name: '04 Efterlagning', selected: false },
      { name: '06 Håltagning', selected: false },
      { name: '07 Arbeten för installationer', selected: false },
    ],
  },
  {
    name: '1 MARK',
    children: [
      { name: '10 Sammansatta', selected: false },
      { name: '11 Röjning, rivning och flyttning', selected: false },
      { name: '12 Schakter, fyllning', selected: false },
      { name: '13 Markförstärkning, dränering', selected: false },
      { name: '15 Ledningar, kulvertar, tunnlar', selected: false },
      { name: '16 Vägar, planer', selected: false },
      { name: '17 Trädgård', selected: false },
      { name: '18 Markrutt, Stödmurar, komplementbyggnader', selected: false },
      { name: '19 Mark övrigt', selected: false },
    ],
  },
  {
    name: '2. HUSUNDERBYGGNAD',
    children: [
      { name: '20 Sammansatta', selected: false },
			{ name: '22 Schakt, fyllning', selected: false },
      { name: '23 Markförstärkning, dränering', selected: false },
      { name: '24 Grundkonstruktioner', selected: false },
      { name: '25 Kulvertar, tunnlar', selected: false },
      { name: '26 Garage', selected: false },
      { name: '27 Platta på mark', selected: false },
      { name: '28 Huskomplementering, husunderbyggnad', selected: false },
      { name: '29 Husunderbyggnad övrigt', selected: false },
    ],
  },
  {
    name: '3. STOMME',
    children: [
      { name: '30 Sammansatta', selected: false },
      { name: '31 Stomme - väggar', selected: false },
      { name: '32 Stomme - pelare', selected: false },
      { name: '33 Prefab', selected: false },
      { name: '34 Stomme bjälklag, balkar', selected: false },
      { name: '35 Smide', selected: false },
      { name: '36 Stomme, trappor, hisschakt', selected: false },
      { name: '37 Samverkande takstomme', selected: false },
      { name: '38 Huskomplementering, stomme', selected: false },
      { name: '39 Stomme övrigt', selected: false },
    ],
  },
  {
    name: '4. YTTERTAK',
    children: [
      { name: '40 Sammansatta', selected: false },
      { name: '41 Tak-stomme', selected: false },
      { name: '42 Taklagskomplettering', selected: false },
      { name: '43 Taktäckning', selected: false },
      { name: '44 Takfot och gavlar', selected: false },
      { name: '45 Öppningskompletteringar, yttertak', selected: false },
      { name: '46 Plåt', selected: false },
      { name: '47 Terasstak, altaner', selected: false },
      { name: '48 Huskomplettering, yttertak', selected: false },
      { name: '49 Yttertak övrigt', selected: false },
    ],
  },
  {
    name: '5. FASADER',
    children: [
      { name: '50 Sammansatta', selected: false },
      { name: '51 Stomkomplement, utfackning', selected: false },
      { name: '53 Fasadbeklädnad', selected: false },
      { name: '55 Fönster, dörrar, partier, portar', selected: false },
      { name: '58 Huskomplettering ytterväggar', selected: false },
      { name: '59 Ytterväggar övrigt', selected: false },
    ],
  },
  {
    name: '6. STOMKOMPL. RUMSBILDN.',
    children: [
      { name: '60 Sammansatta', selected: false },
      { name: '61 Insida yttervägg', selected: false },
      { name: '62 Undergolv', selected: false },
      { name: '63 Innerväggar', selected: false },
      { name: '64 Innertak', selected: false },
      { name: '65 Invändiga dörrar, glaspartier', selected: false },
      { name: '66 Invändiga trappor', selected: false },
      { name: '68 Huskomplettering, rumsbildning', selected: false },
      { name: '69 Rumsbildning övrigt', selected: false },
    ],
  },
  {
    name: '7. INVÄNDIGA YTSKIKT RUMSKOMPL.',
    children: [
      { name: '70 Sammansatta', selected: false },
      { name: '72 Ytskikt golv, sporer', selected: false },
      { name: '73 Ytskikt vägg', selected: false },
      { name: '74 Ytskikt tak, undertak', selected: false },
      { name: '75 Målning', selected: false },
      { name: '76 Vitvaror', selected: false },
      { name: '77 Skåpsinsikter', selected: false },
      { name: '78 Rumsinsikter', selected: false },
      { name: '79 Rumsinsikter övrigt', selected: false },
    ],
  },
  {
    name: '8 INSTALLATIONER',
    children: [
      { name: '80 Sammansatta', selected: false },
      { name: '82 Process', selected: false },
      { name: '83 Storkök', selected: false },
      { name: '84 Sanitet, värme', selected: false },
      { name: '85 Kyla, luft', selected: false },
      { name: '86 El', selected: false },
      { name: '87 Transport', selected: false },
      { name: '88 Styr och regler', selected: false },
      { name: '89 Installationer övrigt', selected: false },
    ],
  },
  {
    name: '9. GEMENSAMMA ARBETEN',
    children: [
      { name: '90 Gemensamma arbeten sammansatta', selected: false },
      { name: '91 Gemensamma arbeten', selected: false },
    ],
  },
]

/**
 * Generic building codes
 */
export const generic: BuildingCodeItem[] = [
  {
    name: "1. Substructure",
    children: [
      { name: "1.1 Foundations", selected: false },
      { name: "1.2 Basement Construction" }
    ]
  },
  {
    name: "2. Superstructure",
    children: [
      { name: "2.1 Structural Frame", selected: false },
      { name: "2.2 External Walls", selected: false },
      { name: "2.3 Internal Walls", selected: false },
      { name: "2.4 Upper Floors", selected: false },
      { name: "2.5 Roof Structure", selected: false }
    ]
  },
  {
    name: "3. Finishes",
    children: [
      { name: "3.1 Wall Finishes", selected: false },
      { name: "3.2 Floor Finishes", selected: false },
      { name: "3.3 Ceiling Finishes", selected: false }
    ]
  },
  {
    name: "4. Fittings and Furnishings",
    children: [
      { name: "4.1 Fixed Furniture", selected: false },
      { name: "4.2 Movable Furniture", selected: false }
    ]
  },
  {
    name: "5. Building Services",
    children: [
      { name: "5.1 Heating, Ventilation, and Air Conditioning (HVAC)", selected: false },
      { name: "5.2 Electrical Installations", selected: false },
      { name: "5.3 Plumbing Installations", selected: false },
      { name: "5.4 Fire Protection Systems", selected: false }
    ]
  },
  {
    name: "6. External Works",
    children: [
      { name: "6.1 Landscaping", selected: false },
      { name: "6.2 Site Infrastructure", selected: false }
    ]
  }
]

/**
 * List of building codes
 * Add new codes here
 */
export const buildingCodes: { [key:string]: BuildingCodeItem[] } = {
  BSAB96: BSAB96,
  generic: generic
}