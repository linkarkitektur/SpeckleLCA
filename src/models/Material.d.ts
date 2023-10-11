//Hold material and emission information
//Based on EPDx and LCAx https://github.com/ocni-dtu/lcax
interface Material {
    id: string;
    name: string;
    emmisions: Map<Unit, 
        Map<ImpactCategories, 
            Map<LifeCycleStages, number>>>; //Unit -> GWP -> Stage -> Emission
    location?: string;
    subtype?: string; // generic, specific, industry
    type?: string; // Material type eg. Concrete, Wood etc
    url?: string; // https://www.database.com/data.xml?objectI
}

interface BuildUp extends Material {
    emmisions: Map<ImpactCategories, 
            Map<LifeCycleStages, number>>; //GWP -> Stage -> Emission
    
    unit: Unit; //Should always be in m2 or m3 as 1x1 or 1x1x1
    buildUp: [
        {
            material: Material;
            unit: Unit; 
            factor?: number; //If needed to convert from material Unit to m2 or m3
        }
    ]
}

interface Results {
    id: string; //run id for results
    date: Date; 
    emission: Map<ImpactCategories, 
        Map<LifeCycleStages, number>>; //gwp -> A1A3 -> co2 
}

  