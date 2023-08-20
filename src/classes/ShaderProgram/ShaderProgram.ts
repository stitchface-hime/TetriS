import { ShaderProgramError } from "@classes/Error";

export abstract class ShaderProgram {
    protected id: string;

    private vertexSrc: string;
    private fragmentSrc: string;

    private vertexShader: WebGLShader | null = null;
    private fragmentShader: WebGLShader | null = null;

    protected gl: WebGLRenderingContext;
    protected program: WebGLProgram | null = null;

    constructor(
        id: string,
        vertexSrc: string,
        fragmentSrc: string,
        gl: WebGLRenderingContext,
        autoBuild = true
    ) {
        this.id = id;
        this.vertexSrc = vertexSrc;
        this.fragmentSrc = fragmentSrc;
        this.gl = gl;

        if (autoBuild) {
            this.build();
        }
    }

    private compileShader(
        src: string,
        type:
            | WebGLRenderingContext["FRAGMENT_SHADER"]
            | WebGLRenderingContext["VERTEX_SHADER"]
    ) {
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
                    `Failed to compile shader of type ${type}. ${this.gl.getShaderInfoLog(
                        shader
                    )}`
                );
            }
        } else {
            throw new ShaderProgramError(
                this.id,
                `Failed to create shader of type ${type}.`
            );
        }

        return shader;
    }

    private compileVertexShader() {
        this.vertexShader = this.compileShader(
            this.vertexSrc,
            this.gl.VERTEX_SHADER
        );
    }

    private compileFragmentShader() {
        this.fragmentShader = this.compileShader(
            this.fragmentSrc,
            this.gl.FRAGMENT_SHADER
        );
    }

    private compileProgram() {
        const program = this.gl.createProgram();

        if (program) {
            if (this.vertexShader && this.fragmentShader) {
                this.gl.attachShader(program, this.vertexShader);
                console.log("OK");
                this.gl.attachShader(program, this.fragmentShader);
                console.log("OK");

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
                throw new Error();
            }
        } else {
            throw new Error();
        }
    }

    protected resizeCanvas() {
        const canvas = this.gl.canvas as HTMLCanvasElement;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        canvas.width = width;
        canvas.height = height;
    }

    /**
     * Build the program, by compiling all the shaders and linking it into a program.
     * By default, the `ShaderProgram` will automatically build on instantiation so you won't need to call this.
     */
    build() {
        this.compileVertexShader();
        console.log("Vertex OK");
        this.compileFragmentShader();
        console.log("Fragment OK");
        this.compileProgram();
    }

    getId() {
        return this.id;
    }

    getProgram() {
        return this.program;
    }

    abstract draw(): void;
}
