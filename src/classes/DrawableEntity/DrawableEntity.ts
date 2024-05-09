import { Contexts, Entity } from "@classes/Entity";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { TextureManager } from "@classes/TextureManager";
import { add2DVectorTuples, product2DVectorTuples } from "@utils/index";
import { DrawBuffers } from "src/shaders/types";
import { Tuple } from "src/types";

export abstract class DrawableEntity extends Entity {
    private defaultScale: [x: number, y: number] = [1, 1];

    private dimensions: [width: number, height: number] = [0, 0];

    /**
     * Width and height of the entity at scale 1.
     */
    private defaultDimensions: [width: number, height: number] = [0, 0];

    /**
     * Position of the bottom-left pixel of an entity within the canvas
     */
    private position: [x: number, y: number] = [0, 0];

    /**
     * Position of the bottom-left pixel of an entity relative to the bottom-left pixel of the parent.
     * Otherwise this value is equal to `position`.
     */
    private relativePosition: [x: number, y: number] = [0, 0];

    /**
     * Scale of the entity within a scene.
     */
    private scale: [x: number, y: number] = this.defaultScale;
    /**
     * Rotation of the entity in degrees within a scene.
     */
    private rotation = 0;

    /**
     * Color
     */

    /**
     * Additive modifier of the hue of this drawable (degrees `[0, 360)`).
     */
    private hueModifier = 0;
    /**
     * Additive modifier of the saturation of this drawable (values `[0, 1]`).
     */
    private saturationModifier = 0;
    /**
     * Additive modifier of the value (brightness) of this drawable (values `[0, 1]`).
     */
    private valueModifier = 0;
    /**
     * Additive modifier of the alpha (transparency) of this drawable (values `[0, 1]`).
     */
    private alphaModifier = 0;

    constructor(
        {
            position,
            scale,
            rotation,
        }: Partial<{
            position: [x: number, y: number];
            scale: [x: number, y: number];
            rotation: number;
        }> = {},
        contexts: Contexts = {}
    ) {
        super(contexts);
        if (position !== undefined) this.setPosition(position);
        if (scale !== undefined) this.scale = scale || this.scale;
        if (rotation !== undefined) this.rotation = rotation || this.rotation;
    }

    get parent() {
        return this._parent;
    }

    /**
     * Sets and unsets the parent of this drawable entity.
     * If setting a parent, then the relative position of this entity will reflect its position relative to the parent.
     * If unsetting parent, then the relative position of this entity will be this entity's current absolute position.
     */
    set parent(parent: GroupEntity | null) {
        this.relativePosition = parent ? add2DVectorTuples(this.position, [-parent.position[0], -parent.position[1]]) : this.position;
        this._parent = parent;
    }

    getDefaultDimensions() {
        return this.defaultDimensions;
    }

    /**
     * Gets the dimensions of the entity including any scaling that has occurred.
     */
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

    getRelativePosition() {
        return this.relativePosition;
    }

    setPosition(position: [x: number, y: number]) {
        this.position = position;
        // TODO: need to update relative position too and children entities!!!
    }

    setRelativePosition(relativePosition: [x: number, y: number]) {
        if (this.parent) {
            this.relativePosition = relativePosition;
            this.position = add2DVectorTuples(this.parent.position, relativePosition); // can be refactored
        }
    }

    translate(position: [x: number, y: number]) {
        this.position = add2DVectorTuples(this.position, position); // can be refactored to use setPosition
        this.relativePosition = this.parent ? add2DVectorTuples(this.relativePosition, position) : this.position; // can be refactored to use setRelativePosition
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

    getColorModifier() {
        return [this.hueModifier, this.saturationModifier, this.valueModifier, this.alphaModifier];
    }

    setColorModifier(hsva: Tuple<number, 4>) {
        this.hueModifier = hsva[0];
        this.saturationModifier = hsva[1];
        this.valueModifier = hsva[2];
        this.alphaModifier = hsva[3];
    }

    getHueModifier() {
        return this.hueModifier;
    }

    setHueModifier(hueModifier: number) {
        this.hueModifier = hueModifier;
    }

    getSaturationModifier() {
        return this.saturationModifier;
    }

    setSaturationModifier(saturationModifier: number) {
        this.saturationModifier = saturationModifier;
    }

    getValueModifier() {
        return this.valueModifier;
    }

    setValueModifier(valueModifier: number) {
        this.valueModifier = valueModifier;
    }

    getAlphaModifier() {
        return this.alphaModifier;
    }

    setAlphaModifier(alphaModifier: number) {
        this.alphaModifier = alphaModifier;
    }

    /**
     * Returns entity buffers containing:
     * - entity position (12 elements in buffer per entity, 2 coord * 6)
     * - entity texture coordinates (12 elements in buffer per entity, 2 coord * 6)
     * - entity texture key (1 element in buffer per entity)
     * - entity hsva modifier (24 elements in buffer per entity, 4 hsva * 6)
     *
     * If a texture does not exist within the supplied texture manager with the returned texture key,
     * this function will be required to create a texture and load it into the texture manager keyed by texture key.
     */
    abstract getDrawBuffers(gl: WebGLRenderingContext, textureManager: TextureManager): Promise<DrawBuffers>;
}
