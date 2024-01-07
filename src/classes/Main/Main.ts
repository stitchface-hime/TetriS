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
            console.log(this.gl);
            this.game?.run(this.gl);
            this.runStatus = RunStatus.RUNNING;
        }
    }

    private halt() {
        if (this.game) {
            this.game.halt();
            this.runStatus = RunStatus.PAUSED;
        }
    }

    start() {
        if (!this.game && this.gl) {
            console.log(this.gl);
            this.game = new Game(...Standard.getConfig(), new GroupRenderer(this.gl), this.spriteLoader);
            this.gameController = new GameController(this.game);
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
        }
    }

    // debug
    getGame() {
        return this.game;
    }
}
