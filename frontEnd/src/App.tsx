import Board from "./Components/Board";
import "./App.css";
import { useState } from "react";

const App = () => {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "">(
    ""
  );

  const handleDifficultyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDifficulty(event.target.value as "easy" | "medium" | "hard");
  };
  return (
    <div className="game_board">
      {!difficulty && (
        <div className="dropDown">
          <label htmlFor="difficulty">سطح بازی رو انتخاب کنید:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={handleDifficultyChange}
          >
            <option value="">انتخاب کنید</option>
            <option value="easy">آسون</option>
            <option value="medium">متوسط</option>
            <option value="hard">سخت</option>
          </select>
        </div>
      )}
      {difficulty && <Board difficulty={difficulty} />}
    </div>
  );
};

export default App;
