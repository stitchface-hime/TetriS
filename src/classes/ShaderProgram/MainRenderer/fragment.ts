import { glsl } from "@utils/index";

export const fragment = glsl`
// Support up to 4 textures at once per draw
#define numTextures 4

precision mediump float;

uniform sampler2D u_tex[numTextures];

varying float v_textureIndex;
varying vec2 v_textureCoord;
varying float v_kernel[9];

void main(void) {
    // if texture is out of bounds use purple color
    vec4 color = vec4(1.0, 0, 1.0, 1.0);
    
    // texture switching inspired by https://webglsamples.org/sprites/readme.html
    if (v_textureIndex == 0.0) color = texture2D(u_tex[0], v_textureCoord);
    if (v_textureIndex == 1.0) color = texture2D(u_tex[1], v_textureCoord);
    if (v_textureIndex == 2.0) color = texture2D(u_tex[2], v_textureCoord);
    if (v_textureIndex == 3.0) color = texture2D(u_tex[3], v_textureCoord);

    // kernel convulution
    

    gl_FragColor = color;
}

`;
