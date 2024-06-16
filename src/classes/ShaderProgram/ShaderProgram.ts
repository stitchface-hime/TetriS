import { ShaderProgramError } from "@classes/Error";

// TODO: Ought to split shader program into two types
// one that renders to texture and one that renders directly to canvas
export abstract class ShaderProgram {
    private id = "shader-program";
    private vertexSrc: string;
    private fragmentSrc: string;

    private vertexShader: WebGLShader | null = null;
    private fragmentShader: WebGLShader | null = null;

    protected _gl: WebGLRenderingContext;
    protected program: WebGLProgram | null = null;

    constructor(
        vertexSrc: string,
        fragmentSrc: string,
        gl: WebGLRenderingContext,
        autoBuild = true
    ) {
        this.vertexSrc = vertexSrc;
        this.fragmentSrc = fragmentSrc;
        this._gl = gl;

        if (autoBuild && gl) {
            this.build();
        }
    }

    get gl() {
        return this._gl;
    }

    set gl(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    private compileShader(
        src: string,
        type:
            | WebGLRenderingContext["FRAGMENT_SHADER"]
            | WebGLRenderingContext["VERTEX_SHADER"]
    ) {
        if (this.gl) {
            const shader = this.gl.createShader(type);
            if (shader) {
                this.gl.shaderSource(shader, src);
                this.gl.compileShader(shader);

                const ok = this.gl.getShaderParameter(
                    shader,
                    this.gl.COMPILE_STATUS
                );

                if (!ok) {
                    throw new ShaderProgramError(
                        this.id,
                        `Failed to compile shader of type ${type} (${
                            type === this.gl.FRAGMENT_SHADER
                                ? "fragment"
                                : "vertex"
                        }). ${this.gl.getShaderInfoLog(shader)}`
                    );
                }
                return shader;
            } else {
                throw new ShaderProgramError(
                    this.id,
                    `Failed to create shader of type ${type} (${
                        type === this.gl.FRAGMENT_SHADER ? "fragment" : "vertex"
                    }).`
                );
            }
        } else {
            throw new ShaderProgramError(
                this.id,
                `Could not compile shader, no WebGL context.`
            );
        }
    }

    private compileVertexShader() {
        if (this.gl) {
            this.vertexShader = this.compileShader(
                this.vertexSrc,
                this.gl.VERTEX_SHADER
            );
        }
    }

    private compileFragmentShader() {
        if (this.gl) {
            this.fragmentShader = this.compileShader(
                this.fragmentSrc,
                this.gl.FRAGMENT_SHADER
            );
        }
    }

    private compileProgram() {
        if (this.gl) {
            const program = this.gl.createProgram();

            if (program) {
                if (this.vertexShader && this.fragmentShader) {
                    this.gl.attachShader(program, this.vertexShader);
                    this.gl.attachShader(program, this.fragmentShader);

                    this.gl.linkProgram(program);
                    const ok = this.gl.getProgramParameter(
                        program,
                        this.gl.LINK_STATUS
                    );

                    if (!ok) {
                        throw new ShaderProgramError(
                            this.id,
                            `Failed to compile program.`
                        );
                    }

                    this.program = program;
                } else {
                    throw new ShaderProgramError(
                        this.id,
                        `Failed to compile program, shaders incomplete.`
                    );
                }
            } else {
                throw new ShaderProgramError(
                    this.id,
                    `Failed to create program.`
                );
            }
        }
    }

    protected resizeCanvas() {
        if (this.gl) {
            const canvas = this.gl.canvas as HTMLCanvasElement;

            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            canvas.width = width;
            canvas.height = height;
        }
    }

    /**
     * Build the program, by compiling all the shaders and linking it into a program.
     * By default, the `ShaderProgram` will automatically build on instantiation so you won't need to call this.
     */
    build() {
        this.compileVertexShader();
        this.compileFragmentShader();

        this.compileProgram();
    }

    getProgram() {
        return this.program;
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
