export class ShaderProgramError extends Error {
    constructor(programId: string, message: string) {
        super(`Program ${programId} - ${message}`);
        this.name = "ShaderProgramError";
    }
}
