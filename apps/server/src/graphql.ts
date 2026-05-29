
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

export interface CreateDatasetInput {
    name: string;
    description?: Nullable<string>;
}

export interface UpdateDatasetInput {
    name?: Nullable<string>;
    description?: Nullable<string>;
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
    hello(name?: Nullable<string>): Nullable<string> | Promise<Nullable<string>>;
    me(): Nullable<User> | Promise<Nullable<User>>;
}

export interface IMutation {
    createDataset(input: CreateDatasetInput, file: Upload): Dataset | Promise<Dataset>;
    updateDataset(id: number, input: UpdateDatasetInput): Dataset | Promise<Dataset>;
    deleteDataset(id: number): boolean | Promise<boolean>;
}

export type Upload = any;
type Nullable<T> = T | null;
