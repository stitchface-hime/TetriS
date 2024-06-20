import { ShaderTextureDetails } from "src/shaders/types";
import { ShaderTextureKey, TextureKey } from "./TextureKey";

export const ShaderTextures: Record<ShaderTextureKey, ShaderTextureDetails> = {
    TEX_boundingBox: {
        id: "TEX_boundingBox",
        dimensions: [1, 1],
    },
    TEX_playfield: {
        id: "TEX_playfield",
        dimensions: [0, 0],
    },
};
