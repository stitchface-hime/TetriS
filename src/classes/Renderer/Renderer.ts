/**
 * Class used to render to textures from one or more programs.
 */
export abstract class Renderer {
    private _gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    get gl() {
        return this._gl;
    }

    protected resizeCanvas() {
        if (this.gl) {
            const canvas = this.gl.canvas as HTMLCanvasElement;

            const width = document.documentElement.clientWidth;
            const height = document.documentElement.clientHeight;

            if (canvas.width != width || canvas.height != height) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        }
    }

    /**
     * Draw to a specified texture.
     */
    abstract draw(destTexture: WebGLTexture | null, ...args: any[]): void;

    // Debug functions

    protected arrayBufferToBase64(array: Uint8Array) {
        var binary = "";
        var len = array.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(array[i]);
        }
        return window.btoa(binary);
    }

    protected debugTexture(gl: WebGLRenderingContext, texture: WebGLTexture) {
        var framebuffer = this.gl.createFramebuffer();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            texture,
            0
        );
        if (gl) {
            const canvas = gl.canvas as HTMLCanvasElement;

            let data = new Uint8Array(
                canvas.clientWidth * canvas.clientHeight * 4
            );
            gl.readPixels(
                0,
                0,
                canvas.clientWidth,
                canvas.clientHeight,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                data
            );
            return data;
        }
    }
}
