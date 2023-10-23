import type { Unit, EPD, Assembly } from "lcax";
import type { Results } from "./Project";

/*
 * Base geometry object.
 */
export interface GeometryObject {
    id: string; // UUID
    name: string;
    URI?: string; // Link to geometry.
    quantity: {
        [k in Unit]: number;
    };
    material?: EPD | Assembly;
    results?: Results[]; // List of results if multiple runs are made.
    parameters?: {
        [k: string]: string;
    };
};