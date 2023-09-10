import { GameEntity } from "@classes/GameEntity";

export class GameRenderer {
    private entities: Set<GameEntity> = new Set();

    constructor() {}

    /**
     * Registers an entity within the game. Does nothing if you register
     * an entity with the same reference more than once.
     */
    registerEntity(entity: GameEntity) {
        this.entities.add(entity);
    }

    /**
     * Unregisters an entity from the game using its own reference.
     * Returns true if successfully found and removed, false if it doesn't exist.
     */
    unregisterEntity(entity: GameEntity) {
        return this.entities.delete(entity);
    }

    /**
     * Renders the scene with the given entities, entities are drawn in order.
     * Entities at the front are drawn first.
     */
    renderScene() {
        this.entities.forEach((entity) => entity.draw());
    }
}
