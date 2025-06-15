import { ContactType } from "./contactType";
import { ConversationType, Message } from "./MessengerTypes";
import { NotificationType } from "./NotificationTypes";
import { FetchPostType } from "./PostType";
import { FetchedUserType } from "./user";

export interface MessageApiResponse {
  success: boolean;
  message: string;
  contacts?: ContactType | ContactType[];
  conversations?: ConversationType | ConversationType[];
  messages?: Message[];
}

export interface ApiResponse {
  success: boolean;
  token?: { refreshToken: string; accessToken: string };
  message?: string;
  user?: FetchedUserType[] | FetchedUserType;
  posts?: FetchPostType[] | FetchPostType;
  notifications?: NotificationType[] | NotificationType;
}
