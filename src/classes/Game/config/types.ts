import { PieceQueue } from "@classes/PieceQueue";

export type GameConfig = [
    numRows: number,
    numColumns: number,
    pieceQueue: PieceQueue,
    spawnCoordinates: [x: number, y: number]
];
