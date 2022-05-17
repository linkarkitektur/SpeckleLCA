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
export const sampleQuery = `
query{
  user {
    name,
    streams {
      totalCount, 
      items {
        id
        name
        commits { 
          cursor, 
          totalCount, 
          items  {
              id, 
              message,
              totalChildrenCount,
              referencedObject
          }
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

export const actReportBranchInfo = (id) => {
  return `query {
    stream(id: "${id}") {
      name
      branch(name: "actcarbonreport") {
      commits {
        items {
          authorName
          createdAt
          referencedObject
        }
      }
    }
    }
  }`;
};

export const streamsDataQuery = (streamId, objId) => `query {
  stream(id: "${streamId}") {
    object(id: "${objId}") {
      data,
      createdAt,
        children {
          objects {
            data
          }
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
