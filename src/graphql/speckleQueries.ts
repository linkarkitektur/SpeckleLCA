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
  query getProjectVersions($projectId: String!) {
	project(id: $projectId){
		name
		updatedAt
		id
		models {
			totalCount
			items {
				id
				name
				versions {
					items {
						message
						sourceApplication
						referencedObject
						authorUser {
							id
							name
						}
						createdAt
					}
				}
			}
		}
	}
}`

/**
 * @description GraphQL query to fetch the latest projects.
 */
export const latestProjectsQuery = `query getProjects {
  activeUser {
    id
    projects {
      items {
        id
        name
        description
        updatedAt
        models(limit: 1) {
        	items {
        		id
        	}        	
        }
      }
      totalCount
    }
  }
}`

/**
 * @description GraphQL query to fetch children objects and their parameters based on selection.
 * @param projectId - The ID of the project.
 * @param objectId - The ID of the object.
 * @param select - An array of parameters to include for each object
 */
export const selectedObjectsQuery = `query Stream($projectId: String!, $objectId: String!, $select: [String]) {
  project(id: $projectId) {
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
