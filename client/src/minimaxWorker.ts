import {
  flipCells,
  getValidMoves,
  opponent,
  evaluateBoard,
  Board,
  Player,
} from "./Utils/gameLogic";

// مدیریت پیام دریافتی
onmessage = (e: MessageEvent) => {
  const { board, player, depth } = e.data;

  const validMoves = getValidMoves(board, player);
  let bestMove: [number, number] | null = null;
  let bestScore = -Infinity;

  for (const [x, y] of validMoves) {
    const newBoard = flipCells(board, x, y, player);
    const score = minimax(
      newBoard,
      depth - 1,
      false,
      player,
      -Infinity,
      Infinity
    );
    if (score > bestScore) {
      bestScore = score;
      bestMove = [x, y];
    }
  }

  postMessage({ bestMove });
};

export const minimax = (
  board: Board,
  depth: number,
  maximizingPlayer: boolean,
  player: Player,
  alpha: number = -Infinity,
  beta: number = Infinity
): number => {
  if (depth === 0 || getValidMoves(board, player).length === 0) {
    return evaluateBoard(board, player);
  }

  const validMoves = getValidMoves(
    board,
    maximizingPlayer ? player : opponent(player)
  );

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const [x, y] of validMoves) {
      const newBoard = flipCells(board, x, y, player);
      const evalScore = minimax(
        newBoard,
        depth - 1,
        false,
        player,
        alpha,
        beta
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // بریدن شاخه
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [x, y] of validMoves) {
      const newBoard = flipCells(board, x, y, opponent(player));
      const evalScore = minimax(newBoard, depth - 1, true, player, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // بریدن شاخه
    }
    return minEval;
  }
};

export {};
