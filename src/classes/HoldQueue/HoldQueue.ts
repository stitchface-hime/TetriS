import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { PieceId } from "@data/PieceId";

export class HoldQueue extends GroupEntity {
    private _holdPieceId: PieceId | null = null;
    private _canHold = true;

    get holdPieceId() {
        return this._holdPieceId;
    }

    get canHold() {
        return this._canHold;
    }

    set canHold(canHold: boolean) {
        this._canHold = canHold;
    }

    hold(pieceId: PieceId) {
        if (!this.canHold) return false;

        this._holdPieceId = pieceId;
        this.canHold = false;
        return true;
    }
}
