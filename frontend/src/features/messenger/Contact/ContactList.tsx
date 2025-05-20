import { useSelector } from "react-redux";
import "./ContactList.css";
import { RootState } from "../../../store/store";
import { useEffect } from "react";
import { userProfile } from "../../../utils/ImageUrlHelper";
import Spinner from "../../../Components/Spinner/Spinner";

const ContactList = () => {
  const { allIds, byId, loading } = useSelector(
    (state: RootState) => state.contact
  );

  useEffect(() => {
    console.log("All contacts", byId, allIds);
  }, [byId, allIds]);

  return (
    <>
      <div className={`contact-list ${false ? "no-contact" : ""}`}>
        {loading ? (
          <Spinner />
        ) : allIds.length === 0 ? (
          <>No Contacts</>
        ) : (
          allIds.map((id, index) => {
            const contactData = byId[id];
            return (
              <div key={index} className="contact-container">
                <img
                  src={userProfile(
                    contactData.user.profilePicture || "",
                    contactData.user._id
                  )}
                  alt=""
                />
                <div className="contact-name">
                  {contactData.user.fullName.replace(/ .*/, "")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default ContactList;
