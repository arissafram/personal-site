import { Puzzle } from "react-jigsaw";
import "react-jigsaw/styles";

import Blurb from "./components/blurb";
import Header from "./components/header";
import Links from "./components/links";

import "./index.css";

const App = () => {
  return (
    <main className="main">
      <Header className="mobile-header" />
      <div className="puzzle-container">
        <Puzzle
          image="/puzzle.jpg"
          options={{
            board: {
              columns: 3,
              height: 450,
              outlineStrokeColor: "#a9a9a9",
              rows: 3,
              snapThreshold: 20,
              scatterArea: 50,
              showBoardSlotOutlines: true,
              width: 400,
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
        <Header className="desktop-header" />
        <Blurb />
        <Links />
      </div>
    </main>
  );
};

export default App;
