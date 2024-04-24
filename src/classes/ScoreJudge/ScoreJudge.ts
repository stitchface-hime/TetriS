import { DropType } from "./ScoreJudge.helpers";

type TechnicalMove = "mini" | "full" | null;

export class ScoreJudge {
    private score = 0;
    private b2bCombo = -1;
    private combo = 0;

    private b2bMultiplier = 1.5;
    private maxScore = 999999999999;

    getComboPoints() {
        return this.combo * 50;
    }

    getPerfectClearPoints(linesCleared: number, perfectClear: boolean) {
        if (!perfectClear) return 0;

        switch (linesCleared) {
            case 1:
                return 800;
            case 2:
                return 1000;
            case 3:
                return 1800;
            case 4:
            default:
                return 2000;
        }
    }

    getLineClearPoints(linesCleared: number, technicalMove: TechnicalMove, perfectClear: boolean) {
        let basePoints = technicalMove === "mini" ? 100 : 0;

        if (linesCleared === 0) return basePoints;

        switch (linesCleared) {
            case 1:
                basePoints += technicalMove === "full" ? 800 : 100;
                break;
            case 2:
                basePoints += technicalMove === "full" ? 1200 : 300;
                break;
            case 3:
                basePoints += technicalMove === "full" ? 1600 : 500;
                break;
            case 4:
            default:
                basePoints += 800;
        }

        return basePoints + this.getPerfectClearPoints(linesCleared, perfectClear);
    }

    getB2bMultipler() {
        return this.b2bCombo > 0 ? this.b2bMultiplier : 1;
    }

    updateCombo(linesCleared: number) {
        this.combo = linesCleared > 0 ? this.combo + 1 : 0;
    }

    updateB2bCombo(linesCleared: number, technicalMove: TechnicalMove) {
        this.b2bCombo = linesCleared > 3 || technicalMove !== null ? this.b2bCombo + 1 : 0;
    }

    increaseScore(points: number) {
        this.score = Math.max(this.score + points, this.maxScore);
    }

    addScoreByLock(level: number, linesCleared: number, technicalMove: TechnicalMove, perfectClear: boolean) {
        this.increaseScore((this.getLineClearPoints(linesCleared, technicalMove, perfectClear) + this.getComboPoints()) * this.getB2bMultipler() * level);
        this.updateCombo(linesCleared);
        this.updateB2bCombo(linesCleared, technicalMove);
    }

    addScoreByDrop(units: number, type: DropType) {
        this.increaseScore(units * type);
    }
}
