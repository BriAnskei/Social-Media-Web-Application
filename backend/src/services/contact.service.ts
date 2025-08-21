import { Contact, IContact } from "../models/contactModel";
import mongoose from "mongoose";

import { ConvoService } from "./conversation.service";
import { UserChatRelationService } from "./UserChatRelation.service";
import {
  emitCreateUpdateContact,
  emitUpdateDropContact,
} from "../events/emitters";
import { IUser } from "../models/userModel";

export const contactService = {
  getContacts: async (payload: {
    userId: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ contacts: IContact[]; hasMore: boolean }> => {
    try {
      const { userId, cursor, limit = 10 } = payload;
      const contacts = await Contact.find({
        $and: [{ user: userId }, { validFor: userId }],
        ...(cursor && { createdAt: { $lt: cursor } }),
      })
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .populate("user", "fullName username profilePicture followers")
        .lean();

      let hasMore: boolean = contacts.length > limit;

      if (hasMore) {
        contacts.pop();
      }

      console.log("FETCHED CONTACS: ", contacts.length);

      return { contacts, hasMore };
    } catch (error) {
      throw new Error("getContacts, " + (error as Error));
    }
  },

  searchContactByUsers: async (
    users: [string, string]
  ): Promise<IContact | null> => {
    try {
      const [userId, otherUserId] = users;
      const contact = await Contact.findOne({
        user: {
          $all: [
            new mongoose.Types.ObjectId(userId),
            new mongoose.Types.ObjectId(otherUserId),
          ],
        },
        validFor: new mongoose.Types.ObjectId(userId),
      })
        .populate("user", "fullName username profilePicture followers")
        .lean();
      return contact;
    } catch (error) {
      throw new Error("searchContactByUsers" + (error as Error));
    }
  },

  getUniqueContacts: async (payload: { userId: string; users: IUser[] }) => {
    try {
      const { userId, users } = payload;
      const uniqueContactSet = new Set();

      for (let user of users) {
        const otherUserId = user._id.toString();

        const contact = await contactService.searchContactByUsers([
          userId,
          otherUserId,
        ]);

        if (contact) {
          const formData = contactFormatHelper.formatContactSigleData(
            userId,
            contact
          );
          uniqueContactSet.add(formData);
        }
      }

      return Array.from(uniqueContactSet);
    } catch (error) {
      throw new Error("getUniqueContacts" + (error as Error));
    }
  },

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
