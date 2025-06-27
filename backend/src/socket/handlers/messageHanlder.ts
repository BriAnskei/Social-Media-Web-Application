import { Server, Socket } from "socket.io";
import { IMessage } from "../../models/messageModel";
import { SocketServer } from "./socketServer";

export class MessageHanlder {
  private io: Server;
  private activeConversations: Map<string, Set<string>> = new Map(); // { key: convoId, Set:{participants})}
  private socketServer;

  constructor(io: Server, socketServer: SocketServer) {
    this.io = io;
    this.socketServer = socketServer;
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

  /**
   * isActiveRecipient
   */
  public isActiveRecipient(convoId: string, recipientId: string) {
    const convoRoom = this.activeConversations.get(convoId);

    console.log(
      "Checking recipenmt for this convo id: ",
      convoId,
      convoRoom,
      recipientId,
      convoRoom?.has(recipientId)
    );

    return convoRoom?.has(recipientId) as boolean;
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
    const { recipient } = data.messageData;
    const recipientId = recipient._id.toString();

    console.log("Sending message emit");

    // First emit to the conversation room
    this.io.to(data.conversationId).emit("message_on_sent", data);

    const isUserOnline = this.socketServer.isUserOnline(recipientId);
    const recipientSocket = this.socketServer.getConnectedUser(recipientId);
    const isUserViewingConvo = this.activeConversations
      .get(data.conversationId)
      ?.has(recipientId);

    if (recipientSocket && isUserOnline && !isUserViewingConvo) {
      this.io
        .to(recipientSocket.socketId)
        .emit("message_on_sent_closedConvo", data);

      console.log("✅ Emission completed");
    }
  }
}
