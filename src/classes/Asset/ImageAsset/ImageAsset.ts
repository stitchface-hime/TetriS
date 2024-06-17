import { SpriteSheetLoader } from "@classes/ShaderProgram/SpriteSheetLoader";
import { ShaderTextureAsset } from "../ShaderTextureAsset";
import { TextureManager } from "@classes/TextureManager";
import { Asset } from "../Asset";

export class ImageAsset extends ShaderTextureAsset {
    private src: string;
    private _image: HTMLImageElement | null = null;

    constructor(
        id: string,
        program: SpriteSheetLoader,
        textureManager: TextureManager
    ) {
        super(id, program, textureManager);
        this.src = program.src;
    }

    get image() {
        return this._image;
    }

    private set image(image: HTMLImageElement | null) {
        this._image = image;
    }

    load(onLoad?: (asset: Asset) => void) {
        let texture: WebGLTexture | null = null;

        this.isLoaded = false;
        const image = new Image();
        image.src = this.src;
        image.onload = () => {
            this.image = image;
            texture = this.createTexture();

            if (onLoad) onLoad(this);
        };
        image.onerror = (e) => {
            throw new Error("Image asset failed to load.");
        };
    }
}
