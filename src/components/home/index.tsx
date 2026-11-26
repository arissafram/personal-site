import Blurb from "../blurb";
import Header from "../header";
import Links from "../links";

import "./styles.css";

// Text only: the name, then the role, bio and links in one wide column.
const Home = () => {
  return (
    <div className="main">
      <Header />
      <div className="content-container">
        <Blurb />
        <Links />
      </div>
    </div>
  );
};

export default Home;
