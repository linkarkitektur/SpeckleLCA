import type { Unit } from "lcax";
import crypto from 'node:crypto';
import { FilterRegistry, createStandardFilters } from '@/models/Filters';
import type { Group } from '@/models/Filters';
import type { GeometryObject } from "@/models/GeometryObject";
import { expect, test } from "vitest";

test("useEqualityFilter", () => {
    const exampleRegistry = new FilterRegistry();

    let geoObject: GeometryObject = {
    name: "Wall1",
    quantity: new Map<Unit, number>([["M2", 23]]),
    id: crypto.randomUUID(),
    parameters: new Map<string, string>([["testField", "testValue"]]),
    };

    expect(geoObject.name).toBe("Wall1");

    let geoObject2: GeometryObject = {
    name: "Wall1",
    quantity: new Map<Unit, number>([["M2", 23]]),
    id: crypto.randomUUID(),
    parameters: new Map<string, string>([["testField", "notTestValue"]]),
    };

    expect(geoObject2.name).toBe("Wall1");

    let group: Group = {
    id: crypto.randomUUID(),
    name: "",
    path: "",
    elements: [geoObject, geoObject2],
    };

    expect(group.elements.length).toBe(2);

    createStandardFilters(exampleRegistry);

    let testGroup: [Group];
    testGroup = exampleRegistry.callFilter("equalsFilter", [group], "testField", "testValue");  

    expect(testGroup.length).toBe(2);
    expect(testGroup[0].elements.length).toBe(1);
})