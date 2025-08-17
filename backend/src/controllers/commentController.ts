import { Request, Response } from "express";
import { errorLog } from "../services/errHandler";
import { commentService } from "../services/comment.service";

export const getComments = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const cursor = req.query.cursor as string;

    const { comments, hasMore } = await commentService.getComments({
      postId,
      cursor,
    });

    res.json({
      succes: true,
      message: "comment retrived",
      comments: comments,
      hasMore: hasMore,
    });
  } catch (error) {
    errorLog("addComment", error as Error);
    res.json({ succes: false, message: "Error" });
  }
};
