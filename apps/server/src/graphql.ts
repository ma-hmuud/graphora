
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Plan {
    FREE = "FREE",
    PRO = "PRO"
}

export enum DatasetStatus {
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED"
}

export enum GraphStatus {
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED"
}

export enum Layout {
    FORCE = "FORCE",
    CIRCULAR = "CIRCULAR",
    HIERARCHICAL = "HIERARCHICAL"
}

export interface CreateDatasetInput {
    name: string;
    description?: Nullable<string>;
}

export interface UpdateDatasetInput {
    name?: Nullable<string>;
    description?: Nullable<string>;
}

export interface CreateGraphInput {
    name: string;
    datasetId: number;
    isDirected?: Nullable<boolean>;
    isWeighted?: Nullable<boolean>;
    layoutPreference?: Nullable<Layout>;
}

export interface UpdateGraphInput {
    name?: Nullable<string>;
    status?: Nullable<GraphStatus>;
    isDirected?: Nullable<boolean>;
    isWeighted?: Nullable<boolean>;
    layoutPreference?: Nullable<Layout>;
    shareSlug?: Nullable<string>;
}

export interface User {
    id: number;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: Nullable<string>;
    passwordHash?: Nullable<string>;
    plan: Plan;
    createdAt: string;
    updatedAt: string;
}

export interface Dataset {
    id: number;
    name: string;
    description?: Nullable<string>;
    s3Key: string;
    sizeBytes?: Nullable<number>;
    rowCount?: Nullable<number>;
    status: DatasetStatus;
    errorMessage?: Nullable<string>;
    createdAt: string;
    updatedAt: string;
    fileUrl?: Nullable<string>;
}

export interface IQuery {
    datasets(): Dataset[] | Promise<Dataset[]>;
    dataset(id: number): Dataset | Promise<Dataset>;
    graphs(): Graph[] | Promise<Graph[]>;
    graph(id: number): Graph | Promise<Graph>;
    hello(name?: Nullable<string>): Nullable<string> | Promise<Nullable<string>>;
    me(): Nullable<User> | Promise<Nullable<User>>;
}

export interface IMutation {
    createDataset(input: CreateDatasetInput, file: Upload): Dataset | Promise<Dataset>;
    updateDataset(id: number, input: UpdateDatasetInput): Dataset | Promise<Dataset>;
    deleteDataset(id: number): boolean | Promise<boolean>;
    createGraph(input: CreateGraphInput): Graph | Promise<Graph>;
    updateGraph(id: number, input: UpdateGraphInput): Graph | Promise<Graph>;
    deleteGraph(id: number): boolean | Promise<boolean>;
    _empty(): Nullable<string> | Promise<Nullable<string>>;
}

export interface Graph {
    id: number;
    name: string;
    status: GraphStatus;
    isDirected: boolean;
    isWeighted: boolean;
    nodeCount?: Nullable<number>;
    edgeCount?: Nullable<number>;
    density?: Nullable<number>;
    componentsCount?: Nullable<number>;
    shareSlug?: Nullable<string>;
    layoutPreference: Layout;
    createdAt: string;
    updatedAt: string;
    dataset: Dataset;
}

export type Upload = any;
type Nullable<T> = T | null;
