import { APISource } from '@/models/materialModel'
import type { GeometryObject } from '@/models/geometryModel'
import type { Group } from '@/models/filterModel'
import type { Product, Assembly, Mapping } from '@/models/materialModel'
import type { ResponseObject, ResponseObjectStream, Version, ProjectDetails } from '@/models/speckleModel'

export const mockSpeckleObjects: ResponseObject[] = [
  {
    id: 'wall-1',
    data: {
      id: 'wall-1',
      data: [],
      speckle_type: 'Objects.BuiltElements.Wall',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Basic Wall 1',
      category: 'Walls',
      type: 'Basic Wall',
      code: 'W1',
      material: {
        name: 'Concrete'
      },
      area: 25,
      volume: 7.5,
      displayValue: null
    }
  },
  {
    id: 'wall-2',
    data: {
      id: 'wall-2',
      data: [],
      speckle_type: 'Objects.BuiltElements.Wall',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Basic Wall 2',
      category: 'Walls',
      type: 'Basic Wall',
      code: 'W1',
      material: {
        name: 'Concrete'
      },
      area: 30,
      volume: 9.0,
      displayValue: null
    }
  },
  {
    id: 'column-1',
    data: {
      id: 'column-1',
      data: [],
      speckle_type: 'Objects.BuiltElements.Column',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Round Column 1',
      category: 'Columns',
      type: 'Round Column',
      code: 'C1',
      material: {
        name: 'Concrete'
      },
      area: 12,
      volume: 2.5,
      displayValue: null
    }
  },
  {
    id: 'column-2',
    data: {
      id: 'column-2',
      data: [],
      speckle_type: 'Objects.BuiltElements.Column',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Square Column 1',
      category: 'Columns',
      type: 'Square Column',
      code: 'C2',
      material: {
        name: 'Concrete'
      },
      area: 16,
      volume: 3.2,
      displayValue: null
    }
  },
  {
    id: 'slab-1',
    data: {
      id: 'slab-1',
      data: [],
      speckle_type: 'Objects.BuiltElements.Floor',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Floor Slab 1',
      category: 'Floors',
      type: 'Floor Slab',
      code: 'F1',
      material: {
        name: 'Concrete'
      },
      area: 100,
      volume: 20,
      displayValue: null
    }
  },
  {
    id: 'slab-2',
    data: {
      id: 'slab-2',
      data: [],
      speckle_type: 'Objects.BuiltElements.Floor',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Floor Slab 2',
      category: 'Floors',
      type: 'Floor Slab',
      code: 'F1',
      material: {
        name: 'Concrete'
      },
      area: 120,
      volume: 24,
      displayValue: null
    }
  },
  {
    id: 'beam-1',
    data: {
      id: 'beam-1',
      data: [],
      speckle_type: 'Objects.BuiltElements.Beam',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Concrete Beam 1',
      category: 'Beams',
      type: 'Rectangular Beam',
      code: 'B1',
      material: {
        name: 'Concrete'
      },
      area: 8,
      volume: 1.8,
      displayValue: null
    }
  },
  {
    id: 'beam-2',
    data: {
      id: 'beam-2',
      data: [],
      speckle_type: 'Objects.BuiltElements.Beam',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Steel Beam 1',
      category: 'Beams',
      type: 'I-Beam',
      code: 'B2',
      material: {
        name: 'Steel'
      },
      area: 6,
      volume: 0.8,
      displayValue: null
    }
  },
  {
    id: 'window-1',
    data: {
      id: 'window-1',
      data: [],
      speckle_type: 'Objects.BuiltElements.Window',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Double Pane Window 1',
      category: 'Windows',
      type: 'Double Pane',
      code: 'WIN1',
      material: {
        name: 'Glass'
      },
      area: 4,
      volume: 0.12,
      displayValue: null
    }
  },
  {
    id: 'door-1',
    data: {
      id: 'door-1',
      data: [],
      speckle_type: 'Objects.BuiltElements.Door',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Entrance Door 1',
      category: 'Doors',
      type: 'Entrance Door',
      code: 'D1',
      material: {
        name: 'Wood'
      },
      area: 2.4,
      volume: 0.08,
      displayValue: null
    }
  },
  {
    id: 'roof-1',
    data: {
      id: 'roof-1',
      data: [],
      speckle_type: 'Objects.BuiltElements.Roof',
      applicationId: "revit",
      totalChildrenCount: 0,
      name: 'Flat Roof 1',
      category: 'Roofs',
      type: 'Flat Roof',
      code: 'R1',
      material: {
        name: 'EPDM'
      },
      area: 150,
      volume: 15,
      displayValue: null
    }
  }
]

export const mockSpeckleStream: ResponseObjectStream = {
  data: {
    stream: {
      object: {
        totalChildrenCount: mockSpeckleObjects.length,
        elements: {
          objects: mockSpeckleObjects
        }
      }
    }
  }
}

export const mockVersion: Version = {
  authorName: 'Test User',
  branchName: 'main',
  createdAt: new Date(),
  id: 'version-1',
  message: 'Test Version',
  referencedObject: 'object-1',
  sourceApplication: 'Revit'
}

export const mockProjectDetails: ProjectDetails = {
  stream: {
    commits: {
      items: [mockVersion],
      cursor: new Date(),
      totalCount: 1
    },
    id: 'stream-1',
    name: 'Test Project',
    updatedAt: new Date()
  }
}

export const mockProducts: Product[] = [
  {
    id: 'concrete-1',
    name: 'Ready-mix concrete',
    description: 'Standard concrete mix',
    referenceServiceLife: 50,
    unit: 'm3',
    quantity: 1,
    results: {},
    metaData: null,
    source: APISource.ECOPortal,
    lifespan: 50,
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
  },
  {
    id: 'steel-1',
    name: 'Structural Steel',
    description: 'Steel beam sections',
    referenceServiceLife: 50,
    unit: 'm3',
    quantity: 1,
    results: {},
    metaData: null,
    source: APISource.ECOPortal,
    lifespan: 50,
    emission: {
      gwp: {
        a1a3: 150,
        a4: 15,
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
        c4: 7,
        d: -50
      }
    },
    transport: null,
    impactData: {
      epd: {
        id: 'epd-2',
        name: 'Steel EPD',
        validUntil: '2025-01-01'
      }
    }
  },
  {
    id: 'wood-1',
    name: 'Structural Timber',
    description: 'Engineered wood products',
    referenceServiceLife: 30,
    unit: 'm2',
    quantity: 1,
    results: {},
    metaData: null,
    source: APISource.ECOPortal,
    lifespan: 30,
    emission: {
      gwp: {
        a1a3: 40,
        a4: 5,
        a5: 0,
        b1: -30,
        b2: 0,
        b3: 0,
        b4: 0,
        b5: 0,
        b6: 0,
        b7: 0,
        c1: 0,
        c2: 0,
        c3: 20,
        c4: 2,
        d: -15
      }
    },
    transport: null,
    impactData: {
      epd: {
        id: 'epd-3',
        name: 'Timber EPD',
        validUntil: '2025-01-01'
      }
    }
  }
]

// Example mapping that maps concrete to walls/columns/slabs and steel to beams
export const mockMapping: Mapping = {
  id: 'test-mapping-1',
  name: 'Basic Structure Mapping',
  filters: [],
  steps: [] 
}