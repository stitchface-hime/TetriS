import { Asset } from "@classes/Asset";
import { SceneKey } from "@classes/SceneManager/Scene.keys";
import { SceneRenderer } from "@classes/ShaderProgram/SceneRenderer";
import { TextureManager } from "@classes/TextureManager";

// TODO: Callbacks for when assets are processed.
export abstract class Scene {
    private _key: SceneKey;
    private _assets: Asset[];
    private numLoaded = 0;
    private numParsed = 0;
    protected renderer: SceneRenderer;

    constructor(key: SceneKey, assets: Asset[], renderer: SceneRenderer) {
        this._key = key;
        this._assets = assets;
        this.renderer = renderer;
    }

    get key() {
        return this._key;
    }

    get assets() {
        return this._assets;
    }

    get isLoaded() {
        return this.assets.length === this.numLoaded;
    }

    incrementLoad(onLoad?: (scene: Scene) => void) {
        this.numLoaded += 1;
        this.numParsed += 1;

        if (this.isLoaded && onLoad) onLoad(this);
    }

    /**
     * Loads the scene including all assets.
     */
    load(onLoad?: (scene: Scene) => void, reload = false) {
        if (this.isLoaded && !reload) return;

        this.numLoaded = 0;

        this._assets.forEach((asset) => {
            try {
                if (asset.isLoaded) {
                    this.incrementLoad(onLoad);
                } else {
                    asset.load(() => this.incrementLoad(onLoad));
                }
            } catch (e) {
                this.numParsed += 1;
            }
        });
    }

    /**
     * Unloads the scene including all used assets.
     */
    unload() {}

    abstract renderScene(): void;
}
