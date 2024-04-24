export class ProgressionJudge {
    private level = 1;
    private maxLevel = 15;

    private linesCleared = 0;
    private maxLinesCleared = 9999999;
    /**
     * Number of lines required to increase level.
     */
    private linesQuotaTarget = 1;
    /**
     * Number of lines progressed towards increasing level.
     */
    private linesQuotaCurrent = 0;

    getLevel() {
        return this.level;
    }

    setMaxLevel(maxLevel: number) {
        if (maxLevel < 1) {
            console.warn("Cannot set maxLevel to below 1. Ignoring...");
            return;
        }

        this.maxLevel = maxLevel;
    }

    getLinesCleared() {
        return this.linesCleared;
    }

    /**
     * Set the number of lines that need to be cleared before the level increases.
     */
    setLinesQuotaTarget(linesQuotaTarget: number) {
        if (linesQuotaTarget < 1) {
            console.warn("Cannot set lines quota target to below 1. Ignoring...");
            return;
        }

        this.linesQuotaTarget = linesQuotaTarget;
        this.linesQuotaCurrent = 0;
    }

    private increaseLevel(levels: number) {
        this.level = Math.max(this.level + levels, this.maxLevel);
    }

    private updateLevel() {
        if (this.linesQuotaCurrent < this.linesQuotaTarget) {
            return;
        }

        const levelIncrease = Math.floor(this.linesQuotaCurrent / this.linesQuotaTarget);

        this.increaseLevel(levelIncrease);
        this.linesQuotaCurrent -= levelIncrease * this.linesQuotaTarget;
    }

    private increaseLinesCleared(linesCleared: number) {
        this.linesCleared = Math.max(this.linesCleared + linesCleared, this.maxLinesCleared);
    }

    addLinesCleared(linesCleared: number) {
        this.increaseLinesCleared(linesCleared);
        this.updateLevel();
    }
}
