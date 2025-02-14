import { APISource } from '@/models/material'

import type { GeometryObject } from '@/models/geometryObject'
import type { Group } from '@/models/filters'
import type { Product, Assembly, } from '@/models/material'

export const mockObjects: Record<string, GeometryObject> = {
  simple: {
    id: 'test-id-1',
    name: 'Simple Object',
    quantity: {
      m3: 10,
      kg: 100
    },
    material: {
      id: 'concrete-id',
      name: 'Concrete',
      description: 'Ready-mix concrete',
      referenceServiceLife: 50,
      unit: 'm3',
      quantity: 1,
      results: {},
      metaData: null,
      type: 'product',
      source: APISource.ECOPortal,
      emission: {
        gwp: {
          a1a3: 100,
          a4: 10,
          a5: 0,
          b1: 0,
          b2: 0,
          b3: 0,
          b4: 0,
          b5: 0,
          b6: 0,
          b7: 0,
          c1: 0,
          c2: 0,
          c3: 0,
          c4: 5,
          d: 0
        }
      },
      transport: null,
      impactData: {
        epd: {
          id: 'epd-1',
          name: 'Concrete EPD',
          validUntil: '2025-01-01'
        }
      }
    } as Product,
    parameters: {
      type: 'wall',
      nestedValue: 'nestedValue'
    }
  },
  complex: {
    id: 'test-id-2',
    name: 'Complex Object',
    URI: 'speckle://objects/test',
    quantity: {
      m2: 50,
      m3: 25
    },
    material: {
      id: 'assembly-1',
      guid: 'e96258e3-737c-4701-9280-397ca6723582',
      name: 'Wall Assembly',
      description: 'Complex wall assembly',
      unit: 'm2',
      quantity: 1,
      category: 'walls',
      comment: null,
      classification: null,
      results: null,
      metaData: null,
      products: {
        'concrete-1': {
          id: 'concrete-1',
          name: 'Concrete',
          description: 'Structural concrete',
          referenceServiceLife: 50,
          unit: 'm3',
          quantity: 0.2,
          results: {},
          metaData: null,
          type: 'product',
          source: APISource.ECOPortal,
          emission: {
            gwp_total: {
              a1a3: 200,
              a4: 20,
              a5: 0,
              b1: 0,
              b2: 0,
              b3: 0,
              b4: 0,
              b5: 0,
              b6: 0,
              b7: 0,
              c1: 0,
              c2: 0,
              c3: 0,
              c4: 10,
              d: 0
            }
          },
          transport: null,
          impactData: {
            epd: {
              id: 'epd-2',
              name: 'Concrete EPD',
              validUntil: '2025-01-01'
            }
          }
        }
      },
      emission: {
        gwp_total: {
          a1a3: 250,
          a4: 25,
          a5: 0,
          b1: 0,
          b2: 0,
          b3: 0,
          b4: 0,
          b5: 0,
          b6: 0,
          b7: 0,
          c1: 0,
          c2: 0,
          c3: 0,
          c4: 12,
          d: 0
        }
      }
    } as Assembly,
    parameters: {
      type: 'floor',
      level: '1',
      nullValue: null,
      undefinedValue: null
    }
  },
  withCircular: {
    id: 'test-id-3',
    name: 'circular',
    quantity: {
      m: 5
    },
    parameters: {}
  },
  empty: {
    id: 'test-id-6',
    name: 'Empty',
    quantity: {},
    parameters: {}
  },
  withSpecialChars: {
    id: 'test-id-4',
    name: 'special',
    quantity: {},
    parameters: {
      'field.with.dots': 'value',
      'field-with-dashes': 'value2',
      'field with spaces': 'value3'
    }
  }
}

export const mockGroup: Group = {
  id: 'group1',
  name: 'TestGroup',
  path: ['root'],
  elements: [mockObjects.simple, mockObjects.complex]
}

export const mockInvalidObject: GeometryObject = {
  id: 'invalid1',
  parameters: null,
  name: null,
  quantity: null,
}

export const mockGroups = {
  empty: {
    id: 'empty',
    name: 'Empty',
    path: [],
    elements: []
  },
  single: {
    id: 'single',
    name: 'Single',
    path: ['root'],
    elements: [mockObjects.simple]
  },
  mixed: mockGroup
}

export const mockFilterValues = {
  equals: 'concrete',
  number: 42,
  nonExistent: 'missing'
}