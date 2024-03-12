import { glsl } from "@utils/index";

export const vertex = glsl`

precision mediump float;
attribute vec2 a_position;
attribute vec2 a_textureCoord;

uniform vec2 u_resolution;

varying vec2 v_textureCoord;
 
void main() {
    // [0, 1]
    vec2 zeroToOne = a_position / u_resolution;

    // [0, 2]
    vec2 zeroToTwo = zeroToOne * 2.0;

    vec2 clipSpace = zeroToTwo - 1.0;

    // flip into y-axis to correct the sprite to face upright
    vec4 finalPosition = vec4(clipSpace.x, - clipSpace.y, 0, 1);

    // [-1, 1]
    gl_Position = finalPosition;

    v_textureCoord = a_textureCoord;
}

`;
