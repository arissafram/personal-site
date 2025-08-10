import { Puzzle } from "react-jigsaw";
import "react-jigsaw/styles";

import Blurb from "./components/blurb";
import Header from "./components/header";
import Links from "./components/links";

import "./index.css";

const App = () => {
  return (
    <main className="main">
      <Header className="mobileHeader" />
      <div className="puzzle-container">
        <Puzzle
          image="/puzzle.jpg"
          options={{
            board: {
              columns: 3,
              rows: 3,
              width: 400,
              height: 450,
              outlineStrokeColor: "#a9a9a9",
              snapThreshold: 20,
              scatterArea: 50,
              showBoardSlotOutlines: true,
            },
            puzzle: {
              responsive: true,
              timer: {
                enabled: true,
              },
              refreshButton: {
                enabled: true,
              },
            },
            puzzlePiece: {
              strokeColor: "#32cd32",
              strokeEnabled: true,
            },
          }}
          responsive={true}
        />
      </div>
      <div className="content-container">
        <Header className="desktopHeader" />
        <Blurb />
        <Links />
      </div>
    </main>
  );
};

export default App;
