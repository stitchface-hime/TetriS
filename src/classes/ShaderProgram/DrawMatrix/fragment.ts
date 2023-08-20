import { glsl } from "@utils/index";

export const fragment = glsl`

precision mediump float;
varying vec4 v_gridColor;

void main(void) {
    gl_FragColor = v_gridColor;
}

`;
