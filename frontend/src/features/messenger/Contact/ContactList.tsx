import { useSelector } from "react-redux";
import "./ContactList.css";
import { RootState } from "../../../store/store";
import { userProfile } from "../../../utils/ImageUrlHelper";
import Spinner from "../../../Components/Spinner/Spinner";
import { useEffect } from "react";

interface ContactListProp {
  openConversation: (contactId: string, participantId: string) => void;
}

const ContactList = ({ openConversation }: ContactListProp) => {
  const { allIds, byId, loading } = useSelector(
    (state: RootState) => state.contact
  );

  const isContactEmpty = allIds.length === 0;

  return (
    <>
      <div className={`contact-list ${isContactEmpty ? "no-contact" : ""}`}>
        {loading ? (
          <Spinner />
        ) : isContactEmpty ? (
          <>No Contacts</>
        ) : (
          allIds.map((id, index) => {
            const contactData = byId[id];
            const userName = contactData.user.fullName.replace(/ .*/, "");

            return (
              <div
                key={index}
                className="contact-container"
                onClick={() =>
                  openConversation(contactData._id, contactData.user._id)
                }
              >
                <img
                  src={userProfile(
                    contactData.user.profilePicture!,
                    contactData.user._id
                  )}
                />
                <div className="contact-name">{userName}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default ContactList;
