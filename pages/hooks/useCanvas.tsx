import { useRef } from "react";

const useCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasInstance = canvasRef.current;
    const ctx = canvasInstance?.getContext("webgl");

    // logic to scale canvas

    return [canvasRef, ctx];
};
