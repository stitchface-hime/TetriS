import { PieceFactory } from "@classes/PieceFactory";
import { PiecePreview } from "@classes/PiecePreview";
import { PieceQueue } from "./PieceQueue";
import { GroupEntity } from "@classes/GroupEntity";

export class Renderer_PieceQueue extends GroupEntity {
    /**
     * How many pieces you are allowed to see that are coming up in the queue.
     */
    private pieceQueue: PieceQueue;
    private previewCount: number;
    private previews: PiecePreview[] = [];
    private pieceFactory = new PieceFactory();

    constructor(pieceQueue: PieceQueue, previewCount = 4) {
        super();

        this.pieceQueue = pieceQueue;
        this.previewCount = previewCount;

        // initialize rendering entities
        const initialNext = this.pieceQueue.getNext(this.previewCount);

        this.previews = initialNext.map((pieceId, idx) => {
            const preview = new PiecePreview();
            preview.piece = this.pieceFactory.makePiece(
                [0, 0],
                preview,
                pieceId
            );
            preview.parent = this;
            this.drawables.push(preview);

            preview.goToRelativePosition([
                0,
                preview.dimensions[1] * (this.previewCount - idx - 1),
            ]);

            return preview;
        });

        this.defaultDimensions = this.getDrawablesMinRectDim();
    }

    /**
     * Update the renderer to render the latest next pieces.
     */
    update() {
        const next = this.pieceQueue.getNext(this.previewCount);

        this.previews.forEach((preview, idx) => {
            preview.piece =
                idx === this.previewCount - 1
                    ? this.pieceFactory.makePiece(
                          [0, 0],
                          preview,
                          next[this.previewCount - 1]
                      )
                    : this.previews[idx + 1].piece;
        });
    }
}
