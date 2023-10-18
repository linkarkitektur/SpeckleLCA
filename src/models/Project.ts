//Hold material and emission information
import type { ImpactCategoryKey, LifeCycleStage } from "lcax";
import type { GeometryObject } from "./GeometryObject";

/**
 * Project interface, stores all geometry and metadata of the project
 */
export interface Project {
    name: string;
    description: string;
    id: string;
    geometry: GeometryObject[];
    sqm?: number;
    projectType?: string;
    source?: string;
    location?: string;
    results?: Results[];
}

/**
 * Results are stored as Impactcategory, Lifecyclestage then emission value
 * id and date is just for documentation
 */
export interface Results {
    id: string; //run id for results
    date: Date; 
    emission: {
        [impactCategory: string]: {
            [lifeCycleStage: string]: number
        };
    }; //gwp -> A1A3 -> co2
}
