import { Request, Response } from "express";
import { Contact } from "../models/contactModel";
import { contactFormatHelper } from "../services/contact.service";

interface AuthReq extends Request {
  userId?: string;
}

export const getAllContacts = async (
  req: AuthReq,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new Error(
        "Failed to fetch Contacts: No User Id to process this request"
      );
    }

    const contactData = await Contact.find({
      $and: [{ user: userId }, { validFor: userId }],
    }).populate("user");

    const formatContacts = contactFormatHelper.formatContacts(
      userId,
      contactData
    );

    res.json({
      success: true,
      contacts: formatContacts,
      message: "contact succesfully fetched",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
