import { Request, Response } from "express";
import { Contact } from "../models/contactModel";
import mongoose from "mongoose";
import { contactFormatHelper } from "../services/contact.service";

interface AuthReq extends Request {
  userId?: string;
}

export const createOrUpdate = async (
  req: AuthReq,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.body;

    let contact = await Contact.findOne({
      $and: [{ user: userId }, { user: otherUserId }],
    });

    if (!contact) {
      contact = await Contact.create({
        user: [userId, otherUserId],
        validFor: [userId],
      });
    } else {
      // check if this contact is valid for userId
      const isValid = contact.validFor.includes(
        new mongoose.Types.ObjectId(userId)
      );
      // if user not exist, push to validFor
      if (!isValid) {
        contact.validFor.push(new mongoose.Types.ObjectId(userId));

        await contact.save();
      }
    }

    res.json({
      contact,
      success: true,
      message: "contact succesfully created",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

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

    console.log("contacts:", contactData, userId);

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

export const updateOrRemove = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, contactId } = req.params;

    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.json({
        success: false,
        message: "contact contact doesn't exist",
      });
    }

    // remove user in the validFor filter
    contact.validFor = contact.validFor.filter(
      (user) => user.toString() !== userId.toString()
    );

    // delete contact if both user does not exist in the validFor
    const contactStillValid = contact.validFor.length >= 1;

    if (contactStillValid) {
      await contact.save();
    } else {
      await Contact.deleteOne({ _id: contactId });
    }

    res.json({
      contact,
      success: true,
      message: "contact succesfulle update or deleted",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
