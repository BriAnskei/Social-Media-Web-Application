import { ContactType } from "./contactType";
import { NotificationType } from "./NotificationTypes";
import { FetchPostType } from "./PostType";
import { FetchedUserType } from "./user";

export interface MessageApiResponse {
  success: boolean;
  message?: string;
  contacts?: ContactType | ContactType[];
}

export interface ApiResponse {
  success: boolean;
  token?: { refreshToken: string; accessToken: string };
  message?: string;
  user?: FetchedUserType[] | FetchedUserType;
  posts?: FetchPostType[] | FetchPostType;
  notifications?: NotificationType[] | NotificationType;
}
