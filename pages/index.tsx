import { Game } from "@classes/Game";
import { Standard } from "@classes/Game";
import { Block } from "@classes/Piece";
import { PieceId } from "@classes/PieceFactory";
import { Bag } from "@classes/PieceQueue";
import { useCallback, useEffect, useRef, useState } from "react";

const generateBlock = (
    cell: [x: number, y: number],
    game: Game | null,
    block: Block | null
) => {
    const activePiece = game?.getActivePiece();

    if (
        activePiece &&
        activePiece
            .getBlocksCoordinates()
            .find(
                (coordinates) =>
                    coordinates[0] === cell[0] && coordinates[1] === cell[1]
            )
    ) {
        return "🟩";
    }

    return block ? "🔳" : "⬜";
};

const App: React.FC = () => {
    const [ticker, setTicker] = useState(false);
    const requestAnimationFrameRef = useRef(0);

    const gameInstance = useRef<Game | null>(null);

    // Re-render once every frame.
    const tick = useCallback(() => {
        setTicker((prev) => !prev);
        requestAnimationFrameRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        if (gameInstance.current) {
            requestAnimationFrameRef.current = requestAnimationFrame(tick);

            const key = (e: KeyboardEvent) => {
                console.log(e.key);
                if (gameInstance.current) {
                    if (e.key === "a") {
                        console.log("Left");
                        gameInstance.current.moveLeft();
                        return;
                    }
                    if (e.key === "d") {
                        console.log("Right");
                        gameInstance.current.moveRight();
                        return;
                    }
                    if (e.key === "w") {
                        console.log("Space");
                        gameInstance.current.hardDrop();
                        return;
                    }
                    if (e.key === "b") {
                        gameInstance.current.rotateAntiClockwise();
                        return;
                    }
                    if (e.key === "j") {
                        gameInstance.current.rotateClockwise();
                    }
                }
            };
            window.addEventListener("keydown", key);

            return () => {
                cancelAnimationFrame(requestAnimationFrameRef.current);
                window.removeEventListener("keydown", key);
            };
        }
    }, [tick]);

    useEffect(() => {
        const game = new Game(...Standard.getConfig());
        if (gameInstance.current) {
        } else {
            gameInstance.current = game;
            game.run();
        }
    }, []);

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
                        const rowNo = game.getNumVisibleRows() - rowIdx;
                        return (
                            <tr key={`row-${rowNo}`}>
                                {row.map((block, colIdx) => (
                                    <td key={`cell-${rowNo}-${colIdx}`}>
                                        {generateBlock(
                                            [colIdx, rowNo],
                                            gameInstance.current,
                                            block
                                        )}
                                    </td>
                                ))}
                                <td>{rowNo + 1}</td>
                            </tr>
                        );
                    })}
            </table>
        );
    }

    return <>Failed to load {`${ticker}`}</>;
};

export default App;
