import { Asset } from "../Asset";

export class ImageAsset extends Asset {
    private src: string;
    private _image: HTMLImageElement | null = null;

    constructor(src: string) {
        super(src);
        this.src = src;
    }

    get image() {
        return this._image;
    }

    private set image(image: HTMLImageElement | null) {
        this._image = image;
    }

    load(onLoad?: () => void) {
        this.isLoaded = false;
        const image = new Image();
        image.src = this.src;
        image.onload = () => {
            if (onLoad) onLoad();
            this.image = image;
            this.isLoaded = true;
        };
        image.onerror = (e) => {
            console.error(e);
        };
    }
}
