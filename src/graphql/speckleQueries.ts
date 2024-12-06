/**
 * @description GraphQL query to fetch user and server information.
 */
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
  }`

/**
 * @description GraphQL query to fetch project versions.
 * @param id - The ID of the stream.
 */
export const projectVersionsQuery = `
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
  }`

/**
 * @description GraphQL query to search for streams.
 * @param searchText - The text to search for.
 */
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
  }`

/**
 * @description GraphQL query to fetch the latest streams.
 */
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
}`

export const modelIdQuery = `query($projectId: String!) {
  project(id: $projectId) {
    models {
      items {
        id
      }
    }
  }
}
`

/**
 * @description GraphQL query to fetch children objects and their parameters based on selection.
 * @param streamId - The ID of the stream.
 * @param objectId - The ID of the object.
 * @param select - An array of parameters to include for each object
 */
export const selectedObjectsQuery = `query Stream($streamId: String!, $objectId: String!, $select: [String]) {
  stream(id: $streamId) {
    object(id: $objectId) {
      totalChildrenCount
      elements: children(select: $select limit:1000000){
        objects {
          id
          data
        }
      }
    }
  }
}`

/**
 * @description DEPRECATED GraphQL query to fetch a stream object use selectedObjectsQuery instead
 * @param streamId - The ID of the stream.
 * @param objectId - The ID of the object.
 */
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
}`
