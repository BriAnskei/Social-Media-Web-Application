import { Request, Response } from "express";
import { MessageModel } from "../models/messageModel";

import { messageService, requesHanlder } from "../services/message.service";
import { UserChatRelationService } from "../services/UserChatRelation.service";
import { ConvoService } from "../services/conversation.service";
import { messageQueue } from "../queues/messageQueues";

export interface ReqAuth extends Request {
  userId?: string;
}
// query for effecientcy emplementation
// https://chatgpt.com/c/6879e120-e538-8012-8695-7f173ab839db
// A full working example with BullMQ + Redis in a Node.js chat app

// we can also use bull dashboard to see the process if the bull

// FOR  QUEUES EMPLEMENTATOPM
// Optionally, you can split into multiple queues:

// saveMessageQueue

// updateConversationQueue

// notifyUserQueue

// How to combine sockets with message queues

// How to test transactions and queues in dev

// export const addMessage = async (req: ReqAuth, res: Response): Promise<any> => {
//   try {
//     const { messagePayload, convoId } =
//       requesHanlder.createPayloadForActiveRecipient(req);

//     const newMessage = await messageService.createMessageAndUpdateConvo(
//       messagePayload,
//       convoId
//     );

//     res.json({ success: true, message: "message sent", messages: newMessage });
//   } catch (error) {
//     console.error("Failed to sent message, " + error);
//     res.json({
//       success: false,
//       message: `Failed to  send message: ${(error as Error).message}`,
//     });
//   }
// };

export const addMessage = async (req: ReqAuth, res: Response) => {
  const payload = requesHanlder.createPayloadForActiveRecipient(req);
  console.log(
    "adding message, adding this payload for 'sendMessag' job",
    payload
  );
  await messageQueue.add("sendMessage", payload);
  res.status(202).json({ status: "Message queued" });
};

export const getMessages = async (
  req: ReqAuth,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    const { cursor, limit = 7 } = req.body;

    let messages;

    if (cursor) {
      messages = await MessageModel.find({
        conversationId,
        hideFrom: { $ne: userId },
        createdAt: { $lt: new Date(cursor) },
      })
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();
    } else {
      messages = await MessageModel.find({
        conversationId,
        hideFrom: { $ne: userId },
      })
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();
    }

    const hasMore = messages.length > limit;

    if (hasMore) messages.pop();

    res.json({
      success: true,
      message: "Messages fetched",
      messages,
      hasMore,
    });
  } catch (error) {
    console.log("Failed to fetch messages, " + error);
    res.json({ success: false, message: "Error" });
  }
};
