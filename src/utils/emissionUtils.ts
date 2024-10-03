import type { GeometryObject } from '@/models/geometryObject'
import type { Product } from '@/models/material'
import type { Emissions } from '@/models/project'

 /**
 * Calculate the emissions of the current geo and attach the results to the geo
 * @param geo
 * @returns
 */
 export function calculateEmissions(geo: GeometryObject): boolean {
  if (!geo.material) return false

  const emissions = { gwp: {} }
  const material = geo.material
  let success = false

  if (isAssembly(material)) {
    success = processAssembly(material, geo, emissions)
  } else {
    success = processEPD(material as Product, geo, emissions)
  }

  if (success) {
    addEmissionsToGeo(geo, emissions)
  }

  return success
}

/**
 * Checks if material is assembly or product
 * @param material 
 * @returns 
 */
function isAssembly(material: any): material is { materials?: Product[] } {
  return material instanceof Object && 'isAssembly' in material
}

/**
 * Prepare function for aseemblies so it can be calculated using same method as EPDs
 * @param material 
 * @param geo 
 * @param emissions 
 * @param impactCategory 
 * @returns 
 */
function processAssembly(
  material: { materials?: Product[] },
  geo: GeometryObject,
  emissions: Emissions,
  impactCategory: string = 'gwp'
): boolean {
  if (!material.materials) return false

  for (const mat of material.materials) {
    if (mat.emission[impactCategory]) {
      calculateMaterialEmissions(mat, geo, emissions)
    }
  }
  return true
}

/**
 * Sanity check so that we have everything needed to calculate emissions
 * @param material 
 * @param geo 
 * @param emissions 
 * @param impactCategory TODO make this flexible
 * @returns 
 */
function processEPD(
  material: Product,
  geo: GeometryObject,
  emissions: Emissions,
  impactCategory: string = 'gwp'
): boolean {
  if (material.emission[impactCategory]) {
    calculateMaterialEmissions(material, geo, emissions)
    return true
  }
  return false
}

/**
 * Calculation method, goes through the material and calculates the emissions
 * @param mat 
 * @param geo 
 * @param emissions 
 * @param impactCategory 
 */
function calculateMaterialEmissions(
  mat: Product,
  geo: GeometryObject,
  emissions: Emissions,
  impactCategory: string = 'gwp'
) {
  for (const phase in mat.emission[impactCategory]) {
    const value = mat.emission[impactCategory][phase]
    if (value !== null && !isNaN(Number(value))) {
      const emissionValue =
        parseFloat(value as string) * geo.quantity[mat.unit]
      emissions.gwp[phase] = (emissions.gwp[phase] || 0) + emissionValue
    }
  }
}

/**
 * Attached emissions to Geo object
 * @param geo 
 * @param emissions 
 */
function addEmissionsToGeo(
  geo: GeometryObject,
  emissions: Emissions
) {
  const result = {
    id: crypto.randomUUID(),
    date: new Date(),
    emission: emissions,
  }
  if (geo.results) {
    geo.results.push(result)
  } else {
    geo.results = [result]
  }
}