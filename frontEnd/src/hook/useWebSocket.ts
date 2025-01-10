import { useState, useEffect } from "react";

const useWebSocket = (roomId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [opponentJoined, setOpponentJoined] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      ws.send(JSON.stringify({ type: "join_room", payload: { roomId } }));
    };

    ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data);

      if (type === "opponent_joined") {
        setOpponentJoined(true);
      }

      if (type === "move") {
        console.log("Opponent's move:", payload);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomId]);

  const sendMove = (move: { row: number; col: number }) => {
    if (socket) {
      socket.send(JSON.stringify({ type: "move", payload: { roomId, move } }));
    }
  };

  return { sendMove, opponentJoined };
};

export default useWebSocket;
