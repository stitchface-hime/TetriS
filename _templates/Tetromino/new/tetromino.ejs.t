---
to: src/<%= name %>/<%= name %>.ts
---
import { Matrix } from "@classes/Matrix";
import { Block } from "../../Block";
import { Tetromino } from "../Tetromino";
import {
  ?_antiClockwiseWallKickPositionOffsetData,
  ?_clockwiseWallKickPositionOffsetData,
} from "../Tetromino.wallkick";
import * as Rotation from "./<%= name %>.rotation";

/**
 * The ? tetromino. Below is its initial state:
 * ```
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * [_][_][_][_]
 * ```
 * Construct a new ? tetromino by supplying the coordinates for the block in the cell `[0]`.
 */

export class <%= name %> extends Tetromino {
  protected static override color = "";

  constructor(originCoordinates: [x: number, y: number], matrix: Matrix) {
    const [originX, originY] = originCoordinates;

    const blocks: [Block, Block, Block, Block] = [
      new Block([originX, originY], matrix, <%= name %>.color), // 0
      new Block([originX, originY], matrix, <%= name %>.color), // 1
      new Block([originX, originY], matrix, <%= name %>.color), // 2
      new Block([originX, originY], matrix, <%= name %>.color), // 3
    ];

    super(
      blocks,
      Rotation.clockwiseRotationMap,
      Rotation.antiClockwiseRotationMap,
      ?_clockwiseWallKickPositionOffsetData,
      ?_antiClockwiseWallKickPositionOffsetData
    );

    this.registerBlocks();
    this.coupleBlocks();
  }

  protected override coupleBlocks() {
    for (let i = 0; i < this.blocks.length; i++) {
      switch (i) {
        case 0:
          this.blocks[i].setCoupledBlocks([]);
          break;
        case 1:
          this.blocks[i].setCoupledBlocks([]);
          break;
        case 2:
          this.blocks[i].setCoupledBlocks([]);
          break;
        case 3:
          this.blocks[i].setCoupledBlocks([]);
          break;
      }
    }
  }
}

