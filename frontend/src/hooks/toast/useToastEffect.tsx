import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { FollowPayload } from "../../types/user";
import toast from "react-hot-toast";
import { followToggled } from "../../features/users/userSlice";
import { deleteConversation } from "../../features/messenger/Conversation/conversationSlice";

export interface FollowPayloadToast {
  followPayload: FollowPayload;
  toastPayload: {
    isUnfollowing: boolean;
    userFullName: string;
  };
}

export const useToastEffect = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleFollowEffect = async (payload: FollowPayloadToast) => {
    const { followPayload } = payload;
    const { isUnfollowing, userFullName } = payload.toastPayload;

    try {
      await toast.promise(
        dispatch(followToggled(followPayload)),
        {
          loading: "Loading...",
          success: (
            <b>
              {`You ${
                isUnfollowing ? "Unfollowed" : "Followed"
              } ${userFullName.replace(/ .*/, "")}`}
              !
            </b>
          ),
          error: <b>Failed to follow this user.</b>,
        },
        {
          success: {
            style: {
              border: "2px solid rgb(70, 74, 72)",
              padding: "13px",
              color: "black",
              backgroundColor: "white",
            },
            iconTheme: {
              primary: `${isUnfollowing ? "red" : "#10b981"}`,
              secondary: "black",
            },
          },
        }
      );
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteEffect = async (convoId: string): Promise<void> => {
    try {
      await toast.promise(dispatch(deleteConversation(convoId)), {
        loading: "Deleting...",
        success: <b>Conversation deleted!</b>,
        error: <b>Failed to delete conversation.</b>,
      });
    } catch (error) {
      throw error;
    }
  };

  return { handleFollowEffect, handleDeleteEffect };
};
