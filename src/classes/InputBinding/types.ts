export enum Button {
    "BUTTON_UP",
    "BUTTON_DOWN",
    "BUTTON_LEFT",
    "BUTTON_RIGHT",
    "BUTTON_0",
    "BUTTON_1",
    "BUTTON_2",
    "BUTTON_3",
    "SELECT_BACK",
    "START",
    "L_TRIGGER_B",
    "L_TRIGGER_F",
    "R_TRIGGER_B",
    "R_TRIGGER_F",
}

export type GamepadBinding = Record<Button, GamepadButton | null>;
export type KeyboardBinding = Record<Button, string | null>;

export type ButtonBinding = GamepadBinding | KeyboardBinding;
