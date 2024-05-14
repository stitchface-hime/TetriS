import { ForwardedRef, forwardRef } from "react";
import classes from "./GameCanvas.module.css";

export const GameCanvas = forwardRef(function GameCanvas(_props, ref: ForwardedRef<HTMLCanvasElement>) {
    return (
        <div className={classes.canvasContainer}>
            <canvas className={classes.scene} ref={ref} /> <div className={classes.text}>Canvas</div>
        </div>
    );
});
