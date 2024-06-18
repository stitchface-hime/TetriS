import { SceneKey } from "@classes/SceneManager/Scene.keys";
import { Scene } from "../Scene";
import { Asset } from "@classes/Asset";
import { ImageAsset } from "@classes/Asset/ImageAsset";
import { SpriteSheets } from "@data/SpriteSheets";
import { ShaderTextureAsset } from "@classes/Asset/ShaderTextureAsset/ShaderTextureAsset";
import { DrawBoundingBox } from "@classes/ShaderProgram/DrawBoundingBox";
import { Game } from "@classes/Game";
import { SceneRenderer } from "@classes/ShaderProgram/SceneRenderer";
import { SpriteSheetLoader } from "@classes/ShaderProgram/SpriteSheetLoader";

export class Scene_Game extends Scene {
    static key = SceneKey.SCENE_GAME;
    private game: Game;

    constructor(
        renderer: SceneRenderer,
        game: Game,
        additionalAssets: Asset[]
    ) {
        const { textureManager, gl } = renderer;
        super(
            Scene_Game.key,
            [
                new ImageAsset(
                    "SPR_mino",
                    new SpriteSheetLoader(gl, SpriteSheets.SPR_MINO_STD.src),
                    textureManager
                ),
                new ShaderTextureAsset(
                    "TEX_boundingBox",
                    new DrawBoundingBox(gl),
                    textureManager
                ),
                ...additionalAssets,
            ],
            renderer
        );
        this.game = game;
    }

    renderScene(): void {
        if (!this.game.isRunning) {
            this.game.run();
        }
        const drawBuffers = this.game.getDrawBuffers([0, 0, 0, 0]);
        this.renderer.draw(drawBuffers);
    }
}
