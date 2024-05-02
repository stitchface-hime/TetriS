import { InputBinding } from "@classes/InputBinding";
import { Button } from "@classes/InputBinding/types";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { Interval } from "@classes/TimeMeasure";
import { arrayFindAndDelete } from "@utils/arrayFindAndDelete";
import { ControllerPort } from "@classes/ControllerPort";

export class Controller {
    private pressedButtons: Button[] = [];
    private inputBinding = new InputBinding();
    private intervalManager: IntervalManager;
    private _port: ControllerPort | null = null;

    constructor(intervalManager: IntervalManager) {
        this.intervalManager = intervalManager;
    }

    get port() {
        return this._port;
    }

    set port(port: ControllerPort | null) {
        this._port = port;
        if (port) {
            this.notify();
        }
    }

    private addPressedButton(button: Button) {
        const entry = this.pressedButtons.find((entry) => entry === button);

        if (entry === undefined) {
            this.pressedButtons.push(button);
        }
    }

    private removePressedButton(button: Button) {
        arrayFindAndDelete(button, this.pressedButtons);
    }

    /**
     * Detect a key from a keyboard or button from gamepad being pressed.
     */
    private press(input: string | GamepadButton) {
        const button = this.inputBinding.mapToButton(input);
        if (button !== undefined) {
            this.addPressedButton(button);
        }
    }

    /**
     * Detect a key from a keyboard or button from gamepad being released.
     */
    private release(input: string | GamepadButton) {
        const button = this.inputBinding.mapToButton(input);
        if (button !== undefined) {
            this.removePressedButton(button);
        }
    }

    getEventTriggers() {
        // wrap in arrow functions otherwise `this` will be bound to scope of return object
        return {
            press: (input: string | GamepadButton) => this.press(input),
            release: (input: string | GamepadButton) => this.release(input),
        };
    }

    /**
     * Run the loop to increment number of frames buttons are pressed down to connected port.
     */
    notify() {
        this.intervalManager.subscribe(
            new Interval(
                0,
                () => {
                    this.port?.notify(this.pressedButtons);
                },
                Infinity
            )
        );
    }

    /**
     * Debug only - return an object containing current buttons pressed
     */
    getState() {
        return {
            press: this.pressedButtons,
        };
    }
}
