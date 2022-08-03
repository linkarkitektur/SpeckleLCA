export function filterDataFromList(el, filterData) {
  const resourceFilter = filterData?.subType
    ? el.resourceSubType === filterData?.subType
    : true;
  let filter = true;
  const areaFilter = filterData?.area ? el.area === filterData?.area : true;
  const keyword = filterData?.keyword?.toLowerCase();
  const searchFilter = keyword
    ? el?.searchString?.toLowerCase()?.includes(keyword) ||
      el?.resourceSubType?.toLowerCase()?.includes(keyword) ||
      el?.area?.toLowerCase()?.includes(keyword) ||
      el?._id?.toLowerCase()?.includes(keyword)
    : true;

  const multipart =
    filterData?.multipart === "True"
      ? true
      : filterData?.multipart === "False"
      ? false
      : "Both";
  const multiPartFilter =
    (multipart === "Both" &&
      (el.isMultiPart === true || el.isMultiPart === false)) ||
    (multipart !== "Both" && el.isMultiPart === multipart);

  filter = resourceFilter && areaFilter && searchFilter && multiPartFilter;
  if (
    filterData?.subType === "" &&
    filterData?.keyword === "" &&
    filterData?.subType === "" &&
    filterData?.area === "" &&
    filterData?.multipart === ""
  ) {
    return true;
  } else {
    return filter;
  }
}

export function getDefaultData(item, savedMapperList) {
  savedMapperList?.forEach((el, index) => {
    if (el.text === item.text) {
      savedMapperList[index].isDefault = true;
      savedMapperList[index].color = "green";
      savedMapperList[index].tooltip = "Selected as default";
    } else {
      savedMapperList[index].isDefault = false;
      savedMapperList[index].color = "grey";
      savedMapperList[index].tooltip = "Make it as default";
    }
  });
  return savedMapperList;
}

export function isObjectEmpty(obj){
  return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype
}
