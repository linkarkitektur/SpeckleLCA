export interface Version {
    authorName: string,
    modelName: string,
    createdAt: Date,
    id: string,
    message: string,
    referenceObject: string,
    sourceApplication: string //Maybe change to enum
}

export interface ProjectDetails {
    versions: {
        items: Version[],
        cursor: Date,
        totalCount: number
    },
    id: string,
    name: string,
    updatedAt: Date,
    projectId: string,
}

export interface AllVersions {
    id: string,
    name: string
}