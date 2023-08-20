import {
    ShaderUniform,
    ShaderUniformDataRecord,
    ShaderUniformRecord,
    SupportedUniformTypes,
    UniformSetterRecord,
} from "src/shaders/types";

export const getUniformSetters = (
    uniforms: ShaderUniformRecord,
    program: WebGLProgram,
    gl: WebGLRenderingContext
): UniformSetterRecord => {
    const setterBases = {
        [WebGLRenderingContext.FLOAT]:
            (location: WebGLUniformLocation, gl: WebGLRenderingContext) =>
            (val: number) =>
                gl.uniform1f(location, val),
        [WebGLRenderingContext.FLOAT_VEC2]:
            (location: WebGLUniformLocation, gl: WebGLRenderingContext) =>
            (val1: number, val2: number) =>
                gl.uniform2f(location, val1, val2),
        [WebGLRenderingContext.FLOAT_VEC3]:
            (location: WebGLUniformLocation, gl: WebGLRenderingContext) =>
            (val1: number, val2: number, val3: number) =>
                gl.uniform3f(location, val1, val2, val3),
        [WebGLRenderingContext.FLOAT_VEC4]:
            (location: WebGLUniformLocation, gl: WebGLRenderingContext) =>
            (val1: number, val2: number, val3: number, val4: number) =>
                gl.uniform4f(location, val1, val2, val3, val4),
    };

    const setters: Record<string, (...args: any[]) => void> = {};

    Object.entries(uniforms).forEach(([key, { type }]) => {
        const location = gl.getUniformLocation(program, key);
        if (location) {
            setters[key] = setterBases[type](location, gl);
        }
    });

    return setters;
};
