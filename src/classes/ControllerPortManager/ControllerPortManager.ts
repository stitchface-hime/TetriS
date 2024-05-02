import { ControllerPortKey, ControllerPorts } from "./types";
import { ControllerPort } from "@classes/ControllerPort/ControllerPort";

export class ControllerPortManager {
    private ports: ControllerPorts = {
        [ControllerPortKey.PORT_0]: new ControllerPort(),
        [ControllerPortKey.PORT_1]: new ControllerPort(),
        [ControllerPortKey.PORT_2]: new ControllerPort(),
        [ControllerPortKey.PORT_3]: new ControllerPort(),
        [ControllerPortKey.PORT_4]: new ControllerPort(),
        [ControllerPortKey.PORT_5]: new ControllerPort(),
        [ControllerPortKey.PORT_6]: new ControllerPort(),
        [ControllerPortKey.PORT_7]: new ControllerPort(),
    };

    getPort(key: ControllerPortKey) {
        return this.ports[key];
    }

    plugOutAllControllers() {
        Object.values(this.ports).forEach((port) => port.plugOut());
    }

    getControllerAtPort(key: ControllerPortKey) {
        if (this.ports[key] === null) {
            console.warn("No controller at this port key");
            return null;
        }

        return this.ports[key];
    }
}
