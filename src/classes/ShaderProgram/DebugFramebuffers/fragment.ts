import { glsl } from "@utils/index";

export const fragment = glsl`

precision mediump float;
varying vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

void main(void) {
    gl_FragColor = texture2D(u_texture, v_texcoord);
}

`;
