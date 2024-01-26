import { Game, Standard } from "@classes/Game";
import { GameController } from "@classes/GameController";
import { RunStatus } from "./types";
import { GroupRenderer } from "@classes/ShaderProgram/GroupRenderer";
import { SpriteLoader } from "@classes/SpriteLoader";
import { MainRenderer } from "@classes/ShaderProgram/MainRenderer/renderer";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { MainIntervalKeys } from "./MainIntervalKeys";
import { Interval } from "@classes/TimeMeasure";
import { FRAME_MS } from "src/constants";

export class Main {
    private game: Game | null = null;
    private gl: WebGLRenderingContext | null = null;
    private spriteLoader = new SpriteLoader();
    private gameController: GameController | null = null;
    private runStatus: RunStatus = RunStatus.STOPPED;
    private renderer: MainRenderer | null = null;
    private intervalManager = new IntervalManager();

    constructor(canvas?: HTMLCanvasElement) {
        if (canvas) {
            this.setWebGLRenderingContext(canvas);
            if (this.gl) {
                this.renderer = new MainRenderer(this.gl);
            }
        }
    }

    /**
     * Sets the rendering context for the main program. This also assigns a renderer to main.
     */
    setWebGLRenderingContext(canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext("webgl");
        if (this.gl) {
            this.renderer = new MainRenderer(this.gl);
        }
    }

    private run() {
        if (this.gl) {
            this.game?.run(this.gl);
            this.runStatus = RunStatus.RUNNING;

            // draw from game into canvas
        }
    }

    private halt() {
        if (this.game) {
            this.game.halt();
            this.runStatus = RunStatus.PAUSED;
        }
    }

    async draw() {
        if (this.gl && this.game) {
            const canvas = this.gl.canvas as HTMLCanvasElement;
            const mainTexture = this.gl.createTexture();

            this.gl.bindTexture(this.gl.TEXTURE_2D, mainTexture);

            const level = 0;
            const internalFormat = this.gl.RGBA;
            const border = 0;
            const format = this.gl.RGBA;
            const type = this.gl.UNSIGNED_BYTE;
            const data = null;

            this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat, canvas.clientWidth, canvas.clientHeight, border, format, type, data);

            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

            // draw to main texture
            await this.game.draw(mainTexture);

            await this.renderer?.draw(mainTexture);
        }
    }

    async start() {
        if (!this.game && this.gl) {
            this.game = new Game(...Standard.getConfig(), new GroupRenderer(this.gl), this.spriteLoader);
            this.gameController = new GameController(this.game);
            this.gameController.listen();
            this.run();

            this.intervalManager.subscribe(
                MainIntervalKeys.RUN,
                new Interval(
                    FRAME_MS,
                    () => {
                        this.draw();
                    },
                    Infinity
                )
            );
        }
    }

    pause() {
        this.halt();
    }

    resume() {
        this.run();
    }

    stop() {
        this.halt();
        this.game = null;
        this.runStatus = RunStatus.STOPPED;
    }

    getRunStatus() {
        return this.runStatus;
    }

    input(input: string | GamepadButton) {
        if (this.gameController) {
            this.gameController.input(input);
        }
    }

    // debug
    getGame() {
        return this.game;
    }
}
