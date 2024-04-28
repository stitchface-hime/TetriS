import { DrawableEntity } from "@classes/DrawableEntity";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { Piece } from "@classes/Piece";
import { TextureManager } from "@classes/TextureManager";
import { DrawBuffers } from "src/shaders/types";

export class HoldQueue extends GroupEntity {
    private canHold = true;
    private piece: Piece | null = null;

    setPiece(piece: Piece) {
        if (this.piece) {
            this.removeDrawables(this.piece.getBlocks());
        }

        this.addDrawables(piece.getBlocks());
        this.piece = piece;
    }
}
