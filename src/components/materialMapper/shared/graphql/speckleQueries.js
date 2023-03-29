export const streamCommitsQuery = `
  query($id: String!) {
    stream(id: $id){
      name
      updatedAt
      id
      commits{
        totalCount
        cursor
        items{
          id
          message
          branchName
          sourceApplication
          referencedObject
          authorName
          createdAt
        }
      }
    }
  }`;

  export const streamObjectQuery = `query($streamId: String!, $objectId: String!) {
    stream(id: $streamId){
        object(id: $objectId){
            totalChildrenCount
            id
            speckleType
            data
            children(select:["speckle_type","type", "family", "category", "level.name", "level.elevation", "level.id", "parameters.HOST_AREA_COMPUTED.value", "parameters.HOST_VOLUME_COMPUTED.value","height"] limit:1000000){
              totalCount
              cursor
              objects{
                id
                data
              }
            }
        }
    }
}`;

export const getCategoryBasedChilds = `query($streamId: String!, $objectId: String!) {
  stream(id: $streamId){
    object(id: $objectId){
      children(select: ["category", "type","parameters.HOST_AREA_COMPUTED.value", "parameters.HOST_VOLUME_COMPUTED.value","height"], limit: 1000000) {
        totalCount
        objects {
          id
          data
        }
      }
    }
  }
}`;
