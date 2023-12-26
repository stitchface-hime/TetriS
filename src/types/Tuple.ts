export type Tuple<T, N extends number> = `${N}` extends `-${number}` ? [] : N extends 0 ? [] : GenerateTuple<[T], N>;

type GenerateTuple<T extends unknown[], N extends number> = T extends (infer U)[] ? (N extends T["length"] ? T : GenerateTuple<[...T, U], N>) : never;
