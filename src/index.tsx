import { Puzzle } from "react-jigsaw";
import "react-jigsaw/styles";

import Blurb from "./components/blurb";
import Header from "./components/header";
import Links from "./components/links";
import { PUZZLE_OPTIONS } from "./constants";

import "./index.css";

function App() {
  const handleComplete = () => {
    console.log("Puzzle completed!");
  };

  const handleRefresh = () => {
    console.log("Puzzle refreshed!");
  };

  return (
    <main className="main">
      <div className="game-container">
        <Puzzle
          image="/puzzle.jpg"
          options={{
            board: {
              columns: 4,
              rows: 3,
              width: 400,
              height: 450,
              outlineStrokeColor: "red",
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
          onComplete={handleComplete}
          onRefresh={handleRefresh}
          responsive={true}
        />
      </div>
      <div className="content-container">
        <Header />
        <Blurb />
        <Links />
      </div>
    </main>
  );
}

export default App;
