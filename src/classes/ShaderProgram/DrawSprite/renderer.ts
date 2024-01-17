import { ShaderProgram } from "../ShaderProgram";
import { getRectangleCoords } from "@utils/index";
import { vertex } from "./vertex";
import { fragment } from "./fragment";
import { SpriteSheet, SpriteSheetDetails } from "src/shaders/types";
import { SpriteLoader } from "@classes/SpriteLoader";
import { SpritedEntity } from "@classes/SpritedEntity";

interface SpriteSheetImage extends SpriteSheetLoadData {
    image: HTMLImageElement | null;
    loaded: boolean;
}

interface SpriteSheetLoadData {
    id: string;
    src: string;
    spriteSize: {
        width: number;
        height: number;
    };
}

interface DrawData {
    /**
     * The texture coordinates that make up the sprite quad that you want to render from the sheet.
     */
    textureCoordinates: number[];
    /**
     * The coordinates of the bottom-left of the entity when it appears on screen.
     */
    anchor: [x: number, y: number];
    /**
     *
     */
    scale: [x: number, y: number];
}

interface DrawArgs {
    spriteSheet: SpriteSheet;
    drawData: DrawData[];
}

export class DrawSprite extends ShaderProgram {
    private spriteLoader: SpriteLoader;

    constructor(gl: WebGLRenderingContext, spriteLoader: SpriteLoader) {
        super(vertex, fragment, gl);
        this.spriteLoader = spriteLoader;
    }

    async draw(entity: SpritedEntity, textureCoordinates: number[], spriteSheetDetails: SpriteSheetDetails, destFb: WebGLFramebuffer | null) {
        const sheet = await this.spriteLoader.load(spriteSheetDetails);
        const gl = this.gl;
        if (gl) {
            const { image, loaded } = sheet;
            const program = this.program;
            const dimensions = entity.getDimensions();

            // gl.bindFramebuffer(gl.FRAMEBUFFER, destFb);
            this.resizeCanvas();
            gl.viewport(0, 0, ...dimensions);

            if (program && image && loaded) {
                gl.useProgram(program);

                const positionLocation = gl.getAttribLocation(program, "a_position");
                const textureCoordLocation = gl.getAttribLocation(program, "a_textureCoord");
                const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

                const positionBuffer = gl.createBuffer();
                const textureCoordBuffer = gl.createBuffer();

                const drawCoord = getRectangleCoords(
                    0,
                    0,
                    // temp - need to also consider the size of the sprite being drawn here
                    ...dimensions
                );

                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawCoord), gl.STATIC_DRAW);

                // not final - this renders the entire sprite sheet for now, need to use the offset
                gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    // prettier-ignore
                    new Float32Array(textureCoordinates),
                    gl.STATIC_DRAW
                );

                var texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                gl.enableVertexAttribArray(positionLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

                gl.enableVertexAttribArray(textureCoordLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
                gl.vertexAttribPointer(textureCoordLocation, 2, gl.FLOAT, false, 0, 0);

                gl.uniform2f(resolutionLocation, ...dimensions);

                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
        }
    }
}
