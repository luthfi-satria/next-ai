import { Document as MongoDocument, ObjectId } from "mongodb"

export interface User extends MongoDocument {
  _id?: ObjectId
  name: string
  email: string
  roles: UserRoles
  createdAt?: Date
  updatedAt?: Date
}

export type NewUser = {
  name: string,
  email: string,
  roles: UserRoles
}

export enum UserRoles{
  ADMIN = 'ADMIN',
  STOREADMIN = 'STORE ADMIN',
  CUSTOMER = 'CUSTOMER',
  GUEST = 'GUEST'
}

export const initUser: NewUser = {
    name: '',
    email: '',
    roles: UserRoles.CUSTOMER
}
