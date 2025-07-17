import { Server, Socket } from "socket.io";
import { IMessage } from "../../models/messageModel";
import { SocketServer } from "./socketServer";
import {
  conversationFormatHelper,
  ConvoService,
  FormattedConversation,
} from "../../services/conversation.service";
import { IConversation } from "../../models/conversationModel";

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
      const conversationRoom = this.getConvoRoom(conversationId);

      const userId: string = this.getUserIdFromSocket(socket);

      if (!conversationRoom) {
        console.error("Conversation room not found!");
        return;
      }

      this.deleteUserInRoom(conversationRoom, userId);

      this.dropSocketConvoRoom({ socket, convoId: conversationId });
      this.validateRoomOnDrop({
        convoId: conversationId,
        room: conversationRoom,
      });

      await ConvoService.validateConvoOnDrop(conversationId);

      console.log(
        "an user has been inactive in conversation",
        userId,
        this.activeConversations.get(conversationId)
      );
    } catch (error) {
      console.error("Failed in convoRoomOnCLosed", error);
    }
  }

  public cleanUpOnLeave(payload: { socket: Socket; convoIds: string[] }) {
    const { socket, convoIds } = payload;
    const userId = this.getUserIdFromSocket(socket);

    const dropUserInRoom = (convoId: string) => {
      try {
        const convoRoom = this.getConvoRoom(convoId);
        if (!convoRoom) {
          console.error("Convo room for dropout is not available");
          return;
        }
        this.deleteUserInRoom(convoRoom, userId);
        this.dropSocketConvoRoom({ socket, convoId });
        this.validateRoomOnDrop({ convoId, room: convoRoom });
      } catch (error) {
        console.error("Failed on dropUserInRoom, ", error);
      }
    };

    convoIds.forEach((cId) => {
      dropUserInRoom(cId);
    });

    console.log(
      "user on leav detected for cleanup: convoROoms update: ",
      this.activeConversations
    );
  }

  private validateRoomOnDrop(payload: { convoId: string; room: Set<string> }) {
    const { convoId, room } = payload;
    if (!this.isRoomStillActive(room)) {
      this.deleteRoom(convoId);
    }
  }
  private deleteUserInRoom(room: Set<String>, userId: string) {
    room.delete(userId);
  }
  private deleteRoom(convoId: string) {
    this.activeConversations.delete(convoId);
  }
  private dropSocketConvoRoom(cnfg: { socket: Socket; convoId: string }) {
    try {
      const { socket, convoId } = cnfg;

      socket.leave(convoId);
    } catch (error) {
      throw error;
    }
  }
  private getConvoRoom(convoId: string) {
    return this.activeConversations.get(convoId);
  }
  private getUserIdFromSocket(socket: Socket) {
    return socket.data.userId;
  }

  private isRoomStillActive(room: Set<string>) {
    return room.size > 0;
  }
  // Used on creating model doc on sent message
  public isActiveRecipient(convoId: string, recipientId: string) {
    const convoRoom = this.activeConversations.get(convoId);

    return convoRoom?.has(recipientId) as boolean;
  }

  private registerSocketConvoRoom(cnfg: { socket: Socket; convoId: string }) {
    try {
      const { socket, convoId } = cnfg;
      socket.join(convoId);
    } catch (error) {
      throw error;
    }
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
      this.registerSocketConvoRoom({ socket, convoId: conversationId });
      this.activeConversations.get(conversationId)?.add(userId);

      this.emitConversationOnView({ convoId: conversationId, userId: userId });

      console.log(
        "a user rigestered a conversation: ",
        conversationId,
        " conversation Map room update: ",
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
    conversation: IConversation;
    messageData: IMessage;
  }) {
    const { conversation } = data;
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
      conversation: IConversation;
      messageData: IMessage;
    }
  ): void {
    this.io.to(recipientSocketId).emit("message_on_sent_closedConvo", payload);
  }
}
