import { PressedButtons } from "@classes/Controller";
import { Button } from "@classes/InputBinding/types";

export interface IControllable {
    acceptInput(heldButtons: PressedButtons, releasedButtons: Button[]): void;
}
