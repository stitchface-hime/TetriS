import { Game } from "@classes/Game";
import React, { useRef } from "react";
import classes from "./GameCanvas.module.css";
import { DrawMatrix } from "@classes/ShaderProgram";
export const GameCanvas = ({ game }: { game: Game }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [renderer, setRenderer] = React.useState<DrawMatrix | null>(null);

    const set = () => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext("webgl", {
                premultipliedAlpha: false,
            });

            if (context) {
                setRenderer(new DrawMatrix("matrix-draw", context, 21, 10));
            }
        }
    };

    const draw = () => {
        renderer?.draw();
    };

    return (
        <>
            <canvas className={classes.scene} ref={canvasRef} />{" "}
            <button onClick={set}>Set rederer</button>{" "}
            <button onClick={draw}>Draw</button>
        </>
    );
};
