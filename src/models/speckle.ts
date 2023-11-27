/**
 * Represents a version of a Speckle object.
 */
export interface Version {
    authorName: string; // The name of the author who created the version.
    branchName: string; // The name of the model that the version belongs to.
    createdAt: Date; // The date and time when the version was created.
    id: string; // The unique identifier of the version.
    message: string; // A message describing the changes made in the version.
    referencedObject: string; // The unique identifier of the object that the version is based on.
    sourceApplication: string; // The name of the application used to create the version.
}

/**
 * Represents the details of a Speckle project.
 */
export interface ProjectDetails {
    stream: {
        commits: {
            items: Version[]; // An array of versions of the project.
            cursor: Date; // The date and time of the last version in the array.
            totalCount: number; // The total number of versions in the project.
        },
        id: string; // The unique identifier of the project.
        name: string; // The name of the project.
        updatedAt: Date; // The date and time when the project was last updated.    
    }
}

/**
 * Represents a Speckle version identifier.
 */
export interface VersionId {
    id: string; // The unique identifier of the version.
    name: string; // The name of the version.
}

/**
 * Represents a collection of Speckle models and their versions.
 */
export interface ModelsAndVersions {
    [modelName: string]: Version[]; // An object where the keys are model names and the values are arrays of versions of the model.
}

/**
 * Represents a Speckle user.
 */
export interface User {
    name: string; // The name of the user.
    id: string; // The unique identifier of the user.
    avatar: string; // The URL of the user's avatar.
}

/**
 * Represents information about a Speckle server.
 */
export interface ServerInfo {
    name: string; // The name of the Speckle server.
    company: string; // The name of the company that operates the Speckle server.
}

/**
 * Minimum information needed for project list.
 */
export interface ProjectId {
    name: string; // The name of the project
    id: string; // The id of the project
    updatedAt: Date; // The last update of the project
}

/**
 * Parameter speckle object information
 */
export interface ObjectParameter {
    id: string; // Unique id of parameter
    name: string; // The name of the parameter
    value?: string // Value of the parameter
    parentId?: string // Unique id of the parameters parent if it has any
}