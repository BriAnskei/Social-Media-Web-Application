import { Server, Socket } from "socket.io";
import { IMessage } from "../../models/messageModel";

export class MessageHanlder {
  private io: Server;
  private activeConversations: Map<string, Set<string>> = new Map(); // { key: convoId, Set:{participants})}
  private serverEventListenerInitialized = false;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * registerConnection
   */
  public registerEvents(socket: Socket) {
    socket.on("conversation_room-active", (conversationId: string) => {
      this.registerConvoParticipant(socket, conversationId);
    });

    socket.on("conversation_room-inactive", (conversationId: string) => {
      this.DropActiveConvoParticipant(socket, conversationId);
    });
  }
  private DropActiveConvoParticipant(socket: Socket, conversationId: string) {
    const isConvoActive = this.activeConversations.get(conversationId);

    const userId: string = this.getUserIdFromSocket(socket);

    if (isConvoActive) {
      this.activeConversations.get(conversationId)?.delete(userId);
      socket.leave(conversationId);
    }

    console.log(
      "an user has been inactive in conversation",
      userId,
      this.activeConversations.get(conversationId)
    );
  }
  private getUserIdFromSocket(socket: Socket) {
    return socket.data.userId;
  }

  private registerConvoParticipant(socket: Socket, conversationId: string) {
    const userId = this.getUserIdFromSocket(socket);
    const isCovoRoomInitialized = Boolean(
      this.activeConversations.get(conversationId)
    );

    console.log(this.activeConversations.get(conversationId));

    if (!isCovoRoomInitialized) {
      console.log("Setting a new room for conversation");

      this.activeConversations.set(conversationId, new Set());
    }
    socket.join(conversationId);
    this.activeConversations.get(conversationId)?.add(userId);
    console.group(
      "an user has been active in conversation",
      userId,
      this.activeConversations
    );
  }

  public sentMessageGlobal(data: {
    conversationId: string;
    messageData: IMessage;
  }) {
    this.io.to(data.conversationId).emit("message_on_sent", data);
  }
}
