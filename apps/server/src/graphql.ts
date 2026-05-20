
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

export interface IQuery {
    hello(name?: Nullable<string>): Nullable<string> | Promise<Nullable<string>>;
    me(): Nullable<User> | Promise<Nullable<User>>;
}

type Nullable<T> = T | null;
