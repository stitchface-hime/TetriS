import { Game, Standard } from "@classes/Game";
import { RunStatus } from "./types";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { Interval } from "@classes/TimeMeasure";
import { TextureManager } from "@classes/TextureManager";
import { ControllerPortManager } from "@classes/ControllerPortManager";
import { Controller } from "@classes/Controller";
import { ControllerPortKey } from "@classes/ControllerPortManager/types";
import { ControllerContext } from "@classes/ControllerContext";
import { IntervalContext } from "@classes/IntervalContext";
import { SceneManager } from "@classes/SceneManager/SceneManager";
import { Scene_Game } from "@classes/Scene/scenes/Scene_Game";
import { ShaderTextureAsset } from "@classes/Asset/ShaderTextureAsset";
import { Renderer_Scene } from "@classes/Renderer/Renderer_Scene";
import { Renderer_Playfield } from "@classes/Renderer/Renderer_Playfield/Renderer_Playfield";
import { Screen } from "@classes/Screen";

export class Main {
    // Common to all entities within the main progra
    private gl: WebGLRenderingContext | null = null;

    private textureManager = new TextureManager();
    private intervalManager = new IntervalManager();
    private controllerPortManager = new ControllerPortManager();

    private renderer: Renderer_Scene | null = null;
    private screen: Screen | null = null;
    private sceneManager = new SceneManager();

    private game: Game | null = null;

    private runStatus: RunStatus = RunStatus.STOPPED;

    private debug_framesRendered = 0;

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

        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE_MINUS_SRC_ALPHA
        );
        this.gl = gl;
        this.renderer = new Renderer_Scene(gl, this.textureManager);
        this.screen = new Screen(gl);
    }

    private halt() {
        if (this.game) {
            this.game.halt();
            this.runStatus = RunStatus.PAUSED;
        }
    }

    setUp() {
        if (this.gl && this.renderer) {
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

            const scene = new Scene_Game(this.renderer, game, [
                new ShaderTextureAsset(
                    "TEX_playfield",
                    new Renderer_Playfield(
                        this.gl,
                        game.numRows,
                        game.numColumns
                    ),
                    [
                        game.getPlayfield().dimensions[0] * 2,
                        game.getPlayfield().dimensions[1],
                    ],
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
            // if (this.debug_framesRendered > 1) return;
            // console.log("Render frame", this.screen?.texture);
            this.sceneManager.renderCurrentScene(this.screen?.texture);
            this.screen?.draw();
            // this.debug_framesRendered++;
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
