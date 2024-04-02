import { InputBinding } from "@classes/InputBinding";
import { Button } from "@classes/InputBinding/types";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { Interval } from "@classes/TimeMeasure";
import { Entity } from "@classes/Entity";
import { HeldButtonFrames } from "./types";

export class Controller {
    private subscriptions: Entity[] = [];
    private inputBinding = new InputBinding();
    private intervalManager: IntervalManager;
    private heldButtons: HeldButtonFrames[] = [];
    private releasedButtons: Button[] = [];

    constructor(intervalManager: IntervalManager) {
        this.intervalManager = intervalManager;
    }

    subscribeEntity(entity: Entity) {
        if (!this.subscriptions.includes(entity)) {
            this.subscriptions.push(entity);
        }
    }

    unsubscribeEntity(entity: Entity) {
        const entityIdx = this.subscriptions.findIndex((currentEntity) => currentEntity === entity);
        if (entityIdx !== -1) {
            this.subscriptions.splice(entityIdx, 1);
        }
    }

    unsubscribeAllEntities() {
        this.subscriptions = [];
    }

    private incrementHeldButtonFramesPressed(button: Button) {
        const entry = this.heldButtons.find((entry) => entry.id === button);

        if (entry !== undefined) {
            entry.frames++;
        }
    }

    private incrementAllHeldButtonsFramesPressed() {
        this.heldButtons.forEach((entry) => this.incrementHeldButtonFramesPressed(entry.id));
    }

    private addHeldButtonEntry(button: Button) {
        const entry = this.heldButtons.find((entry) => entry.id === button);

        if (entry === undefined) {
            this.heldButtons.push({ id: button, frames: 1 });
        }
    }

    private addReleasedButton(button: Button) {
        const entry = this.releasedButtons.find((entry) => entry === button);

        if (entry === undefined) {
            this.releasedButtons.push(button);
        }
    }

    private removeHeldButton(button: Button) {
        const entryIdx = this.heldButtons.findIndex((entry) => entry.id === button);
        const entry = this.heldButtons[entryIdx];

        if (entryIdx !== -1 && entry !== undefined) {
            this.addReleasedButton(entry.id);
            this.heldButtons.splice(entryIdx, 1);
        }
    }

    /**
     * Sends inputs to all subscribed entities and also updates input state.
     */
    private sendAndUpdateInputState() {
        this.subscriptions.forEach((entity) => {
            entity.acceptInput(this.heldButtons, this.releasedButtons);
        });

        this.releasedButtons = [];

        this.incrementAllHeldButtonsFramesPressed();
    }

    /**
     * Detect a key from a keyboard or button from gamepad being pressed.
     */
    press(input: string | GamepadButton) {
        const button = this.inputBinding.mapToButton(input);
        if (button !== undefined) {
            this.addHeldButtonEntry(button);
        }
    }

    /**
     * Detect a key from a keyboard or button from gamepad being released.
     */
    release(input: string | GamepadButton) {
        const button = this.inputBinding.mapToButton(input);
        if (button !== undefined) {
            this.removeHeldButton(button);
        }
    }

    /**
     * Run the loop to increment number of frames buttons are pressed down.
     */
    listen() {
        this.intervalManager.subscribe(
            new Interval(
                0,
                () => {
                    this.sendAndUpdateInputState();
                },
                Infinity
            )
        );
    }

    /**
     * Debug only - return an object containing current buttons pressed
     */
    getPressedButtons() {
        return this.heldButtons;
    }
}
