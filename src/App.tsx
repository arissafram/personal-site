import { Puzzle } from "react-jigsaw";
import "react-jigsaw/styles";

function App() {
  const handleComplete = () => {
    console.log("Puzzle completed!");
  };

  const handleRefresh = () => {
    console.log("Puzzle refreshed!");
  };

  const puzzleOptions = {
    board: {
      columns: 4,
      rows: 3,
      width: 400,
      height: 300,
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
      strokeColor: "gold",
      strokeEnabled: true,
    },
  };

  return (
    <main className="container">
      <header>
        <h1 className="header header-mobile">Arissa Fram.</h1>
      </header>
      <div className="game-container">
        <Puzzle
          image="/public/puzzle_1.jpg"
          options={puzzleOptions}
          onComplete={handleComplete}
          onRefresh={handleRefresh}
          responsive={true}
        />
      </div>
      <div className="content-container">
        <header>
          <h1 className="header">Arissa Fram.</h1>
        </header>
        <section className="paragraph">
          <p className="job-title">
            Senior software engineer @ Underdog Fantasy
          </p>
          <p className="promocode">Promocode: BIGRISS</p>
          <p className="blurb">
            I like languages and puzzles and live music. I study French. I live
            in Brooklyn. I like deadlines and winning as a team. I own a lot of
            useless domains. I have a lot of half-baked ideas. I love my job.
          </p>
          <p className="skills">
            NodeJS, React, Typescript, Javascript, Webpack, NextJS,
            REST/Graphql, Jest, etc. etc., iOS dreams.
          </p>
        </section>
        <ul className="links">
          <li className="link">
            <a
              target="_blank"
              href="https://www.linkedin.com/in/arissafram/"
              rel="noopener noreferrer"
            >
              Linkedin
            </a>
          </li>
          <li className="link">
            <a
              target="_blank"
              href="https://www.linkedin.com/posts/underdogfantasy_udlife-activity-7084570560994652160-1eI4?utm_source=share&utm_medium=member_desktop"
              rel="noopener noreferrer"
            >
              Me at work
            </a>
          </li>
          <li className="link">
            <a
              target="_blank"
              href="https://www.strava.com/athletes/61215365"
              rel="noopener noreferrer"
            >
              Strava
            </a>
          </li>
          <li className="link">
            <a
              target="_blank"
              href="https://medium.com/@arissafram/aws-amplify-with-squarespace-domain-7d6a1505e98c"
              rel="noopener noreferrer"
            >
              Medium
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}

export default App;
