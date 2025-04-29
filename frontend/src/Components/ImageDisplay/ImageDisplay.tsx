import { useEffect, useState } from "react";
import "./ImageDisplay.css";

import { AppDispatch } from "../../store/store";
import { useDispatch } from "react-redux";
import { viewImage } from "../Modal/globalSlice";
import { getImages } from "../../features/users/userSlice";
import Spinner from "../Spinner/Spinner";

interface ImageDisplayProp {
  userId: string;
}

const ImageDisplay = ({ userId }: ImageDisplayProp) => {
  const [path, setPath] = useState("posts");
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const [imagesData, setImagesData] = useState<{
    profile: string[];
    posts: string[];
  }>();

  const viewImageModal = (src: string) => {
    dispatch(viewImage({ src }));
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await dispatch(getImages(userId)).unwrap();

        setImagesData((prev) => {
          return {
            ...prev,
            posts: res.images?.posts!,
            profile: res.images?.profile!,
          };
        });
      } catch (error) {
        console.log("Failed to fetch images: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [userId]);

  return (
    <div className="static-image-container">
      <div className="image-list-container">
        <div className="images-navbar">
          <ul className="menu">
            <li
              onClick={() => setPath("posts")}
              id={path === "posts" ? "active-path" : undefined}
            >
              Post
            </li>
            <li
              onClick={() => setPath("profile")}
              id={path === "profile" ? "active-path" : undefined}
            >
              Profile
            </li>
          </ul>
        </div>
        <div className="images-list">
          {loading ? (
            <Spinner />
          ) : path === "posts" ? (
            !imagesData || imagesData.posts.length === 0 ? (
              <span>User doesn't have post photos</span>
            ) : (
              imagesData.posts.map((img, index) => (
                <div
                  key={index}
                  className="image-box"
                  onClick={() => viewImageModal(img)}
                >
                  <img src={img} />
                </div>
              ))
            )
          ) : !imagesData || imagesData.profile.length === 0 ? (
            <span>User doesn't have profile photos</span>
          ) : (
            imagesData.profile.map((img, index) => (
              <div
                key={index}
                className="image-box"
                onClick={() => viewImageModal(img)}
              >
                <img src={img} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDisplay;
