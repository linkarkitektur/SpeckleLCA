import type { ImpactCategoryKey, LifeCycleStage } from "lcax";
import type { GeometryObject } from "./GeometryObject";

/**
 * Project interface, stores all geometry and metadata of the project.
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
 * Results are stored as Impact Category, Life Cycle Stage then emission value
 * ID and date is just for documentation.
 */
export interface Results {
    id: string; // Run ID for results.
    date: Date; 
    emission: {
        [impactCategory: string]: {
            [lifeCycleStage: string]: number
        };
    }; // GWP -> A1A3 -> Co2
}
