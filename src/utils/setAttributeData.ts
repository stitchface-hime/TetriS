import {
    ShaderAttributeDataRecord,
    ShaderAttributeRecord,
} from "src/shaders/types";

export const setAttributeData = (
    attributes: ShaderAttributeRecord,
    attributesData: ShaderAttributeDataRecord,
    gl: WebGLRenderingContext
) => {
    Object.entries(attributes).forEach(([key, attribute]) => {
        console.log("key:", key, attribute, attributesData);
        gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(attributesData[key].data),
            gl.STATIC_DRAW
        );
        gl.enableVertexAttribArray(attribute.location);
        gl.vertexAttribPointer(
            attribute.location,
            attribute.size,
            gl.FLOAT,
            !!attribute.normalized,
            attribute.stride || 0,
            attribute.offset || 0
        );
    });
};
