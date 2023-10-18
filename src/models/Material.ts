//Hold material and emission information
import type { ImpactCategoryKey, LifeCycleStage, Unit, Transport, SubType, Standard, Conversion } from "lcax";

/**
 * Material or EPD interface
 * Emissions are stored on unit, impactcategory and then stage
 */
export interface Material {
    id: string;
    name: string;
    emmisions: Map<Unit, 
        Map<ImpactCategoryKey, 
            Map<LifeCycleStage, number>>>; // eg Unit -> GWP -> a1a3 -> kg co2
    location?: string;
    subtype?: SubType; // generic, specific, industry
    type?: string; // Material type eg. Concrete, Wood etc
    standard?: Standard;
    url?: string; // https://www.database.com/data.xml?objectI
    transport?: Transport;
}

/**
 * Extended Material interface with a fixed unit and a series of materials that 
 * creates the buildup
 */
export interface BuildUp extends Material {
    unit: Unit; //Should always be in m2 or m3 as 1x1 or 1x1x1
    buildUp: [
        {
            material: Material;
            unit: Unit; 
            conversion?: Conversion; //If needed to convert from material Unit to m2 or m3
        }
    ]
}

/**
 * Results are stored as Impactcategory, Lifecyclestage then emission value
 * id and date is just for documentation
 */
export interface Results {
    id: string; //run id for results
    date: Date; 
    emission: Map<ImpactCategoryKey, 
        Map<LifeCycleStage, number>>; //gwp -> A1A3 -> co2 
}

  