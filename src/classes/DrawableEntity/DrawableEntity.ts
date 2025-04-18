import { Contexts, Entity } from "@classes/Entity";
import { GroupEntity } from "@classes/GroupEntity";
import { TextureManager } from "@classes/TextureManager";
import { add2DVectorTuples, product2DVectorTuples } from "@utils/index";
import { DrawBuffers } from "src/shaders/types";
import { Tuple } from "src/types";

export abstract class DrawableEntity extends Entity {
    private _defaultScale: [x: number, y: number] = [1, 1];

    private _dimensions: [width: number, height: number] = [0, 0];

    /**
     * Width and height of the entity at scale 1.
     */
    private _defaultDimensions: [width: number, height: number] = [0, 0];

    /**
     * Position of the bottom-left pixel of an entity within the canvas, the entity's absolute position.
     */
    protected _position: [x: number, y: number] = [0, 0];

    /**
     * Position of the bottom-left pixel of an entity relative to the bottom-left pixel of the parent.
     * Otherwise this value is equal to `position`.
     */
    protected _relativePosition: [x: number, y: number] = [0, 0];

    /**
     * Scale of the entity within a scene.
     */
    private _scale: [x: number, y: number] = this.defaultScale;

    /**
     * Rotation of the entity in degrees within a scene.
     */
    private _rotation = 0;

    /**
     * Color
     */

    /**
     * Additive modifier of the hue of this drawable (degrees `[0, 360)`).
     */
    private _hueModifier = 0;
    /**
     * Additive modifier of the saturation of this drawable (values `[0, 1]`).
     */
    private _saturationModifier = 0;
    /**
     * Additive modifier of the value (brightness) of this drawable (values `[0, 1]`).
     */
    private _valueModifier = 0;
    /**
     * Additive modifier of the alpha (transparency) of this drawable (values `[0, 1]`).
     */
    private _alphaModifier = 0;

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
        if (position !== undefined) this.position = position;
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
        this._parent = parent;
        this.relativePosition = parent
            ? add2DVectorTuples(this.position, [
                  -parent.position[0],
                  -parent.position[1],
              ])
            : this.position;
    }

    /**
     * Gets the dimensions of the entity including any scaling that has occurred.
     */
    get dimensions() {
        return [...this._dimensions];
    }

    private set dimensions(dimensions: [width: number, height: number]) {
        this._dimensions = dimensions;
    }

    get defaultDimensions() {
        return this._defaultDimensions;
    }

    /**
     * Sets the dimensions of the entity for the default scale. Also resets dimensions of entity to the new default.
     */
    set defaultDimensions(dimensions: [width: number, height: number]) {
        this._defaultDimensions = dimensions;
        this.dimensions = this._defaultDimensions;
    }

    get position() {
        return this._position;
    }

    private set position(position: [x: number, y: number]) {
        this._position = position;
    }

    get relativePosition() {
        return this._relativePosition;
    }

    private set relativePosition(relativePosition: [x: number, y: number]) {
        this._relativePosition = relativePosition;
    }

    /**
     * Translates the entity a given number of units in both the x and y direction.
     */
    translate(translation: [x: number, y: number]) {
        this.position = add2DVectorTuples(this.position, translation);
        this.relativePosition = this.parent
            ? add2DVectorTuples(this.position, [
                  -this.parent.position[0],
                  -this.parent.position[1],
              ])
            : this.position;
    }

    goToPosition(position: [x: number, y: number]) {
        const delta = add2DVectorTuples(position, [
            -this.position[0],
            -this.position[1],
        ]);
        this.translate(delta);
    }

    goToRelativePosition(relativePosition: [x: number, y: number]) {
        const delta = add2DVectorTuples(relativePosition, [
            -this.relativePosition[0],
            -this.relativePosition[1],
        ]);
        this.translate(delta);
    }

    get scale() {
        return this._scale;
    }

    /**
     * Sets the scale and adjusts this entity's dimensions accordingly.
     */
    set scale(scale: [x: number, y: number]) {
        this.scale = scale;
        this.dimensions = product2DVectorTuples(
            this.defaultDimensions,
            this.scale
        );
    }

    /**
     * Additively adjust the scale of the entity.
     */
    adjustScale(scale: [x: number, y: number]) {
        this.scale = add2DVectorTuples(this.scale, scale);
    }

    set defaultScale(scale: [x: number, y: number]) {
        this._defaultScale = scale;
    }

    /**
     * Scale entity to a certain width and height.
     */
    scaleToWidthHeight(dimensions: [width: number, height: number]) {
        if (
            this.defaultDimensions[0] !== 0 &&
            this.defaultDimensions[1] !== 0
        ) {
            this.scale = product2DVectorTuples(dimensions, [
                1 / this.defaultDimensions[0],
                1 / this.defaultDimensions[1],
            ]);
        }
    }

    /**
     * Resets scale of entity to default scale.
     */
    resetScale() {
        this.scale = this.defaultScale;
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(rotation: number) {
        this._rotation = rotation;
    }

    rotate(rotation: number) {
        this.rotation += rotation;
    }

    get hueModifier() {
        return this._hueModifier;
    }

    set hueModifier(hueModifier: number) {
        this._hueModifier = hueModifier;
    }

    get saturationModifier() {
        return this._saturationModifier;
    }

    set saturationModifier(saturationModifier: number) {
        this._saturationModifier = saturationModifier;
    }

    get valueModifier() {
        return this._valueModifier;
    }

    set valueModifier(valueModifier: number) {
        this._valueModifier = valueModifier;
    }

    get alphaModifier() {
        return this._alphaModifier;
    }

    set alphaModifier(alphaModifier: number) {
        this._alphaModifier = alphaModifier;
    }

    /**
     * Gets the HSVA modifier for this entity in order of hue, saturation, value (brightness) and alpha.
     */
    getHsvaModifier(): Tuple<number, 4> {
        return [
            this.hueModifier,
            this.saturationModifier,
            this.valueModifier,
            this.alphaModifier,
        ];
    }

    /**
     * Sets the HSVA modifier for this entity in order of hue, saturation, value (brightness) and alpha.
     */
    setHsvaModifier(hsva: Tuple<number, 4>) {
        this.hueModifier = hsva[0];
        this.saturationModifier = hsva[1];
        this.valueModifier = hsva[2];
        this.alphaModifier = hsva[3];
    }

    /**
     * Returns entity buffers containing:
     * - entity position (12 elements in buffer per rectangle in entity, `2 coord * 6 vert * numRectangles`)
     * - entity texture coordinates (12 elements in buffer per rectangle in entity, `2 coord * 6 vert * numRectangles`)
     * - entity texture key (1 element in buffer per rectangle in entity, `1 textureKey * numRectangles`)
     * - entity hsva modifier (24 elements in buffer per rectangle in entity, `4 hsva * 6 vert * numRectangles`)
     *
     * This also applies any HSVA modifications from the parent to the entity. If the entity is nested underneath multiple group
     * entities then HSVA modifications will be applied additively starting from the root group entity.
     */
    abstract getDrawBuffers(parentHsvaMod: Tuple<number, 4>): DrawBuffers;
}
