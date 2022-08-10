export const userInfoQuery = `
  query {
    user {
      name
      id
      avatar
      email
    },
    serverInfo {
      name
      company
    }
  }`;

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

export const streamSearchQuery = `
  query($searchText: String!) {
    streams(query: $searchText) {
      totalCount
      cursor
      items {
        id
        name
        updatedAt
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
            children(select:["speckle_type","type", "family", "category", "level.name", "level.elevation", "level.id"] limit:1000000){
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

export const latestStreamsQuery = `query {
    streams(limit: 10){
        cursor
        totalCount
        items {
            id
            name
            description
            createdAt
            updatedAt
        }
    }
}`;

export const getCategoryBasedChilds = `query($streamId: String!, $objectId: String!) {
  stream(id: $streamId){
    object(id: $objectId){
      children(select: ["category", "type"], limit: 1000000) {
        totalCount
        objects {
          id
          data
        }
      }
    }
  }
}`;
