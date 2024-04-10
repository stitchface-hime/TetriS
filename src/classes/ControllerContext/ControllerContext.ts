import { ButtonFrames, PressedButtons } from "@classes/Controller/types";
import { Entity } from "@classes/Entity";
import { Button } from "@classes/InputBinding/types";

/**
 * This class is used to transfer input from a controller to an entity.
 * Each context can only transfer inputs to one entity at a time.
 */
export class ControllerContext {
    private pressedButtons: PressedButtons = [];
    private paused: boolean = false;
    private entity: Entity;

    constructor(entity: Entity) {
        this.entity = entity;
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

    receivePressSignal(recordedPressedButtons: Button[]) {
        if (!this.paused) {
            const prevHeldButtonIds = this.pressedButtons.map((heldButtons) => heldButtons.id);
            this.pressedButtons = recordedPressedButtons.map((button) => this.incrementButtonFramesPressed(button));
            const newHeldButtonIds = this.pressedButtons.map((heldButtons) => heldButtons.id);
            const releasedButtons = prevHeldButtonIds.filter((button) => !newHeldButtonIds.includes(button));

            this.entity.acceptInput(this.pressedButtons, releasedButtons);
        }
    }

    // Debug
    getState() {
        return this.pressedButtons;
    }
}
