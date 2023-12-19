import { Game } from "@classes/Game";
import { Standard } from "@classes/Game";
import { Main } from "@classes/Main";
import { Block } from "@classes/Piece";

import { Bag } from "@classes/PieceQueue";
import { Stopwatch } from "@classes/TimeMeasure";
import { isEqual2DVectorTuples } from "@utils/isEqual2DVectorTuples";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameCanvas } from "src/components/GameCanvas";

const App: React.FC = () => {
    const mainRef = useRef<Main>(new Main());
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const start = () => {
        if (canvasRef.current) {
            mainRef.current.setWebGLRenderingContext(canvasRef.current);
            mainRef.current.start();
        }
    };

    return (
        <div>
            <GameCanvas ref={canvasRef} />
            <button onClick={start}>Start</button>
        </div>
    );
};

export default App;
