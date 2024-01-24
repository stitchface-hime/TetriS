import { Game, Standard } from "@classes/Game";
import { GameController } from "@classes/GameController";
import { RunStatus } from "./types";
import { GroupRenderer } from "@classes/ShaderProgram/GroupRenderer";
import { SpriteLoader } from "@classes/SpriteLoader";

export class Main {
    private game: Game | null = null;
    private gl: WebGLRenderingContext | null = null;
    private spriteLoader = new SpriteLoader();
    private gameController: GameController | null = null;
    private runStatus: RunStatus = RunStatus.STOPPED;

    constructor(canvas?: HTMLCanvasElement) {
        if (canvas) {
            this.setWebGLRenderingContext(canvas);
        }
    }

    setWebGLRenderingContext(canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext("webgl");
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

    async start() {
        if (!this.game && this.gl) {
            const canvas = this.gl.canvas as HTMLCanvasElement;

            this.game = new Game(...Standard.getConfig(), new GroupRenderer(this.gl), this.spriteLoader);
            this.gameController = new GameController(this.game);
            this.gameController.listen();
            this.run();

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

            // debug
            const fb = this.gl.createFramebuffer();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
            const attachmentPoint = this.gl.COLOR_ATTACHMENT0;

            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, mainTexture, 0);
            const gl = this.gl;
            let x = new Uint8Array(canvas.clientWidth * canvas.clientHeight * 4);
            this.gl.readPixels(0, 0, canvas.clientWidth, canvas.clientHeight, gl.RGBA, gl.UNSIGNED_BYTE, x);

            console.log("Main texture", x);
            // debug

            return data;
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
