import { getRectangleCoords } from "@utils/getRectangleCoords";

const generateColumnLines = (
    columns: number,
    borderWidth: number,
    matrixWidth: number,
    matrixHeight: number
) => {
    const columnLines: number[][] = [];

    const spacing = (matrixWidth - columns * borderWidth * 2) / columns;
    let currentDist = 0;

    for (let i = 0; i < columns + 1; i++) {
        const lineWidth = borderWidth * (i === 0 || i === columns ? 1 : 2);
        columnLines.push(
            getRectangleCoords(currentDist, 0, lineWidth, matrixHeight)
        );
        currentDist += lineWidth + spacing;
    }

    return columnLines;
};

const generateRowLines = (
    rows: number,
    borderWidth: number,
    matrixWidth: number,
    matrixHeight: number
) => {
    const rowLines: number[][] = [];

    const spacing = (matrixHeight - rows * borderWidth * 2) / rows;

    let currentDist = 0;

    for (let i = 0; i < rows + 1; i++) {
        const lineWidth = borderWidth * (i === 0 || i === rows ? 1 : 2);
        rowLines.push(
            getRectangleCoords(0, currentDist, matrixWidth, lineWidth)
        );
        currentDist += lineWidth + spacing;
    }

    return rowLines;
};

export const generateGrid = (
    rows: number,
    columns: number,
    borderWidth: number,
    matrixWidth: number,
    matrixHeight: number
): number[][] => {
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
