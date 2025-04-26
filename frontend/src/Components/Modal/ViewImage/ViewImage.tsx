import "./ViewImage.css";
import { viewImageClose, ViewImageState } from "../globalSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";

const ViewImage: React.FC<ViewImageState> = ({ show, src }) => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <>
      <div className={`modal fade ${show ? "show d-block" : ""}`}>
        <div className="modal-dialog view-image-modal">
          <div className="modal-content">
            <div className="modal-body view-image-body">
              <div className="view-image-header">
                <h5>View Image</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => dispatch(viewImageClose())}
                ></button>
              </div>
              <div className="view-box-container">
                <img src={src} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewImage;
