import { Game } from "@classes/Game";
import { PieceId } from "@classes/PieceFactory";
import { Bag } from "@classes/PieceQueue";
import { useRef } from "react";

const App: React.FC = () => {
    const gameInstance = useRef<Game | null>();

    return (
        <div>
            {" "}
            Hello{" "}
            <button
                onClick={() => {
                    gameInstance.current = new Game(
                        20,
                        10,
                        new Bag([PieceId.TETROMINO_I]),
                        [4, 19]
                    );
                }}
            >
                Init. game
            </button>{" "}
        </div>
    );
};

export default App;
