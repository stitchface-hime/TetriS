import { ShaderProgramError } from "@classes/Error";
import { ShaderAttribute, SupportedAttributeTypes } from "src/shaders/types";

/**
 * Declares a shader attribute for a WebGL program.
 */
export const declareShaderAttribute = (
    details: {
        name: string;
        size: number;
        type: SupportedAttributeTypes;
        normalized?: boolean;
        stride?: number;
        offset?: number;
    },
    program: WebGLProgram,
    gl: WebGLRenderingContext
): ShaderAttribute => {
    const { name, ...rest } = details;
    const buffer = gl.createBuffer();

    if (buffer) {
        return {
            location: gl.getAttribLocation(program, name),
            buffer,
            ...rest,
        };
    }

    throw new Error("Unable to create new attribute data.");
};
