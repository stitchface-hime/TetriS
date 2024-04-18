import { glsl } from "@utils/index";

export const vertex = glsl`

precision mediump float;
attribute vec2 a_position;
attribute float a_textureIndex;
attribute vec2 a_textureCoord;
attribute vec4 a_hsvaMod;

uniform vec2 u_resolution;

varying float v_textureIndex;
varying vec2 v_textureCoord;
varying vec4 v_hsvaMod;
 
void main() {
    // [0, 1]
    vec2 zeroToOne = a_position / u_resolution;

    // [0, 2]
    vec2 zeroToTwo = zeroToOne * 2.0;

    vec2 clipSpace = zeroToTwo - 1.0;

    vec4 finalPosition = vec4(clipSpace, 0, 1);

    // [-1, 1]
    gl_Position = finalPosition;

    v_textureCoord = a_textureCoord;
    v_textureIndex = a_textureIndex;
    v_hsvaMod = a_hsvaMod;
}

`;
