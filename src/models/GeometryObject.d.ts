type RetriveValue = (unit: Unit) => number;

interface GeometryObject {
    id: string; // uuid 
    Name: string;
    URI?: string; // Link to geometry
    Value: Map<Unit, RetriveValue>; //This should be the quantity
    material?: Material | BuildUp;
    results?: Results[]; //List of results if multiple runs are made
};