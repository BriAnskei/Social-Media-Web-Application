import { Contact, IContact } from "../models/contactModel";
import mongoose from "mongoose";

import { ConvoService } from "./conversation.service";
import { UserChatRelationService } from "./UserChatRelation.service";
import {
  emitCreateUpdateContact,
  emitUpdateDropContact,
} from "../events/emitters";

export const contactService = {
  createOrUpdateContact: async (userId: string, otherUserId: string) => {
    try {
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
          contact = await contact.save();
        }
      }

      const convoId = await UserChatRelationService.updateValidConvoUsers(
        contact._id as string,
        contact.validFor
      );

      contact = await contact.populate("user");
      const formatedContact = contactFormatHelper.formatContactSigleData(
        userId,
        contact
      );

      let emitPayload = {
        contact: formatedContact,
        userId,
        convoId,
      };

      emitCreateUpdateContact(emitPayload);
    } catch (error) {
      console.log("Failed to create/update contact, " + error);
    }
  },
  findContactByParticipants: async (userId: string, otherUserId: string) => {
    try {
      let contact = await Contact.findOne({
        $and: [{ user: userId }, { user: otherUserId }],
      });

      return contact;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  },
  filterUserOnValidPariticipants: (
    validFor: mongoose.Types.ObjectId[],
    userId: string
  ) => {
    validFor = validFor.filter((user) => user.toString() !== userId.toString());
    return validFor;
  },
  updateValidUserOrDropContact: async (userId: string, otherUserId: string) => {
    try {
      const contact = await contactService.findContactByParticipants(
        userId,
        otherUserId
      );

      if (!contact)
        throw new Error(
          "Failed on updateValidUserOrDropContact: Contact does not exist"
        );

      contact.validFor = contactService.filterUserOnValidPariticipants(
        contact.validFor,
        userId
      );

      // delete contact if both user does not exist in the validFor
      const contactStillValid = contact.validFor.length >= 1;

      if (contactStillValid) {
        await contact.save();
      } else {
        await Contact.deleteOne({ _id: contact._id });
      }

      await UserChatRelationService.updateValidConvoUsers(
        contact._id as string,
        contact.validFor
      );

      const conversation = await ConvoService.getConvoByContactId(
        contact._id!.toString()
      );

      let emitPayload = {
        contactId: contact._id as string,
        convoId: conversation?._id as string,
        userId,
      };

      emitUpdateDropContact(emitPayload);
    } catch (error) {
      console.log("Failed to update/Drop contact, " + error);
    }
  },
  validUsers: async (contactId: string) => {
    try {
      const contact = await Contact.findById(contactId);
      const validUser = contact?.validFor;
      if (!contact || validUser?.length === 0) {
        throw new Error(
          "Contact migth not exist or there is no valid users for this contact"
        );
      }

      return contact.validFor;
    } catch (error) {
      console.log("Faild to get vaolid users, " + error);
    }
  },
  logError: (e: Error) => {
    console.error(e.message);
  },
};

export const contactFormatHelper = {
  formatContacts: (userId: string, contacts: IContact[]) => {
    const formatedContacts = contacts.map((contact) => {
      const userData = contact.user.find(
        (user) => user._id.toString() !== userId.toString()
      );

      return {
        _id: contact._id,
        user: userData,
        validFor: contact.validFor,
        createdAt: contact.createdAt,
      };
    });

    return formatedContacts;
  },
  formatContactSigleData: (userId: string, contact: IContact) => {
    const userData = contact.user.find(
      (user) => user._id.toString() !== userId
    );
    return {
      _id: contact._id,
      user: userData,
      validFor: contact.validFor,
      createdAt: contact.createdAt,
    };
  },
};
