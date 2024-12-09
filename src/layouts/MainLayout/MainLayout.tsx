import Navbar from "../../Components/Navbar/Navbr";
import "./MainLayout.css";

import { Outlet } from "react-router";

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        <div className="main-container">
          <div className="create-post">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv9vTXdwwkpbReYqTda51_edFZyXLiAruItw&s"
              alt=""
            />
            <input type="text" placeholder="Whats on your mind, Name?" />
            <div className="upload">
              <span className="material-symbols-outlined">add_a_photo</span>
              <span id="text">Photo/Video</span>
            </div>
            <button>POST</button>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
