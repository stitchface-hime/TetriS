import { SpriteSheetKey, TextureKey } from "@data/TextureKey";

export type HexString = `#${string}`;

export type SupportedAttributeTypes =
    | WebGLRenderingContext["FLOAT"]
    | WebGLRenderingContext["FLOAT_VEC2"]
    | WebGLRenderingContext["FLOAT_VEC3"]
    | WebGLRenderingContext["FLOAT_VEC4"];

export interface ShaderAttribute {
    location: number;
    buffer: WebGLBuffer;
    size: number;
    type: SupportedAttributeTypes;
    normalized?: boolean;
    stride?: number;
    offset?: number;
}

export type ShaderAttributeRecord = Record<string, ShaderAttribute>;

export type SupportedUniformTypes =
    | WebGLRenderingContext["FLOAT"]
    | WebGLRenderingContext["FLOAT_VEC2"]
    | WebGLRenderingContext["FLOAT_VEC3"]
    | WebGLRenderingContext["FLOAT_VEC4"];

export interface ShaderUniform {
    type: SupportedUniformTypes;
}

export type ShaderUniformRecord = Record<string, ShaderUniform>;

export type UniformSetterRecord = Record<string, (...args: any[]) => void>;

export interface ShaderAttributeData<T> {
    size: number;
    data: T[];
}

export type ShaderAttributeDataRecord = Record<
    string,
    ShaderAttributeData<number>
>;

export type ShaderUniformDataRecord = Record<string, number[]>;

/**
 * Details of the sprite sheet that you want to load.
 */
export interface SpriteSheetDetails {
    id: SpriteSheetKey;
    src: string;
    width: number;
    height: number;
    spriteSize: {
        width: number;
        height: number;
    };
}

export interface ShaderTextureDetails {
    id: TextureKey;
    /**
     * A texture denoted with dimensions `[0, 0]` generally means the texture is dynamically generated.
     */
    dimensions: readonly [width: number, height: number];
}

export interface SpriteSheet {
    id: string;
    image: HTMLImageElement | null;
    spriteSize: {
        width: number;
        height: number;
    };
    loaded: boolean;
}

export interface DrawBuffers {
    /**
     * Entity transform (16 elements in buffer per rectangle in entity, `4x4 transform matrix * numRectangles`)
     */
    transform: number[];
    /**
     * Entity texture UV transform (16 elements in buffer per rectangle in entity, `4x4 transform matrix * numRectangles`)
     */
    transformUV: number[];
    /**
     * Entity texture key (1 element in buffer per rectangle in entity, `1 textureKey * numRectangles`)
     */
    textureKey: TextureKey[];
    /**
     * Entity hsva modifier (4 elements in buffer per rectangle in entity, `4 hsva * numRectangles`)
     */
    hsvaMod: number[];
}
