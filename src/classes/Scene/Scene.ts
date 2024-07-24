import { Asset } from "@classes/Asset";
import { Renderer_Scene } from "@classes/Renderer";
import { SceneKey } from "@classes/SceneManager/Scene.keys";

// TODO: Test when asset fails to load.
export abstract class Scene {
    private _key: SceneKey;
    private _assets: Asset[];
    private numLoaded = 0;
    private numParsed = 0;
    private _isLoading = false;
    private _isLoaded = false;
    protected renderer: Renderer_Scene;

    constructor(key: SceneKey, assets: Asset[], renderer: Renderer_Scene) {
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
        return this._isLoaded;
    }

    get isLoading() {
        return this._isLoading;
    }

    checkLoadComplete() {
        if (
            this.assets.length === this.numParsed &&
            this.assets.length > this.numLoaded
        ) {
            throw new Error("Failed to load all assets.");
        }

        if (this.assets.length === this.numLoaded) {
            this._isLoading = false;
            this._isLoaded = true;
        } else {
            this._isLoading = true;
            this._isLoaded = false;
        }
    }

    incrementLoad(onLoad?: (scene: Scene) => void) {
        this.numLoaded += 1;
        this.numParsed += 1;

        this.checkLoadComplete();

        if (this._isLoaded && onLoad) onLoad(this);
    }

    /**
     * Loads the scene including all assets.
     */
    load(onLoad?: (scene: Scene) => void, reload = false) {
        if (this._isLoaded && !reload) return;

        this.numLoaded = 0;
        this.checkLoadComplete();

        this._assets.forEach((asset) => {
            try {
                if (asset.isLoaded) {
                    this.incrementLoad(onLoad);
                } else {
                    asset.load((asset) => {
                        console.log(
                            `[${this.numLoaded + 1}/${
                                this.assets.length
                            }] Loaded: `,
                            asset.constructor.name
                        );
                        this.incrementLoad(onLoad);
                    });
                }
            } catch (e) {
                this.numParsed += 1;
                throw e;
            }
        });
    }

    /**
     * Unloads the scene including all used assets.
     */
    unload() {}

    abstract renderScene(destTexture: WebGLTexture | null): void;
}
