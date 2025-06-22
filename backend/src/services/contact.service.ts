import { Contact, IContact } from "../models/contactModel";
import mongoose from "mongoose";
import { appEvents } from "../events/appEvents";
import { ConvoService } from "./conversation.service";
import { UserChatRelationService } from "./UserChatRelation.service";

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

      appEvents.emit("createOrUpdate-contact", emitPayload);
    } catch (error) {
      console.log("Failed to create/update contact, " + error);
    }
  },
  updateValidUserOrDropContact: async (userId: string, otherUserId: string) => {
    try {
      let contact = await Contact.findOne({
        $and: [{ user: userId }, { user: otherUserId }],
      });

      if (!contact) {
        throw new Error(
          "Failed to Drop/update contact, contact does not exist"
        );
      }

      // remove user in the validFor filter
      contact.validFor = contact.validFor.filter(
        (user) => user.toString() !== userId.toString()
      );

      // delete contact if both user does not exist in the validFor
      const contactStillValid = contact.validFor.length >= 1;
      let convoId: any;

      if (contactStillValid) {
        await contact.save();
      } else {
        await Contact.deleteOne({ _id: contact._id });
      }

      let emitPayload = {
        contactId: contact._id as string,
        userId,
      };

      appEvents.emit("updateOrDrop-contact", emitPayload);
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
