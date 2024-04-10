import { InputBinding } from "@classes/InputBinding";
import { Button } from "@classes/InputBinding/types";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { Interval } from "@classes/TimeMeasure";
import { ControllerContext } from "@classes/ControllerContext/ControllerContext";
import { arrayFindAndDelete } from "@utils/arrayFindAndDelete";

export class Controller {
    private pressedButtons: Button[] = [];
    private subscriptions: ControllerContext[] = [];
    private inputBinding = new InputBinding();
    private intervalManager: IntervalManager;

    constructor(intervalManager: IntervalManager) {
        this.intervalManager = intervalManager;
        this.update();
    }

    /**
     * Subscribe a controller context to listen to inputs from this controller.
     */
    subscribeContext(context: ControllerContext) {
        if (this.subscriptions.includes(context)) {
            console.warn("Context already subscribed, ignoring");
            return;
        }
        this.subscriptions.push(context);
    }

    /**
     * Unsubscribe a controller context to no longer listen to inputs from this controller.
     */
    unsubscribeContext(context: ControllerContext) {
        const contextIdx = this.subscriptions.findIndex((currentContext) => currentContext === context);
        if (contextIdx !== -1) {
            this.subscriptions.splice(contextIdx, 1);
        }
    }

    unsubscribeAllContexts() {
        this.subscriptions = [];
    }

    /**
     * Sends inputs to all subscribed entities and also updates input state.
     */
    private updateAllSubscriptions() {
        this.subscriptions.forEach((context) => {
            context.receivePressSignal(this.pressedButtons);
        });
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
     * Run the loop to increment number of frames buttons are pressed down.
     */
    private update() {
        this.intervalManager.subscribe(
            new Interval(
                0,
                () => {
                    this.updateAllSubscriptions();
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
