import { Game } from "@classes/Game";
import { Standard } from "@classes/Game";
import { Block } from "@classes/Piece";

import { Bag } from "@classes/PieceQueue";
import { Stopwatch } from "@classes/TimeMeasure";
import { isEqual2DVectorTuples } from "@utils/isEqual2DVectorTuples";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameCanvas } from "src/components/GameCanvas";

const showConnections = false;
const connectionChar = ["•", "╴", "╷", "┐", "╶", "─", "┌", "┬", "╵", "┘", "│", "┤", "└", "┴", "└", "┼"];

const getBlockColor = (game: Game | null, block: Block | null) => {
    if (block) {
        return block.getColor();
    }

    return "#000000";
};

const getChar = (block: Block | null) => {
    return block ? (showConnections ? connectionChar[block.getConnections()] : "◼") : "◻";
};

const generateBlock = (cell: [number, number], game: Game | null, block: Block | null) => {
    return (
        <td
            key={`cell-${cell[1]}-${cell[0]}`}
            title={`${block?.getActiveCoordinates()} C${block?.getConnections()}[${block
                ?.getConnections()
                .toString(2)
                .padStart(4, "0")}] ${block?.getPosition()}`}
            style={{
                color: getBlockColor(game, block),
                fontSize: 16,
            }}
        >
            {getChar(block)}
        </td>
    );
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

    return `${data.minutes.toString().padStart(2, "0")}:${data.seconds.toString().padStart(2, "0")}.${data.milliseconds.toString().padStart(3, "0")}`;
};

const App: React.FC = () => {
    const [ticker, setTicker] = useState(false);
    const requestAnimationFrameRef = useRef(0);
    // const timer = useRef(new Stopwatch());

    const gameInstance = useRef<Game | null>(null);
    const [revealTable, setRevealTable] = useState(false);

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
        }
    }, []);

    if (gameInstance.current) {
        const game = gameInstance.current;
        const { level, gravity, autoDrop, autoDropFrameTarget, lockDelay, groundedMoves, blocks, linesCleared, holdPieceId, canHold } = game.debugDetails();

        const ghostCoordinates = game.getGhostPieceCoordinates();
        return (
            <div style={{ fontFamily: "monospace" }}>
                {revealTable ? (
                    <table>
                        <tbody>
                            {[...new Array(game.getNumVisibleRows() + 1)].map((_, rowIdx) => {
                                const rowNo = game.getNumVisibleRows() + 1 - rowIdx - 1;
                                return (
                                    <tr
                                        key={`row-${rowNo}`}
                                        style={{
                                            lineHeight: "0.75rem",
                                        }}
                                    >
                                        {[...new Array(game.getMatrix().getNumColumns())].map((_, colIdx) => {
                                            const coords: [number, number] = [colIdx, rowNo];
                                            let block = game.getMatrix().getBlock(coords) || null;

                                            if (!block) {
                                                block =
                                                    game
                                                        .getActivePiece()
                                                        ?.getBlocks()
                                                        .find((block) => isEqual2DVectorTuples(block.getActiveCoordinates(), coords)) || null;
                                            }

                                            if (!block) {
                                                block = ghostCoordinates?.find((ghostCoords) => isEqual2DVectorTuples(coords, ghostCoords))
                                                    ? new Block(coords, game.getMatrix(), `${game.getActivePiece()?.getBlocks()[0].getColor()}80`)
                                                    : null;
                                            }

                                            return generateBlock([colIdx, rowIdx], game, block);
                                        })}
                                        {rowNo}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : null}
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
                <button onClick={() => setRevealTable((prev) => !prev)}>Reveal playfield as table</button>
                <button
                    onClick={() => {
                        console.log("Blocks in game:", game.getMatrix().getBlocks());
                    }}
                >
                    Get blocks
                </button>
                <button
                    onClick={() => {
                        console.log(game.getRenderer().getEntities());
                    }}
                >
                    Get entities
                </button>
                <div style={{ position: "absolute", top: 0, left: "50%" }}>
                    <GameCanvas game={gameInstance.current} />
                </div>
            </div>
        );
    }

    return <>Failed to load {`${ticker}`}</>;
};

export default App;
