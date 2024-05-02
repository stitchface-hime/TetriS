import { ControllerPort } from "@classes/ControllerPort";

export enum ControllerPortKey {
    PORT_0,
    PORT_1,
    PORT_2,
    PORT_3,
    PORT_4,
    PORT_5,
    PORT_6,
    PORT_7,
}

export type ControllerPorts = Record<ControllerPortKey, ControllerPort>;
