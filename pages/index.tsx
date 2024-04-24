import { ControllerPortKey } from "@classes/ControllerPortManager/types";
import { Main } from "@classes/Main";

import React, { useCallback, useRef, useState } from "react";
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
        const controller = mainRef.current?.getGame()?.getControllerContext();
        if (controller) {
            return controller.getState();
        }

        return {};
    };

    // Debug

    const start = async () => {
        if (canvasRef.current) {
            mainRef.current = new Main();
            mainRef.current.setWebGLRenderingContext(canvasRef.current);
            await mainRef.current.start();

            const triggers = mainRef.current?.getControllerEventTriggers(ControllerPortKey.PORT_0);

            if (triggers) {
                mainRef.current?.getControllerEventTriggers(ControllerPortKey.PORT_0);
                window.addEventListener("keydown", (e) => {
                    const { key } = e;
                    triggers.press(key);
                });
                window.addEventListener("keyup", (e) => {
                    const { key } = e;
                    triggers.release(key);
                });
            }
            tick();
        }
    };

    return (
        <div style={{ fontFamily: "monospace" }}>
            <GameCanvas ref={canvasRef} />
            <button onClick={start}>Start</button>
            {JSON.stringify(getButtons())}
            <br />
            Score: {mainRef.current?.getGame()?.getGameParams().score}
            <br />
            Level: {mainRef.current?.getGame()?.getGameParams().level}
            <br />
            Lines: {mainRef.current?.getGame()?.getGameParams().linesCleared}
            <br />
            Combo: {Math.max(mainRef.current?.getGame()?.getGameParams().combo || 0, 0)}
        </div>
    );
};

export default App;
