import { glsl } from "@utils/index";

export const vertex = glsl`

precision mediump float;
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform mat3 u_transform;
 
void main() {
    vec2 transformed = (u_transform * vec3(a_position.xy, 1)).xy;

    // [0, 1]
    vec2 zeroToOne = transformed / u_resolution;

    // [0, 2]
    vec2 zeroToTwo = zeroToOne * 2.0;

    vec2 clipSpace = zeroToTwo - 1.0;

    vec4 finalPosition = vec4(clipSpace * vec2(1, -1), 0, 1);

    // [-1, 1]
    gl_Position = finalPosition;
}

`;
