import { Request, Response } from "express";
import { Contact } from "../models/contactModel";

// | Where        | Used For                        | Example                   | Data Type        |
// | ------------ | ------------------------------- | ------------------------- | ---------------- |
// | `req.body`   | Creating/updating data          | `{ "name": "Brian" }`     | JSON or form     |
// | `req.params` | Identifying a specific resource | `/users/123` → `id = 123` | String           |
// | `req.query`  | Filtering/sorting/pagination    | `/products?sort=price`    | String key-value |

interface AuthReq extends Request {
  userId?: string;
}

export const createContact = async (
  req: AuthReq,
  res: Response
): Promise<any> => {
  try {
    const owner = req.userId;
    const { userId } = req.body;

    await Contact.create({
      owner,
      user: userId,
    });

    res.json({
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

    const contactData = await Contact.find({ owner: userId }).populate("user");
    res.json({
      success: true,
      contacts: contactData,
      message: "contact succesfully fetched",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export const removeContact = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { userId, contactId } = req.params;
    const ressult = await Contact.deleteOne(
      {
        _id: { $eq: contactId },
      },
      {
        user: { $eq: userId },
      }
    );

    res.json({
      success: true,
      message: "contact succesfully deleted",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
