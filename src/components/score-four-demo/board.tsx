import { ScoreFour } from "score-four";
import "score-four/styles";

// Split out so React.lazy puts the package and Three.js in their own chunk.
const Board = () => <ScoreFour className="score-four-board" opponent="cpu" showTitle={false} />;

export default Board;
