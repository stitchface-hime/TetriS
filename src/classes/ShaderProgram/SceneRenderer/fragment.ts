import { glsl } from "@utils/index";

export const fragment = glsl`
// Support up to 4 textures at once per draw
#define numTextures 4

precision mediump float;

uniform sampler2D u_tex[numTextures];

varying float v_textureIndex;
varying vec2 v_textureCoord;
varying vec4 v_hsvaMod;

// 1.0 if not equal, 0.0 otherwise
float isNotEqual(in float v1, in float v2) {
    return abs(sign(v1 - v2));
}

// 1.0 if equal, 0.0 otherwise
float isEqual(in float v1, in float v2) {
    return abs(isNotEqual(v1, v2) - 1.0);
}

// 1.0 if both conditions are 1.0, 0.0 otherwise
float and(in float c1, in float c2) {
    return c1 * c2;
}

vec4 rgbaToHsva(in vec4 rgba) {
    float value = max(rgba.r, max(rgba.g, rgba.b));
    float minValue = min(rgba.r, min(rgba.g, rgba.b));
    float chroma = value - minValue;

    float saturation = ceil(value) * (chroma / clamp(value, 0.01, 1.0));

    float valueEqualR = isEqual(value, rgba.r);
    float valueEqualG = isEqual(value, rgba.g);
    float valueEqualB = isEqual(value, rgba.b);

    float hue = mod((ceil(chroma) *
        60.0 * (
            isEqual(and(valueEqualR, and(isEqual(valueEqualG, 0.0), isEqual(valueEqualB, 0.0))), 1.0)
             * mod((rgba.g - rgba.b) / clamp(chroma, 0.01, 1.0), 6.0) +
            //
            isEqual(and(valueEqualG, isEqual(valueEqualB, 0.0)), 1.0)
             * ((rgba.b - rgba.r) / clamp(chroma, 0.01, 1.0) + 2.0) +
            //
            valueEqualB * ((rgba.r - rgba.g) / clamp(chroma, 0.01, 1.0) + 4.0)
        ) + 360.0), 360.0);
    
    return vec4(hue, saturation, value, rgba.a);
}

// Adapted from pg. 14 HSV TO RGB ALGORITHM (HEXCONE MODEL), 
// ACM SIGGRAPH Computer Graphics, Color Gamut Transform Pairs (1978), Smith, A. R. 
vec4 hsvaToRgba(in vec4 hsva) {
    float h = hsva.x / 60.0;
    float condition = floor(h);
    float f = h - condition;

    float m = hsva.z * (1.0 - hsva.y);
    float n = hsva.z * (1.0 - hsva.y * f);
    float k = hsva.z * (1.0 - hsva.y * (1.0 - f));
    
    return vec4(
        isEqual(condition, 0.0) * hsva.z +
        isEqual(condition, 1.0) * n +
        isEqual(condition, 2.0) * m +
        isEqual(condition, 3.0) * m +
        isEqual(condition, 4.0) * k +
        isEqual(condition, 5.0) * hsva.z,
        //
        isEqual(condition, 0.0) * k +
        isEqual(condition, 1.0) * hsva.z +
        isEqual(condition, 2.0) * hsva.z +
        isEqual(condition, 3.0) * n +
        isEqual(condition, 4.0) * m +
        isEqual(condition, 5.0) * m,
        //
        isEqual(condition, 0.0) * m +
        isEqual(condition, 1.0) * m +
        isEqual(condition, 2.0) * k +
        isEqual(condition, 3.0) * hsva.z +
        isEqual(condition, 4.0) * hsva.z +
        isEqual(condition, 5.0) * n,
        //
        hsva.a
    );
}

vec4 hsvaModifier(in vec4 color, in vec4 hsvaModifier) {
    vec4 hsva = rgbaToHsva(color);

    vec4 modifiedHsva = vec4(
        mod(hsva.x + hsvaModifier.x, 360.0),
        clamp(hsva.y + hsvaModifier.y, 0.0, 1.0),
        clamp(hsva.z + hsvaModifier.z, 0.0, 1.0),
        clamp(hsva.a + hsvaModifier.a, 0.0, 1.0)
    );

    return hsvaToRgba(modifiedHsva);
}

void main(void) {
    // if texture is out of bounds use purple color
    vec4 color = vec4(1.0, 0, 1.0, 1.0);
    
    // texture switching inspired by https://webglsamples.org/sprites/readme.html
    if (v_textureIndex == 0.0) color = texture2D(u_tex[0], v_textureCoord);
    if (v_textureIndex == 1.0) color = texture2D(u_tex[1], v_textureCoord);
    if (v_textureIndex == 2.0) color = texture2D(u_tex[2], v_textureCoord);
    if (v_textureIndex == 3.0) color = texture2D(u_tex[3], v_textureCoord);

    vec4 modColor = hsvaModifier(color, v_hsvaMod);

    gl_FragColor = modColor;
}

`;
