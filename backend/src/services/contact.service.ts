import { Contact, IContact } from "../models/contactModel";
import mongoose from "mongoose";
import { appEvents } from "../socket/events";

export const contactService = {
  createOrUpdateContact: async (userId: string, otherUserId: string) => {
    try {
      let contact = await Contact.findOne({
        $and: [{ user: userId }, { user: otherUserId }],
      });

      let isContactExist = false;

      if (!contact) {
        contact = await Contact.create({
          user: [userId, otherUserId],
          validFor: [userId],
        });
      } else {
        isContactExist = true;
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

      const emitPayload = {
        isContactExist,
        contact,
      };

      appEvents.emit("createOrUpdate-contact", emitPayload);
    } catch (error) {
      console.log("Failed to create/update contact, " + error);
    }
  },
  updateOrDropContact: async (userId: string, otherUserId: string) => {
    try {
      let contact = await Contact.findOne({
        $and: [{ user: userId }, { user: otherUserId }],
      });

      if (!contact) {
        throw new Error("Failed to Drop contact, contact does not exist");
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
        await Contact.deleteOne({ _id: contact._id });
      }

      const emitPayload = {
        contactStillValid,
        contact,
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
          "Contact migth not exit or there is no valid users for this contact"
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
};
