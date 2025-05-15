import { Contact } from "../models/contactModel";

export const validUsers = async (contactId: string) => {
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
};
