import { SpriteSheetDetails } from "src/shaders/types";
import { SpriteSheetKey } from "./TextureKey";

export const SpriteSheets: Record<SpriteSheetKey, SpriteSheetDetails> = {
    SPR_MINO_STD: {
        id: "SPR_MINO_STD",
        src: "/mino_sprites_light_32.png",
        width: 128,
        height: 128,
        spriteSize: {
            width: 32,
            height: 32,
        },
    },
};
