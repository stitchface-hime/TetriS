import { Game } from "@classes/Game";
import { Standard } from "@classes/Game";
import { Block } from "@classes/Piece";

import { Bag } from "@classes/PieceQueue";
import { Stopwatch } from "@classes/TimeMeasure";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameCanvas } from "src/components/GameCanvas";

const showConnections = false;
const connectionChar = [
    "•",
    "╴",
    "╷",
    "┐",
    "╶",
    "─",
    "┌",
    "┬",
    "╵",
    "┘",
    "│",
    "┤",
    "└",
    "┴",
    "└",
    "┼",
];

const getBlockColor = (
    cell: [x: number, y: number],
    game: Game | null,
    block: Block | null
) => {
    const activePiece = game?.getActivePiece();
    const activeBlock = activePiece
        ?.getBlocks()
        .find(
            (block) =>
                block.getActiveCoordinates()[0] === cell[0] &&
                block.getActiveCoordinates()[1] === cell[1]
        );

    if (activePiece && activeBlock) {
        return activeBlock.getColor();
    }

    if (block) {
        return block.getColor();
    }

    return "#000000";
};

const generateBlock = (
    cell: [x: number, y: number],
    game: Game | null,
    block: Block | null
) => {
    const activePiece = game?.getActivePiece();
    const activeBlock = activePiece
        ?.getBlocks()
        .find(
            (block) =>
                block.getActiveCoordinates()[0] === cell[0] &&
                block.getActiveCoordinates()[1] === cell[1]
        );
    if (activePiece && activeBlock) {
        return showConnections
            ? connectionChar[activeBlock.getConnections()]
            : "◼";
    }

    if (
        game
            ?.getGhostPieceCoordinates()
            ?.find(
                (coordinates) =>
                    coordinates[0] === cell[0] && coordinates[1] === cell[1]
            )
    ) {
        return "◼";
    }

    return block
        ? showConnections
            ? connectionChar[block.getConnections()]
            : "◼"
        : "◻";
};

/**
 * Debug only
 * @param game
 */
const gameSetup = (game: Game) => {
    /* game.getMatrix().addBlockRows(6);
    game.getMatrix().removeBlocks([
        [9, 0],
        [9, 1],
        [9, 2],
        [9, 3],
        [9, 4],
        [9, 5],
        [8, 2],
        [8, 3],
        [8, 4],
        [8, 5],
    ]); */
};

const getTime = (timer: Stopwatch) => {
    const data = timer.getRunTimeData();

    return `${data.minutes.toString().padStart(2, "0")}:${data.seconds
        .toString()
        .padStart(2, "0")}.${data.milliseconds.toString().padStart(3, "0")}`;
};

const App: React.FC = () => {
    const [ticker, setTicker] = useState(false);
    const requestAnimationFrameRef = useRef(0);
    // const timer = useRef(new Stopwatch());

    const gameInstance = useRef<Game | null>(null);

    // Re-render once every frame.
    const tick = useCallback(() => {
        setTicker((prev) => !prev);
        requestAnimationFrameRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        if (gameInstance.current) {
            // timer.current.run();
            requestAnimationFrameRef.current = requestAnimationFrame(tick);

            const keyDown = (e: KeyboardEvent) => {
                if (gameInstance.current) {
                    if (e.key === "a") {
                        gameInstance.current.moveLeft();
                        return;
                    }
                    if (e.key === "d") {
                        gameInstance.current.moveRight();
                        return;
                    }
                    if (e.key === "w") {
                        gameInstance.current.hardDrop();
                        return;
                    }
                    if (e.key === "s") {
                        gameInstance.current.enableSoftDrop();
                        return;
                    }
                    if (e.key === "b") {
                        gameInstance.current.rotateAntiClockwise();
                        return;
                    }
                    if (e.key === "j") {
                        gameInstance.current.rotateClockwise();
                    }
                    if (e.key === "q") {
                        gameInstance.current.hold();
                    }
                }
            };

            const keyUp = (e: KeyboardEvent) => {
                if (gameInstance.current) {
                    if (e.key === "s") {
                        gameInstance.current.disableSoftDrop();
                        return;
                    }
                }
            };
            window.addEventListener("keydown", keyDown);
            window.addEventListener("keyup", keyUp);

            return () => {
                cancelAnimationFrame(requestAnimationFrameRef.current);
                window.removeEventListener("keydown", keyDown);
                window.removeEventListener("keyup", keyUp);
            };
        }
    }, [tick]);

    useEffect(() => {
        const game = new Game(...Standard.getConfig());
        if (gameInstance.current) {
        } else {
            gameInstance.current = game;
            gameSetup(game);
            game.run();
        }
    }, []);

    if (gameInstance.current) {
        const game = gameInstance.current;
        const {
            level,
            gravity,
            autoDrop,
            autoDropFrameTarget,
            lockDelay,
            groundedMoves,
            blocks,
            linesCleared,
            holdPieceId,
            canHold,
        } = game.debugDetails();
        return (
            <div style={{ fontFamily: "monospace" }}>
                <table>
                    <tbody>
                        {[
                            ...game
                                .getMatrixGrid()
                                .slice(0, game.getNumVisibleRows() + 1),
                        ]
                            .reverse()
                            .map((row, rowIdx) => {
                                const rowNo = game.getNumVisibleRows() - rowIdx;
                                return (
                                    <tr
                                        key={`row-${rowNo}`}
                                        style={{
                                            lineHeight: "0.75rem",
                                        }}
                                    >
                                        {row.map((block, colIdx) => (
                                            <td
                                                key={`cell-${rowNo}-${colIdx}`}
                                                title={`${block?.getActiveCoordinates()} C${block?.getConnections()}[${block
                                                    ?.getConnections()
                                                    .toString(2)
                                                    .padStart(4, "0")}]`}
                                                style={{
                                                    color: getBlockColor(
                                                        [colIdx, rowNo],
                                                        gameInstance.current,
                                                        block
                                                    ),
                                                    fontSize: 16,
                                                }}
                                            >
                                                {generateBlock(
                                                    [colIdx, rowNo],
                                                    gameInstance.current,
                                                    block
                                                )}
                                            </td>
                                        ))}
                                        <td>{rowNo}</td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
                <div>
                    <div>Level {level}</div>
                    <div>Lines: {linesCleared}</div>
                    {/* <div>Time: {getTime(timer.current)}</div> */}
                    <br />
                    <div>Gravity: {gravity}</div>
                    <div>Auto drop timer: {autoDrop}</div>
                    <div>Auto drop timer target: {autoDropFrameTarget}</div>
                    <div>Auto lock timer: {lockDelay}</div>
                    <div>Grounded moves left: {groundedMoves}</div>
                    <div>Blocks: {blocks}</div>
                    <div>Hold: {holdPieceId}</div>
                    <div>Can hold: {`${canHold}`}</div>
                </div>
                <div style={{ position: "absolute", top: 0, left: "50%" }}>
                    <GameCanvas game={gameInstance.current} />
                </div>
            </div>
        );
    }

    return <>Failed to load {`${ticker}`}</>;
};

export default App;
