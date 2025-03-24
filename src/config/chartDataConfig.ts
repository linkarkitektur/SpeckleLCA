import type { NestedChartData, ChartData } from "@/models/chartModel"

export const dummyData: NestedChartData[] = [
  {
    label: "Group A",
    value: [
      { label: "Phase 1", value: 2500, ids: ["a1", "a2"] },
      { label: "Phase 2", value: -450, ids: ["a3"] },
      { label: "Phase 3", value: 400, ids: ["a4"] }
    ]
  },
  {
    label: "Group B",
    value: [
      { label: "Phase 1", value: -250, ids: ["b1"] },
      { label: "Phase 2", value: 500, ids: ["b2", "b3"] },
      { label: "Phase 3", value: 1300, ids: ["b4"] }
    ]
  },
  {
    label: "Group C",
    value: [
      { label: "Phase 1", value: -300, ids: ["c1"] },
      { label: "Phase 2", value: 900, ids: ["c2", "c3"] },
      { label: "Phase 3", value: 750, ids: ["c4"] }
    ]
  }
]

export const dummyFlatData: ChartData[] = [
  {
    value: 30,
    graphValue: 30,
    label: 'Category A',
    ids: ['a1', 'a2']
  },
  {
    value: -20,
    graphValue: 20,
    label: 'Category B',
    ids: ['b1']
  },
  {
    value: 15,
    graphValue: 15,
    label: 'Category C',
    ids: ['c1', 'c2']
  },
  {
    value: 10,
    graphValue: 10,
    label: 'Category D',
    ids: ['d1']
  },
  {
    value: -5,
    graphValue: 5,
    label: 'Category E',
    ids: ['e1']
  }
]