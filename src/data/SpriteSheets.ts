import { SpriteSheetDetails } from "src/shaders/types";

export type SpriteSheetKey = "STANDARD_MINO";

export const SpriteSheets: Record<SpriteSheetKey, SpriteSheetDetails> = {
    STANDARD_MINO: {
        id: "standard_mino",
        src: "/mino_sprites_light_32.png",
        width: 128,
        height: 128,
        spriteSize: {
            width: 32,
            height: 32,
        },
    },
};
