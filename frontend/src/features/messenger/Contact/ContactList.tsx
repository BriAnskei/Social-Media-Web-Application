import { contactList } from "../../../assets/assets";
import "./ContactList.css";

const ContactList = () => {
  return (
    <>
      <div className={`contact-list ${false ? "no-contact" : ""}`}>
        {false ? (
          <>No Contacts</>
        ) : (
          contactList.map((contact, index) => (
            <div key={index} className="contact-container">
              <img src={contact.profile} alt="" />
              <div className="contact-name">
                {contact.name.replace(/ .*/, "")}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ContactList;
