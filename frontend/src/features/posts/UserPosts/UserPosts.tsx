import "./UserPosts.css";
import Post from "../Post/Post";
import Spinner from "../../../Components/Spinner/Spinner";
import { FetchPostType } from "../../../types/PostType";

interface PostProp {
  posts?: FetchPostType[];
  loading: Boolean;
}

const UserPosts = ({ posts, loading }: PostProp) => {
  return (
    <>
      <div className="postlist-container">
        {loading ? (
          <Spinner />
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id}>
              <Post post={post} ownerId={post.user} />
            </div>
          ))
        ) : (
          <div>No uploaded post</div>
        )}
      </div>
    </>
  );
};

export default UserPosts;
