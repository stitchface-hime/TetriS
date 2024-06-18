import { Game, Standard } from "@classes/Game";
import { RunStatus } from "./types";
import { MainRenderer } from "@classes/ShaderProgram/MainRenderer/renderer";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { Interval } from "@classes/TimeMeasure";
import { TextureManager } from "@classes/TextureManager";
import { DrawBuffers } from "src/shaders/types";
import { ControllerPortManager } from "@classes/ControllerPortManager";
import { Controller } from "@classes/Controller";
import { ControllerPortKey } from "@classes/ControllerPortManager/types";
import { ControllerContext } from "@classes/ControllerContext";
import { IntervalContext } from "@classes/IntervalContext";
import { SceneManager } from "@classes/SceneManager/SceneManager";
import { Scene_Game } from "@classes/Scene/scenes/Scene_Game";
import { SceneRenderer } from "@classes/ShaderProgram/SceneRenderer";
import { ShaderTextureAsset } from "@classes/Asset/ShaderTextureAsset";
import { DrawMatrix } from "@classes/ShaderProgram";
import { SceneKey } from "@classes/SceneManager/Scene.keys";

export class Main {
    // Common to all entities within the main progra
    private gl: WebGLRenderingContext | null = null;

    private textureManager = new TextureManager();
    private intervalManager = new IntervalManager();
    private controllerPortManager = new ControllerPortManager();

    private sceneRenderer: SceneRenderer | null = null;
    private sceneManager = new SceneManager();

    private game: Game | null = null;

    private runStatus: RunStatus = RunStatus.STOPPED;

    constructor(canvas?: HTMLCanvasElement) {
        if (!canvas) return;

        this.setWebGLRenderingContext(canvas);
    }

    /**
     * Sets the rendering context for the main program. This also assigns a renderer to main.
     */
    setWebGLRenderingContext(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl");

        if (!gl) return;

        this.gl = gl;
        this.sceneRenderer = new SceneRenderer(gl, this.textureManager);
    }

    private halt() {
        if (this.game) {
            this.game.halt();
            this.runStatus = RunStatus.PAUSED;
        }
    }

    setUp() {
        if (this.gl && this.sceneRenderer) {
            console.log("Begin set up");
            const controllerContext = new ControllerContext(
                this.controllerPortManager
            );

            const game = new Game(...Standard.getConfig(), {
                controllerContext,
                intervalContext: new IntervalContext(this.intervalManager),
            });

            game.contexts.controllerContext?.assignControllable(game);

            this.controllerPortManager
                .getPort(ControllerPortKey.PORT_0)
                .plugIn(new Controller(this.intervalManager));

            const drawMatrix = new DrawMatrix(this.gl);
            drawMatrix.setMatrix(game.getPlayfield());

            const scene = new Scene_Game(this.sceneRenderer, game, [
                new ShaderTextureAsset(
                    "TEX_playfield",
                    drawMatrix,
                    this.textureManager
                ),
            ]);

            this.sceneManager.addScene(scene);
        } else {
            throw new Error(
                "Failed to set up, WebGL context might be missing."
            );
        }
    }

    run() {
        if (!this.sceneManager.isCurrentSceneLoaded()) {
            if (!this.sceneManager.isCurrentSceneLoading())
                this.sceneManager.loadCurrentScene();
        } else {
            this.sceneManager.renderCurrentScene();
        }
    }

    start() {
        console.log("Start");
        this.setUp();
        this.sceneManager.loadAndSetCurrentScene(Scene_Game.key, (scene) => {
            console.log(this.textureManager);
            console.log("Scene loaded", scene);
        });

        this.intervalManager.subscribe(
            new Interval(
                0,
                () => {
                    this.run();
                },
                Infinity // debug
            )
        );
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
        this.controllerPortManager.plugOutAllControllers();
        this.runStatus = RunStatus.STOPPED;
    }

    getRunStatus() {
        return this.runStatus;
    }

    getControllerEventTriggers(key: ControllerPortKey) {
        return this.controllerPortManager
            .getPort(key)
            .controller?.getEventTriggers();
    }

    // debug
    getGame() {
        return this.game;
    }
}
