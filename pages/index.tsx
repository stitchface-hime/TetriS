import { Game } from "@classes/Game";
import { Standard } from "@classes/Game";
import { Main } from "@classes/Main";
import { Block } from "@classes/Piece";

import { Bag } from "@classes/PieceQueue";
import { Stopwatch } from "@classes/TimeMeasure";
import { SpriteSheets } from "@data/SpriteSheets";
import { isEqual2DVectorTuples } from "@utils/isEqual2DVectorTuples";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameCanvas } from "src/components/GameCanvas";

const App: React.FC = () => {
    const mainRef = useRef<Main | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const start = () => {
        if (canvasRef.current) {
            mainRef.current = new Main();
            mainRef.current.setWebGLRenderingContext(canvasRef.current);
            mainRef.current.start();
        }
    };

    const loadImage = async () => {
        const image = await new Promise<HTMLImageElement>((resolve) => {
            const image = new Image();
            image.src = SpriteSheets.STANDARD_MINO.src;

            image.onload = async () => {
                console.log("done");
                resolve(image);
            };
        });

        return image;
    };

    const x = async () => {
        console.log("HI");
        await loadImage();
        console.log("Bye");
    };

    return (
        <div>
            <GameCanvas ref={canvasRef} />
            <button onClick={start}>Start</button>
            <button onClick={x}>Load an image</button>
        </div>
    );
};

export default App;
