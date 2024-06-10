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
        if (!this.piece) return;

        const blocks = this.piece?.blocks;

        if (!blocks) return;

        const pieceBounds = this.piece.getDrawablesMinRectDim();

        const matrixMidX = this.dimensions[0] / 2;
        const matrixMidY = this.dimensions[1] / 2;

        const relPos = this.piece.getDrawablesMinRectRelPos();

        const translation: [x: number, y: number] = [
            matrixMidX - pieceBounds[0] / 2 - relPos[0],
            matrixMidY - pieceBounds[1] / 2,
        ];

        this.piece.translate(translation);
    }

    set piece(piece: Piece | null) {
        if (this.piece) this.drawables.remove(this.piece);

        this._piece = piece;
        if (piece === null) return;

        piece.parent = this;

        piece.goToRelativePosition([0, 0]);
        this.drawables.push(piece);
        this.positionPiece();
    }
}
