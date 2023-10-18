import type { GeometryObject } from "./GeometryObject";
import type { Results } from "./Material";

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