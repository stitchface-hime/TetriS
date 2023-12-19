import { Game } from "@classes/Game";
import { ForwardedRef, MutableRefObject, forwardRef, useEffect, useRef, useState } from "react";
import classes from "./GameCanvas.module.css";
import { DrawMatrix } from "@classes/ShaderProgram";
import { DrawSprite } from "@classes/ShaderProgram/DrawSprite/renderer";
import { DebugFramebuffers } from "@classes/ShaderProgram/DebugFramebuffers/renderer";
import { Block } from "@classes/Piece";

export const GameCanvas = forwardRef(function GameCanvas(_props, ref: ForwardedRef<HTMLCanvasElement>) {
    return (
        <div className={classes.canvasContainer}>
            <canvas className={classes.scene} ref={ref} /> <div className={classes.text}>Canvas</div>
        </div>
    );
});
