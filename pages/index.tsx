import { Game } from "@classes/Game";
import { Standard } from "@classes/Game";
import { Block } from "@classes/Piece";
import { PieceId } from "@classes/PieceFactory";
import { Bag } from "@classes/PieceQueue";
import { useCallback, useEffect, useRef, useState } from "react";

const App: React.FC = () => {
    const [ticker, setTicker] = useState(false);
    const requestAnimationFrameRef = useRef(0);

    const gameInstance = useRef<Game | null>(null);

    // Re-render once every frame.
    const tick = useCallback(() => {
        setTicker((prev) => !prev);
        gameInstance.current?.tick();
        console.log(gameInstance.current?.getMatrix().printMatrix());
        requestAnimationFrameRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        const game = new Game(...Standard.getConfig());
        gameInstance.current = game;
        requestAnimationFrameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(requestAnimationFrameRef.current);
    }, [tick]);

    if (gameInstance.current) {
        const game = gameInstance.current;
        return (
            <table>
                {[
                    ...game
                        .getMatrixGrid()
                        .slice(0, game.getNumVisibleRows() + 1),
                ]
                    .reverse()
                    .map((row, rowIdx) => {
                        const rowNo = game.getNumVisibleRows() + 1 - rowIdx;
                        return (
                            <tr key={`row-${rowNo}`}>
                                {row.map((block, colIdx) => (
                                    <td key={`cell-${rowNo}-${colIdx}`}>
                                        {block ? "🔳" : "⬜"}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
            </table>
        );
    }

    return <>Failed to load {`${ticker}`}</>;
};

export default App;
