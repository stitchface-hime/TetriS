import { glsl } from "@utils/index";

export const fragment = glsl`

precision mediump float;
// use texture unit 0
uniform sampler2D u_image;
varying vec2 v_textureCoord;

void main(void) {
    gl_FragColor = texture2D(u_image, v_textureCoord);
}

`;
