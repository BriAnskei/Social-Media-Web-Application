import { Server, Socket } from "socket.io";
import { IMessage } from "../../models/messageModel";
import { SocketServer } from "./socketServer";
import { FormattedConversation } from "../../services/conversation.service";

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
    const conversationRoom = this.activeConversations.get(conversationId);

    const userId: string = this.getUserIdFromSocket(socket);

    if (conversationRoom) {
      conversationRoom.delete(userId);
      socket.leave(conversationId);
      if (conversationRoom.size === 0) {
        console.log("Deleting convo for no active in room");

        this.activeConversations.delete(conversationId);
      }
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

    return convoRoom?.has(recipientId) as boolean;
  }

  private registerConvoParticipant(socket: Socket, conversationId: string) {
    const userId = this.getUserIdFromSocket(socket);
    const isCovoRoomInitialized = Boolean(
      this.activeConversations.get(conversationId)
    );

    if (!isCovoRoomInitialized) {
      console.log("Setting a new room for conversation");

      this.activeConversations.set(conversationId, new Set());
    }
    socket.join(conversationId);
    this.io
      .to(conversationId)
      .emit("conversation_on_view", { conversationId, openedAt: new Date() });

    this.activeConversations.get(conversationId)?.add(userId);

    console.group(
      "an user has been active in conversation. UserId: ",
      userId,
      " conversatonId: ",
      conversationId,
      this.activeConversations
    );
  }
  public sentMessageGlobal(data: {
    conversation: FormattedConversation;
    messageData: IMessage;
  }) {
    const { recipient } = data.messageData;
    const recipientId = recipient._id.toString();

    const convoId = data.conversation._id!.toString();

    // First emit to the conversation room
    this.io.to(convoId).emit("message_on_sent", data);

    const isUserOnline = this.socketServer.isUserOnline(recipientId);
    const recipientSocket = this.socketServer.getConnectedUser(recipientId);
    const isUserViewingConvo = this.activeConversations
      .get(convoId)
      ?.has(recipientId);

    if (recipientSocket && isUserOnline && !isUserViewingConvo) {
      console.log(
        "Emitting message for unview but active user: ",
        recipientSocket
      );

      this.io
        .to(recipientSocket.socketId)
        .emit("message_on_sent_closedConvo", data);
    }
  }
}
