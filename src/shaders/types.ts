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

export type ShaderAttributeDataRecord = Record<string, ShaderAttributeData<number>>;

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
    positionBuffer: number[];
    textureCoordBuffer: number[];
    textureKeyBuffer: TextureKey[];
    kernelBuffer: number[];
}
