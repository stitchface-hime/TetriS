import { glsl } from "@utils/index";

export const vertex = glsl`

precision mediump float;

attribute vec2 a_quadVert;
attribute mat4 a_transform;

attribute vec2 a_quadVertUV;
attribute mat4 a_transformUV;

attribute float a_textureIndex;

attribute vec4 a_hsvaMod;

uniform vec2 u_resolution;

varying float v_textureIndex;
varying vec2 v_textureCoord;
varying vec4 v_hsvaMod;
 
void main() {
    vec4 transformedQuad = a_transform * vec4(a_quadVert, 0, 1);

    // [0, 1]
    vec2 zeroToOne = vec2(transformedQuad.xy) / u_resolution;

    // [0, 2]
    vec2 zeroToTwo = zeroToOne * 2.0;

    vec2 clipSpace = zeroToTwo - 1.0;

    vec4 finalPosition = vec4(clipSpace, 0, 1);

    // [-1, 1]
    gl_Position = finalPosition;

    vec4 transformedUVQuad = a_transformUV * vec4(a_quadVertUV, 0, 1);


    v_textureCoord = vec2(transformedUVQuad.xy);
    v_textureIndex = a_textureIndex;
    v_hsvaMod = a_hsvaMod;
}
`;
