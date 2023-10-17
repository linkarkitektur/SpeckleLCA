import { ImpactCategoryKey } from "lcax";

interface Project {
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