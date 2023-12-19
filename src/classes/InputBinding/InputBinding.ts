import { keyboardDefault } from "./defaults";
import { Button, ButtonBinding } from "./types";

export class InputBinding {
    private useGamepad: boolean;
    private buttonBinding: ButtonBinding;

    constructor() {
        this.useGamepad = false;
        this.buttonBinding = keyboardDefault;
    }

    mapToButton(input: string | GamepadButton) {
        return (Object.keys(this.buttonBinding) as unknown as Button[]).find((button: Button) => this.buttonBinding[button] === input);
    }
}
