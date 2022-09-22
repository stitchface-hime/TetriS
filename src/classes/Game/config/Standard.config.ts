import { PieceId } from "@classes/PieceFactory";
import { Bag } from "@classes/PieceQueue";
import { GameConfig } from "./types";

export const getConfig = (): GameConfig => {
    return [
        20,
        10,
        new Bag([
            PieceId.TETROMINO_I,
            PieceId.TETROMINO_J,
            PieceId.TETROMINO_L,
            PieceId.TETROMINO_O,
            PieceId.TETROMINO_S,
            PieceId.TETROMINO_T,
            PieceId.TETROMINO_Z,
        ]),
        [4, 19],
    ];
};
