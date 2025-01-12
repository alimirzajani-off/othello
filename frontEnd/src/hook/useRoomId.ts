import { useSearchParams } from "react-router-dom";

const useRoomId = () => {
  const [searchParams] = useSearchParams();
  return searchParams.get("roomId") || "";
};

export default useRoomId;
