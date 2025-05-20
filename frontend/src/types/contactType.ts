import { FetchedUserType } from "./user";

export interface ContactType {
  _id: string;
  user: FetchedUserType;
  validFor: string[];
  createdAt: Date;
}
