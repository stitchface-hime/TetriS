import { ControllerPortManager } from "@classes/ControllerPortManager";
import { Game } from "@classes/Game";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { MatrixBackground } from "@classes/MatrixBackground/MatrixBackground";
import { Block, Piece } from "@classes/Piece";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { SpriteSheets } from "@data/SpriteSheets";
import { isEqual2DVectorTuples, warnIfNotInteger } from "@utils/index";
import { NATIVE_RESOLUTION_H, NATIVE_RESOLUTION_W } from "src/constants";

export class GhostPiece {
    private blocks: Block[] = [];

    constructor(blocks: Block[]) {
        this.blocks = blocks;
    }

    updateCoordinates(coordinatesList: [x: number, y: number][]) {
        for (let i = 0; i < Math.min(this.blocks.length, coordinatesList.length); i++) {
            this.blocks[i].setCoordinates(coordinatesList[i]);
        }
    }
}
