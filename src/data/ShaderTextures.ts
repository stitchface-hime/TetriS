import { ShaderTextureDetails } from "src/shaders/types";
import { ShaderTextureKey, TextureKey } from "./TextureKey";

export const ShaderTextures: Record<ShaderTextureKey, ShaderTextureDetails> = {
    TEX_color: {
        id: "TEX_color",
        dimensions: [1, 1],
    },
    TEX_playfield: {
        id: "TEX_playfield",
        dimensions: [0, 0],
    },
};
