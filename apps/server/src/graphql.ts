/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Plan {
  FREE = "FREE",
  PRO = "PRO",
}

export class User {
  id!: number;
  name!: string;
  email!: string;
  emailVerified!: boolean;
  image?: Nullable<string>;
  passwordHash?: Nullable<string>;
  plan!: Plan;
  createdAt!: string;
  updatedAt!: string;
}

export abstract class IQuery {
  abstract hello(
    name?: Nullable<string>,
  ): Nullable<string> | Promise<Nullable<string>>;

  abstract me(): Nullable<User> | Promise<Nullable<User>>;
}

type Nullable<T> = T | null;
