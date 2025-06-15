import { useDispatch, useSelector } from "react-redux";
import "./ViewMessageImage.css";
import { AppDispatch, RootState } from "../../../store/store";
import { toggleViewMessageImage } from "../../../Components/Modal/globalSlice";
import { useEffect } from "react";

const ViewMessageImage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { url, show } = useSelector(
    (state: RootState) => state.global.viewMessageImage
  );

  useEffect(() => {
    console.log("View message image udate: ", url, show);
  }, [url, show]);
  return (
    <>
      {show && (
        <div className="message-image-container">
          <img src={url} />
          <span
            id="close-message-image"
            onClick={() => dispatch(toggleViewMessageImage(""))}
          >
            X
          </span>
        </div>
      )}
    </>
  );
};

export default ViewMessageImage;
