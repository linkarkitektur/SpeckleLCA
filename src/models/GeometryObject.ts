import type { Unit } from "lcax";
import type { Material, BuildUp, Results } from "./Material";

export interface GeometryObject {
    id: string; // uuid 
    Name: string;
    URI?: string; // Link to geometry
    quantity: Map<Unit, number>; // Quantities with unit
    material?: Material | BuildUp;
    results?: Results[]; //List of results if multiple runs are made
    parameters?: Map<string, string>; // This can be read directly from the URI or stored here when importing geometry
};