import { Server, Socket } from "socket.io";

export class MessageHanlder {
  private io: Server;
  private activeConversations: Map<string, Set<string>> = new Map(); // { key: convoId, Set:{participants})}

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

  private registerConvoParticipant(socket: Socket, conversationId: string) {
    const userId = this.getUserIdFromSocket(socket);

    if (!this.activeConversations.has(conversationId)) {
      console.log("Setting a new room for conversation");

      this.activeConversations.set(conversationId, new Set());
    }

    this.activeConversations.get(conversationId)?.add(userId);

    console.log(
      "an user has been active in conversation",
      userId,
      this.activeConversations
    );
  }

  private DropActiveConvoParticipant(socket: Socket, conversationId: string) {
    const isConvoActive = this.activeConversations.get(conversationId);

    const userId: string = this.getUserIdFromSocket(socket);

    if (isConvoActive) {
      this.activeConversations.get(conversationId)?.delete(userId);
    }

    console.log("an user has been inactive in conversation", userId);
  }

  private getUserIdFromSocket(socket: Socket) {
    return socket.data.userId;
  }
}
