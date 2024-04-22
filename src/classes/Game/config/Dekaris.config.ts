import { Bag } from "@classes/PieceQueue";
import { PieceId } from "@data/PieceId";
import { GameConfig } from "./types";

export const getConfig = (): GameConfig => {
    return [
        7,
        6,
        new Bag([
            PieceId.TETROMINO_I,
            PieceId.TETROMINO_J,
            PieceId.TETROMINO_L,
            PieceId.TETROMINO_O,
            PieceId.TETROMINO_S,
            PieceId.TETROMINO_T,
            PieceId.TETROMINO_Z,
        ]),
        [2, 8],
    ];
};
