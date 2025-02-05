import { toRaw, isProxy, isReactive, isRef } from 'vue'

import type { Product, Assembly } from '@/models/material'

/**
 * Removes all nested reactivity and returns a raw object
 * @param obj json object to convert
 * @returns object without reactivity
 */
export function deepToRaw<T>(obj: T): T {
  // Base case: return if obj is null or not an object
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // If the value is a ref, unwrap it
  if (isRef(obj)) {
    return deepToRaw(obj.value) as unknown as T
  }

  // If the object is reactive (or a proxy), get its raw version first
  if (isReactive(obj) || isProxy(obj)) {
    obj = toRaw(obj)
  }

  // Handle arrays: map each element recursively
  if (Array.isArray(obj)) {
    return obj.map((item) => deepToRaw(item)) as unknown as T
  }

  // Handle plain objects: iterate over own keys and deep convert each value
  const rawObj: any = {}
  Object.keys(obj).forEach((key) => {
    rawObj[key] = deepToRaw(obj[key])
  })

  return rawObj as T
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
  const guidOrHexRegex = /^(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[0-9a-fA-F]{32})$/

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
    parameterSet.add(key)

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