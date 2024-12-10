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