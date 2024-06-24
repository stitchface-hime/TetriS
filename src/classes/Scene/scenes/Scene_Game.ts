import { SceneKey } from "@classes/SceneManager/Scene.keys";
import { Scene } from "../Scene";
import { Asset } from "@classes/Asset";
import { ImageAsset } from "@classes/Asset/ImageAsset";
import { SpriteSheets } from "@data/SpriteSheets";
import { ShaderTextureAsset } from "@classes/Asset/ShaderTextureAsset/ShaderTextureAsset";
import { Game } from "@classes/Game";
import { SceneRenderer } from "@classes/ShaderProgram/SceneRenderer";
import { ShaderTextures } from "@data/ShaderTextures";
import { Renderer_BoundingBox } from "@classes/Renderer";

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
                    SpriteSheets.SPR_mino.src,
                    textureManager,
                    gl
                ),
                new ShaderTextureAsset(
                    "TEX_color",
                    new Renderer_BoundingBox(gl),
                    [...ShaderTextures.TEX_color.dimensions],
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
