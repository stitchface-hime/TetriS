import { GroupEntity } from "@classes/GroupEntity";
import { PieceFactory } from "@classes/PieceFactory";
import { PiecePreview } from "@classes/PiecePreview";
import { PieceId } from "@data/PieceId";

export class HoldQueue extends GroupEntity {
    private pieceFactory = new PieceFactory();
    private _holdPieceId: PieceId | null = null;
    private _canHold = true;
    private preview = new PiecePreview();

    constructor() {
        super();
        this.drawables.push(this.preview);

        this.defaultDimensions = this.getDrawablesMinRectDim();
    }

    get holdPieceId() {
        return this._holdPieceId;
    }

    get canHold() {
        return this._canHold;
    }

    set canHold(canHold: boolean) {
        this._canHold = canHold;

        if (!this.preview.piece) return;

        this.preview.piece.toggleDisabledBlocks(!canHold);
    }

    hold(pieceId: PieceId) {
        if (!this.canHold) return false;

        this._holdPieceId = pieceId;
        this.preview.piece = this.pieceFactory.makePiece([0, 0], this.preview, pieceId);
        this.canHold = false;
        return true;
    }
}
