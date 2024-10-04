import type { LifeCycleStageEmission } from "@/models/material"

/**
 * Enum for countries to search from
 */
export enum country {
  Sweden = "Sweden",
  Norway = "Norway",
  Denmark = "Denmark",
  Finland = "Finland",
  Germany = "Germany",
  Europe = "Europe",
}

/**
 * Reduced list for common use cases
 */
export enum StandardBuildingMaterialType {
  AluminiumElements = "Aluminium elements",
  Asphalt = "Asphalt",
  BioBasedInsulation = "Bio-based insulation",
  Boards = "Boards",
  Bricks = "Bricks",
  Cement = "Cement",
  Concrete = "Concrete",
  ConcreteBlocks = "Concrete blocks",
  CurtainWall = "Curtain wall",
  Doors = "Doors",
  ExteriorSubstrate = "Exterior Substrate",
  FibreCementBoard = "Fibre Cement board",
  FramesAndProfiles = "Frames and profiles",
  Generic = "Generic",
  Gypsum = "Gypsum",
  Hemp = "Hemp",
  Infill = "Infill",
  MineralWool = "Mineral wool",
  ModifiedWood = "Modified wood",
  Mortar = "Mortar",
  PaintExterior = "Paint (Exterior)",
  PaintInterior = "Paint (Interior)",
  Plasterboards = "Plasterboards",
  PlasticFlooring = "Plastic flooring",
  PlasticProfiles = "Plastic profiles",
  Primer = "Primer",
  ReinforcementSteel = "Reinforcement steel",
  RoofingMembranes = "Roofing membranes",
  RubberFlooring = "Rubber flooring",
  Stones = "Stones",
  StructuralTimber = "Structural timber",
  TextileFlooring = "Textile flooring",
  Tiles = "Tiles",
  TimberBoards = "Timber Boards",
  TimberElements = "Timber Elements",
  TimberFlooring = "Timber flooring",
  WaterproofingMembranes = "Waterproofing membranes",
  WindowFittings = "Window fittings",
  Windows = "Windows"
}

/**
 * Enum for all Building Material types
 */
export enum FullBuildingMaterialType {
  AccessoriesForWindowsWallingAndDoors = "Accessories for windows, walling and doors",
  Aggregates = "Aggregates",
  AirConditioningAndVentilationSystem = "Air conditioning and ventilation system",
  AluminiumElements = "Aluminium elements",
  Asphalt = "Asphalt",
  BioBasedInsulation = "Bio-based insulation",
  Boards = "Boards",
  Bricks = "Bricks",
  CalciumSilicateInsulation = "Calcium Silicate Insulation",
  Cement = "Cement",
  Clay = "Clay",
  CompositeBoards = "Composite Boards",
  Concrete = "Concrete",
  ConcreteBlocks = "Concrete blocks",
  CopperElements = "Copper elements",
  CurtainWall = "Curtain wall",
  DaylightSystemsAndSmokeOrHeatControlSystems = "Daylight systems and smoke or heat control systems",
  DaylightSystemsAndSmokeHeatControlSystems = "Daylight systems and smoke/heat control systems",
  Doors = "Doors",
  DriveSystemWindowsAndDoors = "Drive system windows and doors",
  ElectricalFireProtection = "Electrical fire protection",
  ElectricalSystem = "Electrical system",
  EndOfLifeProcesses = "End-of-life processes",
  EnergyCarrierDeliveryFreeUser = "Energy carrier - delivery free user",
  Escalator = "Escalator",
  ExpandedPerlit = "Expanded perlit",
  ExpandedPolystyreneEPS = "Expanded polystyrene (EPS)",
  ExteriorSubstrate = "Exterior Substrate",
  ExternalThermalInsulationCompositeSystemETICS = "External Thermal insulation composite system (ETICS)",
  ExtrudedPolystyreneXPS = "Extruded polystyrene (XPS)",
  FibreCementBoard = "Fibre Cement board",
  FireProtectionCoating = "Fire protection coating",
  FireProtectionDevices = "Fire protection devices",
  FoilsAndFleeces = "Foils and fleeces",
  FramesAndProfiles = "Frames and profiles",
  Generic = "Generic",
  Gypsum = "Gypsum",
  HeatingSystems = "Heating systems",
  Hemp = "Hemp",
  Infill = "Infill",
  InsulationFoam = "Insulation foam",
  IronElements = "Iron elements",
  LeadElements = "Lead elements",
  Lime = "Lime",
  MineralWool = "Mineral wool",
  ModifiedWood = "Modified wood",
  Mortar = "Mortar",
  Others = "Others",
  PaintExterior = "Paint (Exterior)",
  PaintInterior = "Paint (Interior)",
  PassengerTransportPersonKm = "Passenger transport [person km]",
  Pigments = "Pigments",
  Plasterboards = "Plasterboards",
  PlasticFlooring = "Plastic flooring",
  PlasticProfiles = "Plastic profiles",
  Primer = "Primer",
  ProcessesAtBuildingSite = "Processes at building site",
  ReinforcementSteel = "Reinforcement steel",
  RendersAndPlasters = "Renders and plasters",
  Resin = "Resin",
  RigidFoam = "Rigid foam",
  RigidFoamBoards = "Rigid foam boards",
  RoofingMembranes = "Roofing membranes",
  RubberFlooring = "Rubber flooring",
  SanitaryWare = "Sanitary ware",
  Screed = "Screed",
  SealingMaterials = "Sealing materials",
  SiliciumDioxideBased = "Silicium dioxide based",
  SolarPanel = "Solar Panel",
  StainlessSteelTubes = "Stainless steel tubes",
  SteelSheets = "Steel sheets",
  Stones = "Stones",
  StructuralTimber = "Structural timber",
  SystemCompositions = "System compositions",
  TextileFlooring = "Textile flooring",
  Tiles = "Tiles",
  TimberBoards = "Timber Boards",
  TimberElements = "Timber Elements",
  TimberFlooring = "Timber flooring",
  TransportOfGoodsTKm = "Transport of goods [t km]",
  TransportationSystem = "Transportation system",
  TreatmentAndCoatingOfMetals = "Treatment and coating of metals",
  Tubes = "Tubes",
  Use = "Use",
  VarnishesAndStains = "Varnishes and stains",
  WaterproofingMembranes = "Waterproofing membranes",
  WindowFittings = "Window fittings",
  Windows = "Windows"
}

export interface RevaluData {
  id: string
  location: string
  version: string
  registration_number: string
  name: string
  manufacturer: string
  valid_until: number
  valid_from: number
  declared_unit: string
  thickness: number | null
  grammage: number | null
  gross_density: number | null
  bulk_density: number | null
  linear_density: number | null
  standard: string
  subtype: string
  version_last_update_date: string
  lambda: number | null
  u_value: number | null
  r_value: number | null
  source: SourceInfo
  gwp: LifeCycleStageEmission
  gwp_fossil: LifeCycleStageEmission
  gwp_biogenic: LifeCycleStageEmission
  gwp_luluc: LifeCycleStageEmission
  fw: LifeCycleStageEmission
  pert: LifeCycleStageEmission
  penrt: LifeCycleStageEmission
  energy_mix_percentage: LifeCycleStageEmission
  custom_attribute: any 
  additional_data: AdditionalData
  all_documents: Document[]
  data_quality_warnings: any | null 
  certificates: any[]
}

interface SourceInfo {
  name: string
  url: string
}

interface AdditionalData {
  epd_pdf_url: string
}

interface Document {
  document_type: string
  document_url: string
}