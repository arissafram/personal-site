import Blurb from "../blurb";
import Header from "../header";
import Links from "../links";

import "./styles.css";

// Text only: the name on the left, the role, bio and links on the right, on
// the same two-column grid as the game slides. Stacks on phones.
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
