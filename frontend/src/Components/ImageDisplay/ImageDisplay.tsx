import { useEffect, useState } from "react";
import "./ImageDisplay.css";

import { AppDispatch } from "../../store/store";
import { useDispatch } from "react-redux";
import { viewImage } from "../Modal/globalSlice";
import { getImages } from "../../features/users/userSlice";

interface ImageDisplayProp {
  userId: string;
}

const ImageDisplay = ({ userId }: ImageDisplayProp) => {
  const [path, setPath] = useState("posts");
  const dispatch = useDispatch<AppDispatch>();

  const [imagesData, setImagesData] = useState<{
    userId: string;
    profile?: string[];
    posts?: string[];
  }>({
    userId: "",
  });

  const viewImageModal = (src: string) => {
    dispatch(viewImage({ src }));
  };

  const fetchImage = async (userId: string, path: string) => {
    try {
      const res = await dispatch(getImages({ userId, path })).unwrap();
      const { images, userId: id } = res;

      return { images, id };
    } catch (error) {
      console.log("Failed to get image: ", error);
      return { images: [], id: userId };
    } finally {
    }
  };

  useEffect(() => {
    const getImageLib = async () => {
      const { userId: currentId } = imagesData;

      const needsFetch =
        !currentId ||
        currentId !== userId ||
        (path === "profile" && !imagesData.profile?.length);

      if (!needsFetch) {
        return;
      }

      const { id, images } = await fetchImage(userId, path);

      setImagesData((prev) => {
        const updated = { ...prev, userId: id };
        if (path === "posts") {
          updated.posts = images;
        } else if (path === "profile") {
          updated.profile = images;
        }
        return updated;
      });
    };

    getImageLib();
  }, [userId, path]);

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
          {path === "posts" ? (
            !imagesData.posts || imagesData.posts.length === 0 ? (
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
          ) : !imagesData.profile || imagesData.profile.length === 0 ? (
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
