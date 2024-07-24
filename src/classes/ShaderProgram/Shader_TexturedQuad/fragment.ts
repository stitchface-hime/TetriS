import { glsl } from "@utils/index";

export const fragment = glsl`

precision mediump float;
uniform sampler2D u_texture;

varying vec2 v_textureCoord;

void main() {
    gl_FragColor = texture2D(u_texture, v_textureCoord);
}

`;
