export function groupBy(objectArray, property) {
  return objectArray.reduce(function(acc, obj) {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    // if (!obj?.message?.toLowerCase()?.includes("revit"))
    return acc;
  }, {});
}
