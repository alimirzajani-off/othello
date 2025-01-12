import { useEffect, useState } from "react";
import Worker from "../../minimaxWorker.ts?worker";
import {
  initializeBoard,
  flipCells,
  isValidMove,
  Player,
  getLegalMoves,
  Counter,
  // isGameOver,
} from "../../Utils/gameLogic";
import Cell from "../Cell";
import { motion } from "framer-motion";
import "./Board.css";

interface BoardProps {
  difficulty: string;
}

const Board = ({ difficulty }: BoardProps) => {
  const [board, setBoard] = useState(initializeBoard());
  const [boardCounter, setBoardCounter] = useState<Counter>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("black");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleReset = () => {
    setSeconds(0);
    // onReset();
  };

  const getDepthByDifficulty = () => {
    switch (difficulty) {
      case "easy":
        return 1; // ربات فقط حرکت بعدی را بررسی می‌کند
      case "medium":
        return 3; // ربات چند حرکت جلوتر را بررسی می‌کند
      case "hard":
        return 5; // ربات سخت‌ترین سطح است
      default:
        return 3;
    }
  };

  const handleClick = (x: number, y: number) => {
    const depth = getDepthByDifficulty();
    if (isBotThinking || !isValidMove(board, x, y, currentPlayer)) return;

    const newBoard = flipCells(board, x, y, currentPlayer);
    setBoard(newBoard);
    checkGameOver();

    if (gameOver) return;

    const nextPlayer = currentPlayer === "black" ? "white" : "black";
    setCurrentPlayer(nextPlayer);

    if (nextPlayer === "white") {
      const worker = new Worker();
      setIsBotThinking(true);

      worker.postMessage({ board: newBoard, player: "white", depth });

      worker.onmessage = (e) => {
        const { bestMove } = e.data;

        if (bestMove) {
          const [botX, botY] = bestMove;
          if (!isValidMove(newBoard, botX, botY, "white")) return;
          setTimeout(() => {
            const updatedBoard = flipCells(newBoard, botX, botY, "white");
            setBoard(updatedBoard);
            checkGameOver();
            if (!gameOver) setCurrentPlayer("black");
            setIsBotThinking(false);
            worker.terminate();
          }, 750);
        } else {
          setCurrentPlayer("black");
          setIsBotThinking(false);
          worker.terminate();
        }
      };
    }
  };

  const legalMoves = getLegalMoves(board, currentPlayer);

  const resetGame = (e: any) => {
    e.preventDefault();
    handleReset();
    setBoard(initializeBoard()); // ریست کردن برد
    setCurrentPlayer("black"); // بازیکن شروع مجدد
    setIsBotThinking(false); // اطمینان از عدم تفکر ربات
    setGameOver(false); // غیرفعال کردن حالت پایان
    setGameOverMessage("");
  };

  useEffect(() => {
    //     if (isGameOver(board)) {
    //       setGameOver(true);
    //     }
    const counter: Counter = { black: 0, white: 0 };
    board.map((item) => {
      item.map((it) => {
        if (it == "black") counter.black++;
        else if (it == "white") counter.white++;
      });
    });
    setBoardCounter(counter);
  }, [board, currentPlayer]);

  const checkGameOver = () => {
    const blackMoves = getLegalMoves(board, "black");
    const whiteMoves = getLegalMoves(board, "white");

    const blackCount = board.flat().filter((cell) => cell === "black").length;
    const whiteCount = board.flat().filter((cell) => cell === "white").length;

    // شرایطی که بازی تمام می‌شود:
    if (blackMoves.length === 0 && whiteMoves.length === 0) {
      if (blackCount > whiteCount) {
        setGameOverMessage("بازی تمام شد! مشکی برنده شد");
      } else if (whiteCount > blackCount) {
        setGameOverMessage("بازی تمام شد! سفید برنده شد");
      } else {
        setGameOverMessage("بازی تمام شد! مساوی شد");
      }
      setGameOver(true);
      return;
    }

    // اگر یکی از بازیکنان دیگر مهره‌ای ندارد:
    if (blackCount === 0 || whiteCount === 0) {
      setGameOverMessage(
        blackCount === 0
          ? "بازی تمام شد! سفید برنده شد"
          : "بازی تمام شد! مشکی برنده شد"
      );
      setGameOver(true);
      return;
    }

    // اگر بازیکن فعلی حرکت قانونی ندارد، نوبت به بازیکن دیگر منتقل می‌شود:
    if (currentPlayer === "black" && blackMoves.length === 0) {
      setGameOverMessage("مشکی حرکت قانونی ندارد. نوبت سفید!");
      setCurrentPlayer("white");
    } else if (currentPlayer === "white" && whiteMoves.length === 0) {
      setGameOverMessage("سفید حرکت قانونی ندارد. نوبت مشکی!");
      setCurrentPlayer("black");
    }
  };

  return (
    <>
      <div className="game_status">
        <div className="board_counter">
          کاربر {boardCounter?.black} | {boardCounter?.white} ربات
        </div>
        {currentPlayer == "black" ? (
          <div className="currentPlayer">نوبت شماست</div>
        ) : (
          <div className="currentPlayer">نوبت رباته</div>
        )}
      </div>
      <div className="game_timer">
        <div style={{ textAlign: "center" }}>
          <h3>{formatTime(seconds)}</h3>
        </div>
        <div onClick={(e) => resetGame(e)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="black"
          >
            <path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z" />
          </svg>
        </div>
        <div>
          سطح بازی:
          {difficulty == "easy" ? (
            <>آسون</>
          ) : difficulty == "medium" ? (
            <>متوسط</>
          ) : (
            <>سخت </>
          )}
        </div>
      </div>
      <div className="board">
        {board.map((row, x) =>
          row.map((cell, y) => {
            const isLegalMove = legalMoves.some(
              (move) => move.row === x && move.col === y
            );
            return (
              <Cell
                key={`${x}-${y}`}
                value={cell}
                className={`${
                  // isLegalMove ? "legal-move" : ""
                  isLegalMove && currentPlayer == "black" ? "legal-move" : ""
                }`}
                onClick={() => handleClick(x, y)}
              />
            );
          })
        )}
      </div>
      {isBotThinking && (
        <motion.div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ffa",
            padding: "10px 20px",
            borderRadius: "10px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            width: "max-content",
          }}
          // animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
          // transition={{ repeat: Infinity, duration: 2 }}
        >
          صبر کن.ربات داره فکر میکنه...
        </motion.div>
      )}
      {gameOver && (
        <div className="game-over">
          <p>{gameOverMessage}</p>
          <button onClick={resetGame}>Restart Game</button>
        </div>
      )}
    </>
  );
};

export default Board;
