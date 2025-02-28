export interface NotificationType {
  _id: string;
  receiver: string;
  sender: string;
  post: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}
