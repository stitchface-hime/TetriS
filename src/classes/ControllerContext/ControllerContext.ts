import { ButtonFrames, PressedButtons } from "@classes/Controller/types";
import { ControllerPort } from "@classes/ControllerPort";
import { ControllerPortManager } from "@classes/ControllerPortManager";
import { ControllerPortKey } from "@classes/ControllerPortManager/types";
import { Button } from "@classes/InputBinding/types";
import { IControllable } from "src/interfaces/IControllable";
import { IManager } from "src/interfaces/IManager";

/**
 * This class is used to transfer input from a controller to an entity.
 * Each context can only transfer inputs to one entity at a time.
 */
export class ControllerContext implements IManager {
    private controllerPortManager: ControllerPortManager;
    private pressedButtons: PressedButtons = [];
    private paused: boolean = false;
    private controllable: IControllable;
    private port: ControllerPort | null = null;

    constructor(controllable: IControllable, controllerPortManager: ControllerPortManager) {
        this.controllable = controllable;
        this.controllerPortManager = controllerPortManager;
    }

    subscribeToPort(key: ControllerPortKey) {
        this.port = this.controllerPortManager.getPort(key);
        this.port.subscribe(this);
    }

    unsubscribeFromPort() {
        this.port?.unsubscribe(this);
    }

    pauseContext() {
        this.paused = true;
    }

    resumeContext() {
        this.paused = false;
    }

    private incrementButtonFramesPressed(button: Button): ButtonFrames {
        const entry = this.pressedButtons.find((entry) => entry.id === button);

        if (entry !== undefined) {
            return {
                ...entry,
                frames: entry.frames + 1,
            };
        } else {
            return {
                id: button,
                frames: 1,
            };
        }
    }

    /**
     * To be called within a subscribed `ControllerPort` to accept inputs.
     */
    listen(recordedPressedButtons: Button[]) {
        if (!this.paused) {
            const prevHeldButtonIds = this.pressedButtons.map((heldButtons) => heldButtons.id);
            this.pressedButtons = recordedPressedButtons.map((button) => this.incrementButtonFramesPressed(button));
            const newHeldButtonIds = this.pressedButtons.map((heldButtons) => heldButtons.id);
            const releasedButtons = prevHeldButtonIds.filter((button) => !newHeldButtonIds.includes(button));

            this.controllable.acceptInput(this.pressedButtons, releasedButtons);
        }
    }

    // Debug
    getState() {
        return this.pressedButtons;
    }

    destroy(): void {
        this.unsubscribeFromPort();
    }
}
