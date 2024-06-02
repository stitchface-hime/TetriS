import { glsl } from "@utils/index";

export const fragment = glsl`

precision mediump float;
varying vec4 v_color;

void main(void) {
    gl_FragColor = v_color;
}

`;
