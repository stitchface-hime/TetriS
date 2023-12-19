import { Game } from "@classes/Game/Game";
import { InputBinding } from "@classes/InputBinding";
import { Button } from "@classes/InputBinding/types";
import { IntervalManager } from "@classes/TimeMeasure/IntervalManager";
import { GameControllerIntervalKeys } from "./GameControllerIntervalKeys";
import { Interval } from "@classes/TimeMeasure";

export class GameController {
    private game: Game;
    private inputBinding = new InputBinding();
    private intervalManager = new IntervalManager();
    private queue: Set<Button> = new Set<Button>();
    private pressedFrames: Record<string, number> = {};
    // Do we need this?
    // private consumptionLock
    // Potential abstraction
    // private buttonConsumer: (held: Record<Button number>, released: Button[], pressed: Button[]) => void | null;

    constructor(game: Game) {
        this.game = game;
    }

    /**
     * Consumes any captured button inputs since last frame and calls instructions depending on the context,
     * in this case the game. Also detects button releases as well.
     */
    private consume() {
        // Only read the first button pressed but we can capture how long the other buttons are held for too
        const oldPressedFrames = { ...this.pressedFrames };
        this.pressedFrames = {};

        let lastPressed: Button | null = null;

        this.queue.forEach((button) => {
            if (oldPressedFrames[button]) {
                this.pressedFrames[button] = oldPressedFrames[button] + 1;
                delete oldPressedFrames[button];
            } else {
                this.pressedFrames[button] = 1;
                if (lastPressed === null) {
                    // freshly pressed button
                    lastPressed = button;
                }
            }
        });

        const releasedButtons = Object.keys(oldPressedFrames) as unknown as Button[];

        // release
        if (releasedButtons.includes(Button.BUTTON_DOWN)) {
            this.game.disableSoftDrop();
        }

        // hold
        if (lastPressed !== null) {
            switch (lastPressed) {
                case Button.BUTTON_0:
                    this.game.rotateAntiClockwise();
                    break;
                case Button.BUTTON_1:
                    this.game.rotateClockwise();
                    break;
                case Button.BUTTON_DOWN:
                    this.game.enableSoftDrop();
                    break;
                case Button.BUTTON_UP:
                    this.game.hardDrop();
                case Button.BUTTON_LEFT:
                    this.game.moveLeft();
                case Button.BUTTON_RIGHT:
                    this.game.moveRight();
                case Button.L_TRIGGER_F:
                    this.game.hold();
                    break;
            }
        }

        this.queue.clear();
    }

    /**
     * Detect a key from a keyboard or button from gamepad being pressed.
     */
    input(input: string | GamepadButton) {
        const button = this.inputBinding.mapToButton(input);
        if (button) {
            this.queue.add(button);
        }
    }

    /**
     * Run the consumption loop to consume any button presses captured between frames.
     */
    listen() {
        this.intervalManager.subscribe(
            GameControllerIntervalKeys.RUN,
            new Interval(
                1000 / 60,
                () => {
                    this.consume();
                },
                Infinity
            )
        );
    }
}
