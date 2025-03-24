import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as d3 from 'd3'
import { 
  aggregateCenter,
  spanPercentCenter,
  parameterCenter,
  updateSelectedObjects,
  createBaseChart,
  createTooltip,
  createMouseEventHandlers,
  groupChartData
} from '@/utils/chartUtils'
import { createTestPinia } from '../setup/testUtils'
import { useProjectStore } from '@/stores/projectStore'

import { mockObjects } from '../setup/testData'
import type { Project } from '@/models/projectModel'

describe('chartUtils', () => {
  beforeEach(() => {
    createTestPinia()
    document.body.innerHTML = ''
  })

  describe('aggregateCenter', () => {
    it('should create center text with value and unit', () => {
      const svg = d3.select(document.createElement('svg'))
      const result = aggregateCenter(svg as any, 99.9, 200, 200, 'kg')
      
      expect(result.select('.text-md').text()).toBe('99.9')
      expect(result.select('.text-xs').text()).toBe('kg')
    })
  })

  describe('spanPercentCenter', () => {
    it('should calculate correct percentage for span', () => {
      const svg = d3.select(document.createElement('svg'))
      const span = [0, 100]
      const values = [25, 75]
      const graphValues = [50, 50]
      
      const result = spanPercentCenter(svg as any, span, values, graphValues, 200, 200)
      expect(result.selectAll('tspan').nodes().length).toBe(2)
    })

    it('should handle empty values', () => {
      const svg = d3.select(document.createElement('svg'))
      const result = spanPercentCenter(svg as any, [0, 100], [], [], 200, 200)
      expect(result.select('tspan').text()).toBe('0 - 100')
    })
  })

  describe('parameterCenter', () => {
    it('should display parameter value', () => {
      const svg = d3.select(document.createElement('svg'))
      const result = parameterCenter(svg as any, 42, 100, 200, 200)
      expect(result.select('.text-md').text()).toBe('42')
    })
  })

  describe('updateSelectedObjects', () => {
    it('should update project store with selected ids', () => {
      const projectStore = useProjectStore()
      const project: Project = {
        name: 'Test Project',
        description: 'Test Description',
        id: 'test-id',
        geometry: []
      }
      projectStore.currProject = project

      projectStore.addGeometry(mockObjects.simple)
      projectStore.addGeometry(mockObjects.complex)
      
      updateSelectedObjects(["test-id-1", "test-id-2"])
      expect(projectStore.selectedObjects).toEqual([mockObjects.simple, mockObjects.complex])
    })
  })

  describe('createBaseChart', () => {
    it('should create chart with default dimensions', () => {
      const container = document.createElement('div')
      const result = createBaseChart({}, container)
      
      expect(result.width).toBe(600)
      expect(result.height).toBe(400)
      expect(result.svg.node()).toBeTruthy()
    })

    it('should respect custom dimensions', () => {
      const container = document.createElement('div')
      const options = { width: 800, height: 600 }
      const result = createBaseChart(options, container)
      
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })
  })

  describe('createTooltip', () => {
    it('should create tooltip with correct styles', () => {
      const div = document.createElement('div')
      const tooltip = createTooltip(div)
      
      expect(tooltip.style('position')).toBe('absolute')
      expect(tooltip.style('opacity')).toBe('0')
      expect(tooltip.style('border-radius')).toBe('5px')
    })
  })

  describe('createMouseEventHandlers', () => {
    it('should handle mouseover event', () => {
      const container = document.createElement('div')
      const tooltipDiv = createTooltip(container)
      const handlers = createMouseEventHandlers(tooltipDiv, container)
      
      const event = new MouseEvent('mouseover')
      handlers.mouseover(event, {})
      expect(tooltipDiv.style('opacity')).toBe('1')
    })

    it('should handle mouseleave event', () => {
      const container = document.createElement('div')
      const tooltipDiv = createTooltip(container)
      const handlers = createMouseEventHandlers(tooltipDiv, container)
      
      const event = new MouseEvent('mouseleave')
      handlers.mouseleave(event, {})
      expect(tooltipDiv.style('opacity')).toBe('0')
    })
  })

  describe('groupChartData', () => {
    it('should calculate percentages correctly', () => {
      const data = [
        { value: 50, label: 'A' },
        { value: 50, label: 'B' }
      ]
      const result = groupChartData(data, 100)
      
      expect(result[0].percent).toBe(50)
      expect(result[1].percent).toBe(50)
    })

    it('should filter zero values', () => {
      const data = [
        { value: 0, label: 'A' },
        { value: 50, label: 'B' }
      ]
      const result = groupChartData(data, 50)
      
      expect(result.length).toBe(1)
      expect(result[0].label).toBe('B')
    })

    it('should handle negative values', () => {
      const data = [
        { value: -50, label: 'A' },
        { value: 100, label: 'B' }
      ]
      const result = groupChartData(data, 50)
      
      expect(result[0].percent).toBe(-100)
      expect(result[1].percent).toBe(200)
    })
  })
})