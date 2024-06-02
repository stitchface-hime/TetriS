import { Matrix } from "@classes/Matrix";
import { Piece } from "@classes/Piece";

export class PiecePreview extends Matrix {
    private _piece: Piece | null = null;

    constructor() {
        super(3, 5);
    }

    get piece() {
        return this._piece;
    }

    private positionPiece() {
        const coordinates = this.piece?.getBlocksCoordinates();
    }

    set piece(piece: Piece | null) {
        if (this.piece) this.drawables.remove(this.piece);

        this._piece = piece;
        if (piece === null) return;

        this.drawables.push(piece);
        this.goToPosition([64, 64]);
    }
}
