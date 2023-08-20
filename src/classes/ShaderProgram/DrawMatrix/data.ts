import { getRectangleCoords } from "@utils/getRectangleCoords";

const generateColumnLines = (
    columns: number,
    borderWidth: number,
    matrixWidth: number,
    matrixHeight: number
) => {
    const columnLines: number[] = [];

    const spacing = (matrixWidth - (columns + 1) * borderWidth) / columns;

    let currentDist = 0;

    for (let i = 0; i < columns + 1; i++) {
        columnLines.push(
            ...getRectangleCoords(currentDist, 0, borderWidth, matrixHeight)
        );
        currentDist += borderWidth + spacing;
    }

    return columnLines;
};

const generateRowLines = (
    rows: number,
    borderWidth: number,
    matrixWidth: number,
    matrixHeight: number
) => {
    const rowLines: number[] = [];

    const spacing = (matrixHeight - (rows + 1) * borderWidth) / rows;

    let currentDist = 0;

    for (let i = 0; i < rows + 1; i++) {
        rowLines.push(
            ...getRectangleCoords(currentDist, 0, matrixWidth, borderWidth)
        );
        currentDist += borderWidth + spacing;
    }

    return rowLines;
};

export const generateGrid = (
    rows: number,
    columns: number,
    borderWidth: number,
    matrixWidth: number,
    matrixHeight: number
): number[] => {
    if (rows && columns) {
        return [
            ...generateColumnLines(
                columns,
                borderWidth,
                matrixWidth,
                matrixHeight
            ),
            ...generateRowLines(rows, borderWidth, matrixWidth, matrixHeight),
        ];
    }

    return [];
};
