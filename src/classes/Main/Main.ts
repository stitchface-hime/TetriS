import { Game, Standard } from "@classes/Game";
import { GameController } from "@classes/GameController";
import { RunStatus } from "./types";
import { GroupRenderer } from "@classes/ShaderProgram/GroupRenderer";
import { MainRenderer } from "@classes/ShaderProgram/MainRenderer/renderer";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { Interval } from "@classes/TimeMeasure";
import { TextureManager } from "@classes/TextureManager";
import { DrawBuffers } from "src/shaders/types";
import { ControllerPortManager } from "@classes/ControllerPortManager";

export class Main {
    // Common to all entities within the main progra
    private gl: WebGLRenderingContext | null = null;

    private textureManager = new TextureManager();
    private intervalManager = new IntervalManager();
    private controllerPorts = new ControllerPortManager();

    private clock = this.intervalManager.subscribe(
        new Interval(
            0,
            () => {
                this.draw();
            },
            Infinity // debug
        )
    );

    private game: Game | null = null;

    private gameController: GameController | null = null;
    private runStatus: RunStatus = RunStatus.STOPPED;
    private renderer: MainRenderer | null = null;

    constructor(canvas?: HTMLCanvasElement) {
        if (canvas) {
            this.setWebGLRenderingContext(canvas);
            if (this.gl) {
                this.renderer = new MainRenderer(this.gl, this.textureManager);
            }
        }
    }

    /**
     * Sets the rendering context for the main program. This also assigns a renderer to main.
     */
    setWebGLRenderingContext(canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext("webgl");
        if (this.gl) {
            this.renderer = new MainRenderer(this.gl, this.textureManager);
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
            const drawBuffers: DrawBuffers = await this.game.getDrawBuffers(this.gl, this.textureManager);
            await this.renderer?.draw(mainTexture, drawBuffers);
        }
    }

    async start() {
        if (!this.game && this.gl) {
            this.game = new Game(...Standard.getConfig(), new GroupRenderer(this.gl), this.intervalManager);
            this.gameController = new GameController(this.game, this.intervalManager);
            this.gameController.listen();
            this.run();
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
        } else {
            console.warn("Input", input, "ignored - game controller not initialized, have you started the game yet?");
        }
    }

    release(input: string | GamepadButton) {
        if (this.gameController) {
            this.gameController.release(input);
        } else {
            console.warn("Release", input, "ignored - game controller not initialized, have you started the game yet?");
        }
    }

    // debug
    getGame() {
        return this.game;
    }

    // debug
    getGameController() {
        return this.gameController;
    }
}
