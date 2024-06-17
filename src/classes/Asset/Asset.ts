/**
 * Assets are used in the game to assist in constructing entities.
 * May include images, sounds etc.
 */
export abstract class Asset {
    private _id: string;
    public name: string = "";
    private _isLoaded = false;

    constructor(id: string) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    get isLoaded() {
        return this._isLoaded;
    }

    protected set isLoaded(isLoaded: boolean) {
        this._isLoaded = isLoaded;
    }

    /**
     * Loads an asset into the game, and optionally accepts a callback when asset is loaded. Throws an error if the asset failed to load.
     */
    abstract load(onLoad?: (asset: Asset) => void): void;
}
