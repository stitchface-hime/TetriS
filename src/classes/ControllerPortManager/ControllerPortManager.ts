import { Controller } from "@classes/Controller";
import { ControllerPortKey, ControllerPorts } from "./types";
import { Entity } from "@classes/Entity";

export class ControllerPortManager {
    private ports: ControllerPorts = {
        ...initialPorts,
    };

    connect(key: ControllerPortKey, controller: Controller) {
        if (!!this.ports[key] === null) {
            this.ports[key] = controller;
        }
    }

    disconnect(key: ControllerPortKey) {
        this.ports[key] = null;
    }

    disconnectAll() {
        this.ports = { ...initialPorts };
    }

    /**
     * Subscribes an entity to a controller at a given port given its key.
     * Returns `true` if subscription successful `false` otherwise.
     */
    subscribeToControllerAt(key: ControllerPortKey, entity: Entity) {
        const port = this.ports[key];

        if (port !== null) {
            port.subscribeEntity(entity);
            return true;
        }
        return false;
    }

    unsubscribeFromControllerAt(key: ControllerPortKey, entity: Entity) {
        const port = this.ports[key];

        if (port !== null) {
            port.unsubscribeEntity(entity);
        }
    }
}

const initialPorts = {
    [ControllerPortKey.PORT_0]: null,
    [ControllerPortKey.PORT_1]: null,
    [ControllerPortKey.PORT_2]: null,
    [ControllerPortKey.PORT_3]: null,
    [ControllerPortKey.PORT_4]: null,
    [ControllerPortKey.PORT_5]: null,
    [ControllerPortKey.PORT_6]: null,
    [ControllerPortKey.PORT_7]: null,
};
