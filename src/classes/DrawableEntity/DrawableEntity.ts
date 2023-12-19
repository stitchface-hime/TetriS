import { ShaderProgram } from "@classes/ShaderProgram/ShaderProgram";
import { add2DVectorTuples } from "@utils/add2DVectorTuples";
import { product2DVectorTuples } from "@utils/product2DVectorTuples";

export abstract class DrawableEntity {
    protected defaultScale: [x: number, y: number] = [1, 1];

    protected dimensions: [width: number, height: number] = [0, 0];

    /**
     * Width and height of the entity at scale 1.
     */
    protected defaultDimensions: [width: number, height: number] = [0, 0];

    /**
     * Position of the bottom-left pixel of an entity within a scene
     */
    protected position: [x: number, y: number] = [0, 0];
    /**
     * Scale of the entity within a scene.
     */
    protected scale: [x: number, y: number] = this.defaultScale;
    /**
     * Rotation of the entity in degrees within a scene.
     */
    protected rotation = 0;

    protected renderer: ShaderProgram | null = null;

    constructor({
        position,
        scale,
        rotation,
    }: Partial<{
        position: [x: number, y: number];
        scale: [x: number, y: number];
        rotation: number;
    }> = {}) {
        if (position !== undefined) this.setPosition(position);
        if (scale !== undefined) this.scale = scale || this.scale;
        if (rotation !== undefined) this.rotation = rotation || this.rotation;
    }

    setRenderer(renderer: ShaderProgram) {
        this.renderer = renderer;
    }

    getDefaultDimensions() {
        return this.defaultDimensions;
    }

    getDimensions() {
        return this.dimensions;
    }

    /**
     * Sets the dimensions of the entity. Also resets dimensions of entity to the new default.
     */
    setDefaultDimensions(dimensions: number | [width: number, height: number]) {
        this.defaultDimensions = typeof dimensions == "number" ? [dimensions, dimensions] : dimensions;
        this.dimensions = this.defaultDimensions;
    }

    getPosition() {
        return this.position;
    }

    setPosition(position: [x: number, y: number]) {
        this.position = position;
    }

    translate(position: [x: number, y: number]) {
        this.position = add2DVectorTuples(this.position, position);
    }

    getScale() {
        return this.scale;
    }

    setScale(scale: [x: number, y: number]) {
        this.scale = scale;
        this.dimensions = product2DVectorTuples(this.defaultDimensions, this.scale);
    }

    /**
     * Additively adjust the scale of the entity.
     */
    adjustScale(scale: [x: number, y: number]) {
        this.setScale(add2DVectorTuples(this.scale, scale));
    }

    setDefaultScale(scale: [x: number, y: number]) {
        this.defaultScale = scale;
    }

    /**
     * Scale entity to a certain width and height.
     */
    scaleToWidthHeight(dimensions: [width: number, height: number]) {
        if (this.defaultDimensions[0] !== 0 && this.defaultDimensions[1] !== 0) {
            this.setScale(product2DVectorTuples(dimensions, [1 / this.defaultDimensions[0], 1 / this.defaultDimensions[1]]));
        }
    }

    /**
     * Resets scale of entity to default scale.
     */
    resetScale() {
        this.scale = this.defaultScale;
    }

    getRotation() {
        return this.rotation;
    }

    setRotation(rotation: number) {
        this.rotation = rotation;
    }

    rotate(rotation: number) {
        this.rotation += rotation;
    }

    /**
     * Draws the game entity's sprite if provided.
     */
    abstract draw(gl: WebGLRenderingContext): Promise<void>;
}
