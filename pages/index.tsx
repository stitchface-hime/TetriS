import { Main } from "@classes/Main";

import { SpriteSheets } from "@data/SpriteSheets";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameCanvas } from "src/components/GameCanvas";

const App: React.FC = () => {
    const mainRef = useRef<Main | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Debug
    const [ticker, setTicker] = useState(false);
    const requestAnimationFrameRef = useRef(0);
    // Re-render once every frame.
    const tick = useCallback(() => {
        setTicker((prev) => {
            return !prev;
        });
        requestAnimationFrameRef.current = requestAnimationFrame(tick);
    }, []);

    const getButtons = () => {
        const controller = mainRef.current?.getGameController();
        if (controller) {
            return controller.getPressedButtons();
        }

        return {};
    };

    // Debug

    const start = async () => {
        if (canvasRef.current) {
            mainRef.current = new Main();
            mainRef.current.setWebGLRenderingContext(canvasRef.current);
            await mainRef.current.start();
            window.addEventListener("keydown", (e) => {
                const { key } = e;
                mainRef.current?.input(key);
            });
            window.addEventListener("keyup", (e) => {
                const { key } = e;
                mainRef.current?.release(key);
            });
            tick();
        }
    };

    return (
        <div style={{ fontFamily: "monospace" }}>
            <GameCanvas ref={canvasRef} />
            <button onClick={start}>Start</button>
            {JSON.stringify(getButtons())}
        </div>
    );
};

export default App;
