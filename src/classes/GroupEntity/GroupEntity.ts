import { BoundingBox } from "@classes/BoundingBox";
import { DrawableEntity } from "@classes/DrawableEntity";
import { Contexts, Entity } from "@classes/Entity";
import { EntityCollection } from "@classes/EntityCollection";
import { TextureManager } from "@classes/TextureManager";
import { DrawBuffers } from "src/shaders/types";
import { Tuple } from "src/types";

/**
 * A group entity is an entity that consists of
 * - passive entities: entities that belong to the group but are not visible
 * - drawable entities: entities that belong to the group that are renderable to a texture or screen
 *
 * When a group entity is rendered, child entities are rendered in the order they are pushed into the group entity.
 */
export abstract class GroupEntity extends DrawableEntity {
    private _passives = new EntityCollection<Entity>();
    private _drawables = new EntityCollection<DrawableEntity>();
    private boundingBox = new BoundingBox(this);

    constructor(contexts: Contexts = {}) {
        super({}, contexts);
    }

    get passives() {
        return this._passives;
    }

    get drawables() {
        return this._drawables;
    }

    override translate(translation: [x: number, y: number]) {
        super.translate(translation);

        this.drawables.entities.forEach((drawable) => {
            drawable.translate(translation);
        });
    }

    /**
     * Get the dimensions of a minimum rectangle that encapsulates all child entities.
     */
    getDrawablesMinRectDim(): [width: number, height: number] {
        // console.warn("TODO: does not cover case where the max rel x/y does not touch the bounds of the rectangle");
        const drawablesByRelX = this.drawables.entities.sort(
            (e1, e2) => e1.relativePosition[0] - e2.relativePosition[0]
        );
        const drawablesByRelY = this.drawables.entities.sort(
            (e1, e2) => e1.relativePosition[1] - e2.relativePosition[1]
        );

        const minRelXDrawable = drawablesByRelX[0];
        const maxRelXDrawable = drawablesByRelX[drawablesByRelX.length - 1];

        const minRelYDrawable = drawablesByRelY[0];
        const maxRelYDrawable = drawablesByRelY[drawablesByRelX.length - 1];

        return [
            maxRelXDrawable.relativePosition[0] +
                maxRelXDrawable.dimensions[0] -
                minRelXDrawable.relativePosition[0],
            maxRelYDrawable.relativePosition[1] +
                maxRelYDrawable.dimensions[1] -
                minRelYDrawable.relativePosition[1],
        ];
    }

    /**
     * Get the relative position of minimum rectangle that encapsulates all child drawable entities.
     */
    getDrawablesMinRectRelPos(): [x: number, y: number] {
        const drawablesByRelX = this.drawables.entities.sort(
            (e1, e2) => e1.relativePosition[0] - e2.relativePosition[0]
        );
        const drawablesByRelY = this.drawables.entities.sort(
            (e1, e2) => e1.relativePosition[1] - e2.relativePosition[1]
        );

        return [
            drawablesByRelX[0].relativePosition[0],
            drawablesByRelY[0].relativePosition[1],
        ];
    }

    getDrawBuffers(hsvaModBuffer: Tuple<number, 4>): DrawBuffers {
        const drawBuffers: DrawBuffers = {
            positionBuffer: [],
            textureCoordBuffer: [],
            textureKeyBuffer: [],
            hsvaModBuffer: [],
        };

        this.drawables.entities.map((entity) => {
            const sumHsvaMod = this.getHsvaModifier().map(
                (component, idx) => component + hsvaModBuffer[idx]
            ) as Tuple<number, 4>;

            const entityBuffers = entity.getDrawBuffers(sumHsvaMod);

            drawBuffers.positionBuffer.push(...entityBuffers.positionBuffer);
            drawBuffers.textureCoordBuffer.push(
                ...entityBuffers.textureCoordBuffer
            );
            drawBuffers.textureKeyBuffer.push(
                ...entityBuffers.textureKeyBuffer
            );
            drawBuffers.hsvaModBuffer.push(...entityBuffers.hsvaModBuffer);
        });

        const boundingBoxBuffers = this.boundingBox.getDrawBuffers();
        drawBuffers.positionBuffer.push(...boundingBoxBuffers.positionBuffer);
        drawBuffers.textureCoordBuffer.push(
            ...boundingBoxBuffers.textureCoordBuffer
        );
        drawBuffers.textureKeyBuffer.push(
            ...boundingBoxBuffers.textureKeyBuffer
        );
        drawBuffers.hsvaModBuffer.push(...boundingBoxBuffers.hsvaModBuffer);

        return drawBuffers;
    }
}
