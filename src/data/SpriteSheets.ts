import { SpriteSheetDetails } from "src/shaders/types";

export const SpriteSheets: Record<string, SpriteSheetDetails> = {
    STANDARD_MINO: {
        id: "standard_mino",
        src: "/mino_sprites_light.png",
        width: 256,
        height: 256,
        spriteSize: {
            width: 64,
            height: 64,
        },
    },
};
