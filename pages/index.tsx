import { Game } from "@classes/Game";
import { Standard } from "@classes/Game";
import { PieceId } from "@classes/PieceFactory";
import { Bag } from "@classes/PieceQueue";
import { useCallback, useEffect, useRef, useState } from "react";

const App: React.FC = () => {
    const [ticker, setTicker] = useState(false);
    const requestAnimationFrameRef = useRef(0);

    const gameInstance = useRef<Game | null>(null);

    // Re-render once every frame.
    const tick = useCallback(() => {
        setTicker((prev) => !prev);
        gameInstance.current?.tick();
        console.log(gameInstance.current?.getMatrix().printMatrix());
        requestAnimationFrameRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        gameInstance.current = new Game(...Standard.getConfig());
        requestAnimationFrameRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(requestAnimationFrameRef.current);
    }, [tick]);

    return <div>{`${ticker}`}</div>;
};

export default App;
