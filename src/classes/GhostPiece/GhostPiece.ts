import { Block, Piece } from "@classes/Piece";

export class GhostPiece {
    private piece: Piece | null = null;

    constructor(piece: Piece | null) {
        this.piece = piece;
        this.piece?.getBlocks().forEach((block) => block.setSaturationModifier(0.3));
    }

    getBlocks() {
        return this.piece ? this.piece.getBlocks() : null;
    }

    updateCoordinates(coordinatesList: [x: number, y: number][]) {
        const blocks = this.getBlocks();

        if (blocks) {
            for (let i = 0; i < Math.min(blocks.length, coordinatesList.length); i++) {
                blocks[i].setCoordinates(coordinatesList[i]);
            }

            blocks.forEach((block) => block.updateConnections());
        }
    }
}
