import { Controller, PressedButtons } from "@classes/Controller";
import { ControllerContext } from "@classes/ControllerContext";
import { Button } from "@classes/InputBinding/types";
import { arrayFindAndDelete } from "@utils/arrayFindAndDelete";

export class ControllerPort {
    private _controller: Controller | null = null;
    private listeners: ControllerContext[] = [];

    get controller() {
        return this._controller;
    }

    plugIn(controller: Controller) {
        this._controller = controller;
        controller.port = this;
    }

    plugOut() {
        this._controller = null;

        if (!this.controller) return;

        this.controller.port = null;
    }

    /**
     * Subscribe a controllable to listen to inputs from this controller.
     */
    subscribe(controllable: ControllerContext) {
        if (this.listeners.includes(controllable)) {
            console.warn("Controllable already subscribed, ignoring");
            return;
        }
        this.listeners.push(controllable);
    }

    /**
     * Unsubscribe a controller context to no longer listen to inputs from this controller.
     */
    unsubscribe(controllable: ControllerContext) {
        arrayFindAndDelete(controllable, this.listeners);
    }

    unsubscribeAll() {
        this.listeners = [];
    }

    /**
     * To be called from `Controller` sends inputs to all subscribed controller contexts.
     */
    notify(pressedButtons: Button[]) {
        this.listeners.forEach((listener) => {
            listener.listen(pressedButtons);
        });
    }
}
