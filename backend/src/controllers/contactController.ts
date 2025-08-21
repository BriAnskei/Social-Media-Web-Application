import { Request, Response } from "express";
import { Contact } from "../models/contactModel";
import {
  contactFormatHelper,
  contactService,
} from "../services/contact.service";

interface AuthReq extends Request {
  userId?: string;
}

export const getAllContacts = async (
  req: AuthReq,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const cursor = req.query.cursor as string;

    if (!userId) {
      throw new Error(
        "Failed to fetch Contacts: No User Id to process this request"
      );
    }

    const response = await contactService.getContacts({ userId, cursor });

    const formatContacts = contactFormatHelper.formatContacts(
      userId,
      response.contacts
    );

    res.json({
      success: true,
      contacts: formatContacts,
      hasMore: response.hasMore,
      message: "contact succesfully fetched",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
