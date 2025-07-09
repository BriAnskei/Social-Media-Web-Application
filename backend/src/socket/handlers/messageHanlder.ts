import { Server, Socket } from "socket.io";
import { IMessage } from "../../models/messageModel";
import { SocketServer } from "./socketServer";
import {
  ConvoService,
  FormattedConversation,
} from "../../services/conversation.service";

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
      this.convoRoomOnCLosed(socket, conversationId);
    });
  }
  private async convoRoomOnCLosed(socket: Socket, conversationId: string) {
    try {
      const conversationRoom = this.activeConversations.get(conversationId);

      const userId: string = this.getUserIdFromSocket(socket);

      if (conversationRoom) {
        conversationRoom.delete(userId);
        socket.leave(conversationId);
        if (conversationRoom.size === 0) {
          this.activeConversations.delete(conversationId);
        }
        const conversation = await ConvoService.getConvoById(conversationId);
        await ConvoService.setLastMessageOnRead({
          conversation: conversation!,
          userId,
        });
      }

      console.log(
        "an user has been inactive in conversation",
        userId,
        this.activeConversations.get(conversationId)
      );
    } catch (error) {
      console.error("Failed in convoRoomOnCLosed", error);
    }
  }
  private getUserIdFromSocket(socket: Socket) {
    return socket.data.userId;
  }

  // Used on creating model doc on sent message
  public isActiveRecipient(convoId: string, recipientId: string) {
    const convoRoom = this.activeConversations.get(convoId);

    return convoRoom?.has(recipientId) as boolean;
  }

  private registerConvoParticipant(socket: Socket, conversationId: string) {
    try {
      const userId = this.getUserIdFromSocket(socket);
      const isCovoRoomInitialized = Boolean(
        this.activeConversations.get(conversationId)
      );

      if (!isCovoRoomInitialized) {
        console.log("Setting a new room for conversation");

        this.activeConversations.set(conversationId, new Set());
      }
      socket.join(conversationId);
      this.activeConversations.get(conversationId)?.add(userId);

      this.emitConversationOnView({ convoId: conversationId, userId: userId });

      console.group(
        "an user has been active in conversation. UserId: ",
        userId,
        " conversatonId: ",
        conversationId,
        this.activeConversations
      );
    } catch (error) {
      console.error("Error on registerConvoParticipant, ", error);
    }
  }

  private emitConversationOnView(payload: {
    convoId: string;
    userId: string;
  }): void {
    try {
      const { convoId, userId } = payload;
      this.io.to(convoId).emit("conversation_on_view", { convoId, userId });
    } catch (error) {
      throw new Error((error as Error).message);
    }
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

    const isRecipientOnlineButNotViewingConvo =
      recipientSocket && isUserOnline && !isUserViewingConvo;

    if (isRecipientOnlineButNotViewingConvo) {
      console.log(
        "Emitting message for unview but active user: ",
        recipientSocket
      );

      this.sentMessageOnRecipClosedConvo(recipientSocket.socketId, data);
    }
  }
  private sentMessageOnRecipClosedConvo(
    recipientSocketId: string,
    payload: {
      conversation: FormattedConversation;
      messageData: IMessage;
    }
  ): void {
    this.io.to(recipientSocketId).emit("message_on_sent_closedConvo", payload);
  }
}
