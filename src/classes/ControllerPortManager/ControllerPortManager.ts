import { Controller } from "@classes/Controller";
import { ControllerPortKey, ControllerPorts } from "./types";
import { Entity } from "@classes/Entity";
import { ControllerContext } from "@classes/ControllerContext";

export class ControllerPortManager {
    private ports: ControllerPorts = {
        ...initialPorts,
    };

    connect(key: ControllerPortKey, controller: Controller) {
        if (this.ports[key] === null) {
            this.ports[key] = controller;
        }
    }

    disconnect(key: ControllerPortKey) {
        this.ports[key] = null;
    }

    // TODO: do we also need to remove all controller contexts too?
    disconnectAll() {
        this.ports = { ...initialPorts };
    }

    getControllerAtPort(key: ControllerPortKey) {
        if (this.ports[key] === null) {
            console.warn("No controller at this port key");
            return null;
        }

        return this.ports[key];
    }

    /**
     * Subscribes a controller context to a controller at a given port given its key.
     * Returns `true` if subscription successful `false` otherwise.
     */
    subscribeToControllerAt(key: ControllerPortKey, context: ControllerContext) {
        const port = this.ports[key];

        if (port !== null) {
            port.subscribeContext(context);
            return true;
        }
        return false;
    }

    unsubscribeFromControllerAt(key: ControllerPortKey, context: ControllerContext) {
        const port = this.ports[key];

        if (port !== null) {
            port.unsubscribeContext(context);
        }
    }

    getEventTriggerFromControllerAt(key: ControllerPortKey) {
        const port = this.ports[key];

        if (port !== null) {
            return port.getEventTriggers();
        }

        console.warn("Unable to get triggers, no controller found at port id:", key);
        return null;
    }

    // debug

    getControllerState(key: ControllerPortKey) {
        const port = this.ports[key];

        if (port !== null) {
            return port.getState();
        }

        return {};
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
