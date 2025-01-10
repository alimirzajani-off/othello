export type Player = "black" | "white";
export type Counter = { black: number; white: number | null };
export type Cell = Player | null;
export type Board = Cell[][];

export const evaluateBoard = (board: Board, player: Player): number => {
  const opponent = player === "black" ? "white" : "black";
  let playerScore = 0;
  let opponentScore = 0;

  const cornerPositions = [
    [0, 0],
    [0, 7],
    [7, 0],
    [7, 7],
  ];

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (board[x][y] === player) {
        playerScore += 1;

        // امتیاز بیشتر برای گوشه‌ها
        if (cornerPositions.some(([cx, cy]) => cx === x && cy === y)) {
          playerScore += 5;
        }
      } else if (board[x][y] === opponent) {
        opponentScore += 1;

        if (cornerPositions.some(([cx, cy]) => cx === x && cy === y)) {
          opponentScore += 5;
        }
      }
    }
  }

  return playerScore - opponentScore;
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

export const opponent = (player: Player): Player =>
  player === "black" ? "white" : "black";

// مقدار اولیه صفحه
export const initializeBoard = (): Board => {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";

  return board;
};

// بررسی آیا حرکت معتبر است یا نه
export const isValidMove = (
  board: Board,
  x: number,
  y: number,
  player: Player
): boolean => {
  if (board[x][y] !== null) return false;

  for (const [dx, dy] of directions) {
    let i = x + dx;
    let j = y + dy;
    let foundOpponent = false;

    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
      if (board[i][j] === null) break;
      if (board[i][j] !== player) foundOpponent = true;
      else if (foundOpponent) return true;

      i += dx;
      j += dy;
    }
  }

  return false;
};

export const getValidMoves = (
  board: Board,
  player: Player
): [number, number][] => {
  const moves: [number, number][] = [];
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (isValidMove(board, x, y, player)) {
        moves.push([x, y]);
      }
    }
  }
  return moves;
};

// تغییر رنگ مهره‌ها
export const flipCells = (
  board: Board,
  x: number,
  y: number,
  player: Player
): Board => {
  const newBoard = board.map((row) => [...row]);
  newBoard[x][y] = player;

  for (const [dx, dy] of directions) {
    let i = x + dx;
    let j = y + dy;
    const toFlip: [number, number][] = [];

    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
      if (newBoard[i][j] === null) break;
      if (newBoard[i][j] !== player) {
        toFlip.push([i, j]);
      } else {
        for (const [fx, fy] of toFlip) {
          newBoard[fx][fy] = player;
        }
        break;
      }

      i += dx;
      j += dy;
    }
  }

  return newBoard;
};

const directions = [
  [-1, 0], // بالا
  [1, 0], // پایین
  [0, -1], // چپ
  [0, 1], // راست
  [-1, -1], // بالا-چپ
  [-1, 1], // بالا-راست
  [1, -1], // پایین-چپ
  [1, 1], // پایین-راست
];

export const getLegalMoves = (board: string[][], player: "black" | "white") => {
  const opponent = player === "black" ? "white" : "black";
  const legalMoves: { row: number; col: number }[] = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] !== null) continue; // فقط خانه‌های خالی را بررسی می‌کنیم

      for (const [dx, dy] of directions) {
        let x = row + dx;
        let y = col + dy;
        let hasOpponentBetween = false;

        // حرکت در جهت فعلی
        while (
          x >= 0 &&
          y >= 0 &&
          x < board.length &&
          y < board[x].length &&
          board[x][y] === opponent
        ) {
          hasOpponentBetween = true; // حداقل یک مهره حریف پیدا شده است
          x += dx;
          y += dy;
        }

        // بررسی شرایط نهایی
        if (
          hasOpponentBetween && // حداقل یک مهره حریف باید بین باشد
          x >= 0 &&
          y >= 0 &&
          x < board.length &&
          y < board[x].length &&
          board[x][y] === player // باید به مهره خودی ختم شود
        ) {
          legalMoves.push({ row, col });
          break; // نیازی نیست دیگر جهت‌ها را بررسی کنیم
        }
      }
    }
  }
  return legalMoves;
};

export const isGameOver = (board: string[][]) => {
  const blackMoves = getLegalMoves(board, "black");
  const whiteMoves = getLegalMoves(board, "white");

  const hasEmptyCells = board.some((row) => row.includes(""));

  return !hasEmptyCells || (blackMoves.length === 0 && whiteMoves.length === 0);
};
