import { toRaw, isProxy } from 'vue'

import type { Product, Assembly } from '@/models/material'

/**
 * Removes all nested reactivity and returns a raw object
 * @param obj json object to convert
 * @returns object without reactivity
 */
export function deepToRaw<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    // Base case: return the value if it's not an object or array
    return obj
  }

  if (Array.isArray(obj)) {
    // If it's an array, iterate through the elements and deep convert
    return obj.map((item) => deepToRaw(item)) as unknown as T
  }

  if (isProxy(obj)) {
    // If the object is a reactive proxy, use toRaw to convert it
    obj = toRaw(obj)
  }

  // If it's a plain object, iterate through keys and deep convert values
  const result: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepToRaw(obj[key])
    }
  }

  return result as T
}

/**
 * Sanitizer for undefined fields in an object eg. for use in firebase
 * @param obj json object to sanitize
 * @returns returns sanitized object
 */
export function removeUndefinedFields(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  return Array.isArray(obj)
    ? obj.map((item) => removeUndefinedFields(item))
    : Object.entries(obj)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
          acc[key] = removeUndefinedFields(value) // Recursively process nested objects
          return acc
        }, {} as any)
}

export const getEnumEntries = (enumObj: any) => {
  return Object.keys(enumObj)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({ label: key, value: enumObj[key] }))
}

/**
 * Checks a list of objects recursively and gathers all keys within it
 * @param parameters Start point for the parameter collection
 * @param parameterSet Returns set of unique parameters
 */
export function collectParameters(parameters: Record<string, any>, parameterSet: Set<string>) {
  const guidOrHexRegex = /^(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[0-9a-fA-F]{32})$/;

  Object.keys(parameters).forEach((key) => {
    // Skip if the key is already in the set
    if (parameterSet.has(key)) {
      return
    }

    const value = parameters[key]

    // Skip if the key is a GUID or 32-character hex string
    if (guidOrHexRegex.test(key)) {
      return
    }

    // Skip if the value is null, undefined, or an empty object/array
    if (
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    ) {
      return
    }

    // Add the key to the set
    parameterSet.add(key);

    if (Array.isArray(value)) {
      // If it's an array, recursively process each object in the array
      value.forEach((element) => {
        if (typeof element === 'object' && element !== null) {
          collectParameters(element, parameterSet)
        }
      })
    } else if (typeof value === 'object' && value !== null) {
      // If it's an object, process it recursively
      collectParameters(value, parameterSet)
    }
  })
}