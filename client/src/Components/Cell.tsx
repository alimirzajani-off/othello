import { motion } from "framer-motion";

interface CellProps {
  value: string | null;
  className: string;
  onClick: () => void;
}

const Cell = ({ value, className, onClick }: CellProps) => {
  return (
    <div className="cell_container">
      <motion.div
        className={`cell ${value} ${className}`}
        onClick={onClick}
        style={
          {
            // backgroundColor: value
            //   ? value === "black"
            //     ? "#000"
            //     : "#fff"
            //   : "#ccc",
            // border: "1px solid #888",
          }
        }
        animate={{
          // scale: value ? 1.2 : 1,
          backgroundColor: value ? (value === "black" ? "#000" : "#fff") : null,
          // : "#ccc",
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default Cell;
