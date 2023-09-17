import { Game } from "@classes/Game";
import { useEffect, useRef, useState } from "react";
import classes from "./GameCanvas.module.css";
import { DrawMatrix } from "@classes/ShaderProgram";
import { DrawSprite } from "@classes/ShaderProgram/DrawSprite/renderer";
import { DebugFramebuffers } from "@classes/ShaderProgram/DebugFramebuffers/renderer";
export const GameCanvas = ({ game }: { game: Game }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [renderer2, setRenderer2] = useState<DebugFramebuffers | null>(null);
    const [renderer, setRenderer] = useState<DrawMatrix | null>(null);
    const [drawer, setDrawer] = useState<DrawSprite | null>(null);

    useEffect(() => {
        console.log(canvasRef.current);
        if (canvasRef.current) {
            game.setCanvas(canvasRef.current);
        }
    }, [canvasRef, game]);

    const set = () => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext("webgl", {
                premultipliedAlpha: false,
                antialias: false,
            });

            if (context) {
                // setRenderer(new DrawMatrix("matrix-draw", context, 20, 10));
                setRenderer2(
                    new DebugFramebuffers("matrix-draw", context, 20, 10)
                );
            }
        }
    };

    const draw = () => {
        renderer2?.draw();
    };

    const loadSheet = () => {
        drawer?.load({
            id: "mino",
            src: "/sample_texture_2.png",
            spriteSize: { width: 64, height: 64 },
        });
    };

    const drawSprite = () => {
        drawer?.draw([
            { sheetId: "mino", drawData: [{ offset: [0, 0], coords: [0, 0] }] },
        ]);
    };

    return (
        <>
            <canvas className={classes.scene} ref={canvasRef} />{" "}
            <button onClick={set}>Set rederer</button>{" "}
            <button onClick={draw}>Draw</button>
            <button onClick={loadSheet}>Load sheet</button>
            <button onClick={drawSprite}>Draw sprite</button>
        </>
    );
};
