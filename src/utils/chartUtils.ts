import * as d3 from "d3"
import { roundNumber} from "@/utils/math"

/**
 * For use with aggregate charts, places the total value in the center of the chart
 * @param graph 
 * @param total 
 * @param w 
 * @param h 
 * @param unit 
 * @returns 
 */
export function aggregateCenter(graph: d3.Selection<SVGElement>, total: number , w: number, h: number, unit: string) {
  const textElement = graph.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", w / 2)
        .attr("y", h / 2)
        .style("font-weight", "bold")
      
      textElement.append("tspan")
        .text(roundNumber(total, 1))
        .classed("text-md", true)
        .attr("x", w / 2)
        .attr("dy", "-0.2em")
      textElement.append("tspan")
        .text(unit)
        .classed("text-xs", true)
        .attr("x", w / 2)
        .attr("dy", "1.2em")
  return textElement
}

/**
 * Add centertext of percentage that is within span.
 * @param graph 
 * @param span Span to check within like [50, 100]
 * @param value This is the value we check is within span, like DL results
 * @param graphValue This is the actual value that we calculate percentage from like m2
 * @param w Width
 * @param h Height
 */
export function spanPercentCenter(graph: d3.Selection<SVGElement>, span: number[], value: number[], graphValue: number[], w: number, h: number) {
  span.sort((a, b) => a - b)
  const result = checkValuesInSpan(value, span[0], span[1])
  const spanPercent = calculatePercent(result, graphValue)
  const textElement = graph.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", w / 2)
    .attr("y", h / 2)
    .style("font-weight", "bold")
  
  textElement.append("tspan")
    .text(`${span[0]} - ${span[1]}`)
    .classed("text-md", true)
    .attr("x", w / 2)
    .attr("dy", "-0.2em")
  textElement.append("tspan")
    .text(`${spanPercent}%`)
    .classed("text-md", true)
    .attr("x", w / 2)
    .attr("dy", "1.2em")
  return textElement
  function isValueInSpan(value: number, spanStart: number, spanEnd: number): boolean {
    return value >= spanStart && value <= spanEnd
  }
  
  function checkValuesInSpan(values: number[], spanStart: number, spanEnd: number): boolean[] {
    return values.map(value => isValueInSpan(value, spanStart, spanEnd))
  }
  function calculatePercent(result: boolean[], graphValues: number[]): number {
    const filteredSum = result.reduce((sum, isTrue, index) => {
      return isTrue ? sum + graphValues[index] : sum
    }, 0)
    const totalSum = graphValues.reduce((sum, value) => sum + value, 0)
    if (totalSum === 0) return 0
    return Math.round((filteredSum / totalSum) * 100)
  }
}

export function parameterCenter(graph: d3.Selection<SVGElement>, parameterValue: number, total: number, w: number, h: number) {
  const textElement = graph.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", w / 2)
    .attr("y", h / 2)
    .style("font-weight", "bold")
  
  textElement.append("tspan")
    .text(parameterValue)
    .classed("text-md", true)
    .attr("x", w / 2)
    .attr("dy", "-0.2em")
  return textElement
}