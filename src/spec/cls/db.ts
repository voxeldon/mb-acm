import { ScoreboardIdentityType, ScoreboardScoreInfo, world } from '@minecraft/server';
import { ScoreboardObjective, Scoreboard } from '@minecraft/server';
import { Database } from '..';

class SDB {
    private static scoreboard: Scoreboard = world.scoreboard;

    static newDb(objectiveId: string): boolean {
        try {
            this.scoreboard.addObjective(objectiveId);
            return true;
        } catch {
            return false;
        }
    }

    static removeDb(objectiveId: string): boolean {
        const db: Database = this.getDb(objectiveId);
        if (!db) return false;

        try {
            this.scoreboard.removeObjective(objectiveId);
            return true;
        } catch {
            return false;
        }
    }

    static getAllDb(): ScoreboardObjective[] {
        return this.scoreboard.getObjectives();
    }

    static getDb(objectiveId: string): Database {
        return this.scoreboard.getObjective(objectiveId);
    }

    static getDbElseNew(objectiveId: string): Database {
        let db: Database = this.getDb(objectiveId);
        if (!db) {
            const created = this.newDb(objectiveId);
            if (created) db = this.getDb(objectiveId);
        }
        return db as Database;
    }

    static setKey(objectiveId: string, keyId: string, value: number = 0): boolean {
        const db: Database = this.getDb(objectiveId);
        if (db) {
            db.setScore(keyId, value);
            return true;
        } else return false;
    }

    static addToKey(objectiveId: string, keyId: string, value: number = 0): boolean {
        const db: Database = this.getDb(objectiveId);
        if (db) {
            db.addScore(keyId, value);
            return true;
        } else return false;
    }

    static removeKey(objectiveId: string, keyId: string): boolean {
        const db: Database = this.getDb(objectiveId);
        if (db){
            db.removeParticipant(keyId);
            return true;
        } else return false;
    }

    static getKeyValue(objectiveId: string, keyId: string): number {
        try {
            const db: Database = this.getDb(objectiveId);
            const key = db?.getScore(keyId);
            if (key) return key;
        } catch (error) {};
        return 0;
    }

    static getAllKeys(objectiveId: string): ScoreboardScoreInfo[] {
        const result: ScoreboardScoreInfo[] = [];
        const objective: Database = this.getDb(objectiveId);
        if (objective) {
            const scores: ScoreboardScoreInfo[] = objective.getScores()
            if (scores) {
                for (const score of scores) {
                    if (score.participant.type === ScoreboardIdentityType.FakePlayer) {
                        result.push(score);
                    }
                }
            }
        }
        return result;
    }

    static newUUID(): number {
        const min: number = -2147483647;
        const max: number = 2147483647;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static setArray(dbID: string, key: string, array: any[]): boolean {
        try {
            const arrayString: string = JSON.stringify(array);
            let uuid: number;

            const existingUUID: number = this.getKeyValue(dbID, key);
            if (!existingUUID || existingUUID == 0) uuid = this.newUUID();
            else uuid = existingUUID

            this.removeKey(dbID, key);
            const allKeysWithSameUUID: ScoreboardScoreInfo[] = this.getAllKeys(dbID).filter(entry => entry.score === uuid);

            for (const entry of allKeysWithSameUUID) {
                this.removeKey(dbID, entry.participant.displayName);
            }
            this.setKey(dbID, key, uuid);
            this.setKey(dbID, arrayString, uuid);
            return true
        } catch (error) {console.warn(Error(`Error setting array @${dbID} | ${key} | ${error}`))}
        return false
    }

    static getArray(dbID: string, key: string):[] {
        const uuid: number = this.getKeyValue(dbID, key);
        if (uuid !== undefined) {
            const allKeys = this.getAllKeys(dbID);
            for (const entry of allKeys) {
                if (entry.score === uuid && entry.participant.displayName !== key) {
                    return JSON.parse(entry.participant.displayName);
                }
            }
        }
        return [];
    }

    static removeArray(dbID: string, key: string): boolean {
        const uuid: number = this.getKeyValue(dbID, key);
        if (uuid !== undefined) {
            const allKeysWithSameUUID = this.getAllKeys(dbID).filter(entry => entry.score === uuid);
            for (const entry of allKeysWithSameUUID) {
                this.removeKey(dbID, entry.participant.displayName);
            }
            return true
        } 
        return false   
    }
}

export { SDB };
