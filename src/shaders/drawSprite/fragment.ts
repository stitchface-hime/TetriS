import { glsl } from "@utils/index";

export const fragment = glsl`

precision mediump float;
uniform vec3 u_color;

void main(void) {
    gl_FragColor = vec4(u_color.r, u_color.g, u_color.b, 1.0);
}

`;
