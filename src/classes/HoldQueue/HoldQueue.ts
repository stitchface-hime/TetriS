import { DrawableEntity } from "@classes/DrawableEntity";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { Piece } from "@classes/Piece";
import { TextureManager } from "@classes/TextureManager";
import { PieceId } from "@data/PieceId";
import { DrawBuffers } from "src/shaders/types";

export class HoldQueue extends GroupEntity {
    private holdPieceId: PieceId | null = null;
    private canHold = true;

    hold(pieceId: PieceId) {
        if (!this.canHold) return false;

        this.holdPieceId = pieceId;
        this.canHold = false;
        return true;
    }

    /**
     * TODO: this should be handled somewhere else...
     */
    resetCanHold() {
        this.canHold = true;
    }

    getHoldPieceId() {
        return this.holdPieceId;
    }

    getCanHold() {
        return this.canHold;
    }
}
