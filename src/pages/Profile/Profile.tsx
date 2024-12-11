import PostList from "../../features/posts/PostList/PostList";
import "./profile.css";
const Profile = () => {
  return (
    <div className="profile-cont">
      <div className="profile-main">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv9vTXdwwkpbReYqTda51_edFZyXLiAruItw&s"
          alt=""
        />
        <div className="profile-info">
          <h1>Hamir Halik</h1>
          <span>2 Followers</span> <span>3 Following</span>
          <div className="bio">
            <span>
              All my wins are from God andd all my Losses are mine alone
            </span>
          </div>
        </div>
        <button>Edit Profile</button>
      </div>
      <hr />
      <div className="uploads">
        <div>
          <span>Photos</span>
        </div>

        <div>
          <span>Vidoes</span>
        </div>
      </div>
      <PostList></PostList>
    </div>
  );
};

export default Profile;
