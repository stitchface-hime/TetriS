import { ShaderProgram } from "../ShaderProgram";
import { getRectangleCoords } from "@utils/index";
import { vertex } from "./vertex";
import { fragment } from "./fragment";

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
    offset: [x: number, y: number];
    coords: [x: number, y: number];
}

interface DrawArgs {
    sheetId: string;
    drawData: DrawData[];
}

export class DrawSprite extends ShaderProgram {
    private spriteSheets: Record<string, SpriteSheetImage> = {};

    constructor(id: string, gl: WebGLRenderingContext) {
        super(id, vertex, fragment, gl);
    }

    /**
     * Loads a sprite sheet given its source.
     * @param src source of the sprite sheet.
     * @param sheetId an id used to identify the loaded sprite sheet later.
     * @param spriteSize the size of each individual sprite.
     */
    load({ id: sheetId, src, spriteSize }: SpriteSheetLoadData) {
        this.spriteSheets[sheetId] = {
            id: sheetId,
            src,
            image: null,
            loaded: false,
            spriteSize,
        };
        const image = new Image();
        image.src = src;

        const promise = new Promise<void>((resolve) => {
            image.onload = () => {
                this.spriteSheets[sheetId].loaded = true;
                this.spriteSheets[sheetId].image = image;

                resolve();
            };
        });

        return promise;
    }

    loadMultiple(sheetsData: SpriteSheetLoadData[]) {
        sheetsData.forEach((data) => this.load(data));
    }

    unload(sheetId: string) {
        if (this.spriteSheets[sheetId]) {
            delete this.spriteSheets[sheetId];
        } else {
            console.warn("Sprite sheet not present, no operation occurred.");
        }
    }

    private drawSprite(drawData: DrawData, sheet: SpriteSheetImage) {
        const { spriteSize, image, loaded } = sheet;
        const gl = this.gl;
        const program = this.program;
        const canvas = this.gl.canvas as HTMLCanvasElement;

        this.resizeCanvas();
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        if (program && image && loaded) {
            gl.useProgram(program);

            const positionLocation = gl.getAttribLocation(
                program,
                "a_position"
            );
            const textureCoordLocation = gl.getAttribLocation(
                program,
                "a_textureCoord"
            );
            const resolutionLocation = gl.getUniformLocation(
                program,
                "u_resolution"
            );

            const positionBuffer = gl.createBuffer();
            const textureCoordBuffer = gl.createBuffer();

            const drawCoord = getRectangleCoords(
                drawData.coords[0],
                drawData.coords[1],
                // temp - need to also consider the size of the sprite being drawn here
                spriteSize.width,
                spriteSize.height
            );

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(drawCoord),
                gl.STATIC_DRAW
            );

            // not final - this renders the entire sprite sheet for now, need to use the offset
            gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                // prettier-ignore
                new Float32Array([
                    0.0, 0.0, 
                    0.0, 1.0, 
                    1.0, 0.0, 
                    0.0, 1.0,
                    1.0, 1.0,
                    1.0, 0.0
                ]),
                gl.STATIC_DRAW
            );

            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_S,
                gl.CLAMP_TO_EDGE
            );
            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_WRAP_T,
                gl.CLAMP_TO_EDGE
            );
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image
            );

            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(textureCoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
            gl.vertexAttribPointer(
                textureCoordLocation,
                2,
                gl.FLOAT,
                false,
                0,
                0
            );

            gl.uniform2f(
                resolutionLocation,
                canvas.clientWidth,
                canvas.clientHeight
            );

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }

    drawFromSheet({ sheetId, drawData }: DrawArgs) {
        const selectedSheet = this.spriteSheets[sheetId];

        if (selectedSheet) {
            drawData.forEach((data) => {
                this.drawSprite(data, selectedSheet);
            });
        }
    }

    draw(sheets: DrawArgs[]) {
        sheets.forEach((sheet) => this.drawFromSheet(sheet));
    }
}
