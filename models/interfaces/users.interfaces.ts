import { Document as MongoDocument, ObjectId } from "mongodb";
import { PublishStatus } from "./global.interfaces";

export interface User extends MongoDocument {
  _id?: ObjectId;
  name: string;
  username: string;
  email: string;
  roles: UserRoles;
  status: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NewUser = {
  name: string;
  username: string;
  email: string;
  roles: UserRoles;
  status: EnumUserStatus;
  password: string;
  repassword: string;
};

export type editUser = {
  name: string;
  username: string;
  email: string;
  roles: UserRoles;
  status: EnumUserStatus;
};

export type changePassword = {
  oldPassword: string;
  newPassword: string;
  renewPassword: string;
};

export enum UserRoles {
  ADMIN = "ADMIN",
  STOREADMIN = "STORE ADMIN",
  CUSTOMER = "CUSTOMER",
  GUEST = "GUEST",
}

export enum EnumUserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

export const initUser: NewUser = {
  name: "",
  username: "",
  email: "",
  roles: UserRoles.CUSTOMER,
  status: EnumUserStatus.ACTIVE,
  password: "",
  repassword: "",
};

export const initEditUser: editUser = {
  name: "",
  username: "",
  email: "",
  roles: UserRoles.CUSTOMER,
  status: EnumUserStatus.ACTIVE,
};

export const initChangePassword: changePassword = {
  oldPassword: "",
  newPassword: "",
  renewPassword: "",
};
