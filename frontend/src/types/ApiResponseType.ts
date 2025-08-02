import { ContactType } from "./contactType";
import { ConversationType, Message } from "./MessengerTypes";
import { NotificationType } from "./NotificationTypes";
import { CommentType, FetchPostType } from "./PostType";
import { FetchedUserType } from "./user";

export interface MessageApiResponse {
  success: boolean;
  message: string;
  contacts?: ContactType | ContactType[];
  conversations?: ConversationType | ConversationType[];
  messages?: Message[] | Message;
}

export interface ApiResponse {
  success: boolean;
  token?: { refreshToken: string; accessToken: string };
  message?: string;
  user?: FetchedUserType[] | FetchedUserType;
  posts?: FetchPostType[] | FetchPostType;
  comments?: CommentType[] | CommentType;
  notifications?: NotificationType[] | NotificationType;
}
