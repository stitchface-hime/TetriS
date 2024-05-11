import { Entity } from "@classes/Entity";
import { arrayFindAndDelete } from "@utils/arrayFindAndDelete";
import { clamp } from "@utils/index";

/**
 * A collection of entities that are used in `GroupEntity`.
 *
 * Treated like an ordered set, that is, each entity can only appear in the collection once and has a specific index.
 */
export class EntityCollection<E extends Entity> {
    private _entities: E[];

    constructor(entities: E[] = []) {
        this._entities = entities;
    }

    /**
     * Returns a shallow copy of entities stored within this collection.
     */
    get entities() {
        return [...this._entities];
    }

    push(...entities: E[]) {
        entities.forEach((entity) => {
            if (this._entities.includes(entity)) return;
            this._entities.push(entity);
        });

        return this._entities.length;
    }

    unshift(...entities: E[]) {
        entities.forEach((entity) => {
            if (this._entities.includes(entity)) return;
            this._entities.unshift(entity);
        });

        return this._entities.length;
    }

    remove(...entities: E[]) {
        entities.forEach((entity) => arrayFindAndDelete(entity, this._entities));
    }

    moveBackward(entity: E, step = 1) {
        const idx = this._entities.indexOf(entity);

        if (idx === -1) return;

        const [targetEntity] = this._entities.splice(idx, 1);

        const finalIdx = clamp(idx + step, 0, this._entities.length);
        this._entities.splice(finalIdx, 0, targetEntity);
    }

    moveToBack(entity: E) {
        this.moveBackward(entity, this._entities.length);
    }

    moveForward(entity: E, step = 1) {
        this.moveBackward(entity, -step);
    }

    moveToFront(entity: E) {
        this.moveForward(entity, -this._entities.length);
    }
}
