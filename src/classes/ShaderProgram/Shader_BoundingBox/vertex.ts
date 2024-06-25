import { glsl } from "@utils/index";

export const vertex = glsl`

precision mediump float;
attribute vec2 a_position;
attribute vec4 a_color;

uniform vec2 u_resolution;

varying vec4 v_color;
 
void main() {
    // [0, 1]
    vec2 zeroToOne = a_position / u_resolution;

    // [0, 2]
    vec2 zeroToTwo = zeroToOne * 2.0;

    vec2 clipSpace = zeroToTwo - 1.0;

    vec4 finalPosition = vec4(clipSpace, 0, 1);

    // [-1, 1]
    gl_Position = finalPosition;

    v_color = a_color;
}

`;
