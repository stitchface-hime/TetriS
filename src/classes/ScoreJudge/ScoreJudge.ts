import { DropType } from "./ScoreJudge.helpers";

type TechnicalMove = "mini" | "full" | null;

export class ScoreJudge {
    private score = 0;
    private b2bCombo = -1;
    private combo = -1;

    private b2bMultiplier = 1.5;
    private maxScore = 999999999999;

    getScore() {
        return this.score;
    }

    getCombo() {
        return this.combo;
    }

    getB2bCombo() {
        return this.b2bCombo;
    }

    private getComboPoints() {
        return Math.max(this.combo * 50, 0);
    }

    private getPerfectClearPoints(linesCleared: number, perfectClear: boolean) {
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

    private getLineClearPoints(linesCleared: number, technicalMove: TechnicalMove, perfectClear: boolean) {
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

    private getB2bMultiplier() {
        return this.b2bCombo > 0 ? this.b2bMultiplier : 1;
    }

    private updateCombo(linesCleared: number) {
        this.combo = linesCleared > 0 ? this.combo + 1 : -1;
    }

    private updateB2bCombo(linesCleared: number, technicalMove: TechnicalMove) {
        this.b2bCombo = linesCleared > 3 || technicalMove !== null ? this.b2bCombo + 1 : -1;
    }

    private increaseScore(points: number) {
        this.score = Math.min(this.score + points, this.maxScore);
    }

    addScoreByLock(level: number, linesCleared: number, technicalMove: TechnicalMove, perfectClear: boolean) {
        this.updateCombo(linesCleared);
        if (linesCleared > 0) {
            this.updateB2bCombo(linesCleared, technicalMove);
        }

        this.increaseScore((this.getLineClearPoints(linesCleared, technicalMove, perfectClear) * this.getB2bMultiplier() + this.getComboPoints()) * level);
    }

    addScoreByDrop(units: number, type: DropType) {
        this.increaseScore(units * type);
    }
}
