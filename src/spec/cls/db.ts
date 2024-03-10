import { world } from '@minecraft/server';
import { ScoreboardObjective, Scoreboard } from '@minecraft/server';

type Database = ScoreboardObjective | undefined;
type Key = { key: string; value: number };

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
        const db = this.getDb(objectiveId);
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
        let db = this.getDb(objectiveId);
        if (!db) {
            const created = this.newDb(objectiveId);
            if (created) db = this.getDb(objectiveId);
        }
        return db;
    }

    static setKey(objectiveId: string, keyId: string, value: number = 0): boolean {
        const db = this.getDb(objectiveId);
        if (!db) return false;

        db.setScore(keyId, value);
        return true;
    }

    static addToKey(objectiveId: string, keyId: string, value: number = 0): boolean {
        const db = this.getDb(objectiveId);
        if (!db) return false;

        db.addScore(keyId, value);
        return true;
    }

    static removeKey(objectiveId: string, keyId: string): boolean {
        const db = this.getDb(objectiveId);
        if (!db) return false;

        db.removeParticipant(keyId);
        return true;
    }

    static getKeyValue(objectiveId: string, keyId: string): number | undefined {
        try {
            const db = this.getDb(objectiveId);
            const key = db?.getScore(keyId);
            if (key) return key;
        } catch (error) {
            return undefined;
        }  
    }

    static getAllKeys(dbID: string): Key[] {
        const participants = this.scoreboard.getParticipants(); 
        const result: Key[] = [];

        const db = this.getDb(dbID);
        if (!db) return result;

        for (const participant of participants) {
            const score = db.getScore(participant.displayName);
            if (score !== undefined) {
                result.push({ key: participant.displayName, value: score });
            }
        }

        return result;
    }

    static newUUID(): number {
        const min = -2147483647;
        const max = 2147483647;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static setArray(dbID: string, key: string, array: any[]): void {
        const arrayString = JSON.stringify(array);
        let uuid: number;

        const existingUUID = this.getKeyValue(dbID, key);
        uuid = existingUUID ?? this.newUUID();

        this.removeKey(dbID, key);
        const allKeysWithSameUUID = this.getAllKeys(dbID).filter(entry => entry.value === uuid);
        for (const entry of allKeysWithSameUUID) {
            this.removeKey(dbID, entry.key);
        }
        this.setKey(dbID, key, uuid);
        this.setKey(dbID, arrayString, uuid);
    }

    static getArray(dbID: string, key: string): any[] | null {
        const uuid = this.getKeyValue(dbID, key);
        if (uuid === null) {
            return null;
        }
        const allKeys = this.getAllKeys(dbID);
        for (const entry of allKeys) {
            if (entry.value === uuid && entry.key !== key) {
                return JSON.parse(entry.key);
            }
        }
        return null;
    }

    static removeArray(dbID: string, key: string): void {
        const uuid = this.getKeyValue(dbID, key);
        if (uuid === null) {
            return;
        }
        const allKeysWithSameUUID = this.getAllKeys(dbID).filter(entry => entry.value === uuid);
        for (const entry of allKeysWithSameUUID) {
            this.removeKey(dbID, entry.key);
        }
    }
}

export { SDB };
