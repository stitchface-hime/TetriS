import { TextureManager } from "@classes/TextureManager";
import { Asset } from "../Asset";

export class ErrorAsset extends Asset {
    constructor(id: string) {
        super(id);
    }

    load(onLoad?: (asset: Asset) => void) {
        this.isLoaded = false;

        throw new Error("Failed to load new asset!");
    }
}
