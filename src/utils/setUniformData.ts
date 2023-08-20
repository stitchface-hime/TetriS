import {
    ShaderUniformDataRecord,
    UniformSetterRecord,
} from "src/shaders/types";

export const setUniformData = (
    setters: UniformSetterRecord,
    data: ShaderUniformDataRecord
) => {
    Object.entries(setters).forEach(([key, setter]) => {
        setter(data[key]);
    });
};
