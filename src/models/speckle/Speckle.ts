export interface Version {
    authorName: string;
    modelName: string;
    createdAt: Date;
    id: string;
    message: string;
    referenceObject: string;
    sourceApplication: string; //Maybe change to enum
}

export interface ProjectDetails {
    versions: {
        items: Version[];
        cursor: Date;
        totalCount: number;
    },
    id: string;
    name: string;
    updatedAt: Date;
    projectId: string;
}

export interface VersionId {
    id: string;
    name: string;
}

export interface ModelsAndVersions { 
    [modelName: string]: Version[];
}

export interface User {
    name: string;
    id: string;
    avatar: string;
}

export interface ServerInfo {
    name: string;
    company: string;
}