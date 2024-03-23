import { Entity } from "@classes/Entity";
import { GroupEntity } from "@classes/GroupEntity/GroupEntity";
import { TextureManager } from "@classes/TextureManager";
import { TextureKey } from "@data/TextureKey";
import { add2DVectorTuples, product2DVectorTuples } from "@utils/index";
import { DrawBuffers } from "src/shaders/types";

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

    constructor({
        position,
        scale,
        rotation,
    }: Partial<{
        position: [x: number, y: number];
        scale: [x: number, y: number];
        rotation: number;
    }> = {}) {
        super();
        if (position !== undefined) this.setPosition(position);
        if (scale !== undefined) this.scale = scale || this.scale;
        if (rotation !== undefined) this.rotation = rotation || this.rotation;
    }

    setParent(parent: GroupEntity) {
        this.parent = parent;
        this.relativePosition = add2DVectorTuples(this.position, [-this.parent.position[0], -this.parent.position[1]]);
    }

    unsetParent() {
        this.parent = null;
        this.relativePosition = this.position;
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

    /**
     * Returns entity buffers containing:
     * - entity position (12 elements in buffer per entity)
     * - entity texture coordinates (12 elements in buffer per entity)
     * - entity texture key (1 element in buffer per entity)
     *
     * If a texture does not exist within the supplied texture manager with the returned texture key,
     * this function will be required to create a texture and load it into the texture manager keyed by texture key.
     */
    abstract getDrawBuffers(gl: WebGLRenderingContext, textureManager: TextureManager): Promise<DrawBuffers>;
}
