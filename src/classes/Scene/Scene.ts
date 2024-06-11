import { Asset } from "@classes/Asset";
import { SceneKey } from "@classes/SceneManager/Scene.keys";

export abstract class Scene {
    private _key: SceneKey;
    private assets: Asset[];
    private _isLoaded = false;

    constructor(key: SceneKey, assets: Asset[]) {
        this._key = key;
        this.assets = assets;
    }

    get key() {
        return this._key;
    }

    get isLoaded() {
        return this._isLoaded;
    }

    /**
     * Loads the scene including all assets.
     */
    async load(onLoad?: (scene: Scene) => void) {
        if (this.isLoaded) return;

        this.assets.forEach(() => {
            // load all assets
        });
    }

    /**
     * Unloads the scene including all used assets.
     */
    unload() {}

    renderScene() {}
}
