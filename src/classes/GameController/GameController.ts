import { Game } from "@classes/Game/Game";
import { InputBinding } from "@classes/InputBinding";
import { Button } from "@classes/InputBinding/types";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { GameControllerIntervalKeys } from "./GameControllerIntervalKeys";
import { Interval } from "@classes/TimeMeasure";
import { FRAME_MS } from "src/constants";

export class GameController {
    private game: Game;
    private inputBinding = new InputBinding();
    private intervalManager: IntervalManager;
    private heldButtons: { id: Button; frames: number }[] = [];
    private releasedButtons: Button[] = [];

    constructor(game: Game, intervalManager: IntervalManager) {
        this.game = game;
        this.intervalManager = intervalManager;
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
     * Sends inputs to consuming context and also updates input state.
     *
     */
    private sendAndUpdateInputState() {
        this.game.handleInputState(this.heldButtons, this.releasedButtons);

        this.releasedButtons = [];

        this.incrementAllHeldButtonsFramesPressed();
    }

    /**
     * Detect a key from a keyboard or button from gamepad being pressed.
     */
    input(input: string | GamepadButton) {
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
            GameControllerIntervalKeys.RUN,
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
