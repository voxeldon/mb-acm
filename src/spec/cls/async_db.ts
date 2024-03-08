import { world } from '@minecraft/server';
import { Scoreboard, ScoreboardObjective } from '@minecraft/server';

class ADB {
    private scoreboard: Scoreboard;

    constructor() {
        this.scoreboard = world.scoreboard;
    }

    async newUUID(): Promise<number> {
        return new Promise((resolve) => {
            const min = -2147483647;
            const max = 2147483647;
            resolve(Math.floor(Math.random() * (max - min + 1)) + min);
        });
    }

    async newDB(dbID: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.scoreboard.getObjective(dbID)) resolve();
            this.scoreboard.addObjective(dbID, dbID);
            resolve();
        });
    }

    async removeDB(dbID: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.scoreboard.getObjective(dbID)) resolve();
            this.scoreboard.removeObjective(dbID);
            resolve();
        });
    }

    async verifyDatabase(dbID: string): Promise<ScoreboardObjective> {
        return new Promise((resolve, reject) => {
            let objective = this.scoreboard.getObjective(dbID);
            if (!objective) {
                this.newDB(dbID);
                objective = this.scoreboard.getObjective(dbID);
                if (!objective) {
                    reject(new Error(`Failed to verify or create the database with ID: ${dbID}`));
                    return; 
                }
            }
            resolve(objective);
        });
    }
    

    async addToKey(dbID: string, key: string, number: number): Promise<void> {
        const objective = await this.verifyDatabase(dbID);
        objective.addScore(key, number);
    }

    async setKey(dbID: string, key: string, number: number): Promise<void> {
        const objective = await this.verifyDatabase(dbID);
        objective.setScore(key, number);
    }

    async removeKey(dbID: string, key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let objective = this.scoreboard.getObjective(dbID);
            if (!objective) resolve();
            if (!objective) throw new Error(`Objective not found for dbID: ${dbID}`);
            objective.removeParticipant(key);
            resolve();
        });
    }

    async getDB(dbID: string): Promise<ScoreboardObjective | undefined> {
        return new Promise((resolve) => {
            resolve(this.scoreboard.getObjective(dbID));
        });
    }

    async getAllDB(): Promise<ScoreboardObjective[] | undefined> {
        return new Promise((resolve) => {
            resolve(this.scoreboard.getObjectives());
        });
    }

    async getKeyValue(dbID: string, key: string): Promise<number | undefined> {
        const objective = await this.getDB(dbID); 
        if (!objective) return undefined;
    
        try {
            const score = objective.getScore(key);
            return score;
        } catch (error) {
            return undefined;
        }
    }
    

    async getKey(dbID: string, key: string): Promise<{ key: string; value: number } | undefined> {
        const allKeys = await this.getAllKeys(dbID);
        return allKeys.find(entry => entry.key === key);
    }

    async getAllKeys(dbID: string): Promise<{ key: string; value: number }[]> {
        const participants = this.scoreboard.getParticipants();
        const result: { key: string; value: number }[] = [];
        const db = await this.getDB(dbID); 
    
        if (!db) {
            return result;
        }
    
        for (const participant of participants) {
            try {
                const score = db.getScore(participant.displayName);
                if (score !== undefined) {
                    result.push({
                        key: participant.displayName,
                        value: score
                    });
                }
            } catch (error) {}
        }
    
        return result;
    }    

    async setArray(dbID: string, key: string, array: any[]): Promise<void> {
        const arrayString = JSON.stringify(array);
        let uuid: number;

        const existingUUID = await this.getKeyValue(dbID, key);
        uuid = existingUUID ?? await this.newUUID();

        await this.removeKey(dbID, key);
        const allKeysWithSameUUID = await this.getAllKeys(dbID);
        allKeysWithSameUUID.filter(entry => entry.value === uuid).forEach(async (entry) => {
            await this.removeKey(dbID, entry.key);
        });
        await this.setKey(dbID, key, uuid);
        await this.setKey(dbID, arrayString, uuid);
    }

    async getArray(dbID: string, key: string): Promise<any[] | null> {
        const uuid = await this.getKeyValue(dbID, key);
        if (uuid === null) {
            return null;
        }
        const allKeys = await this.getAllKeys(dbID);
        for (const entry of allKeys) {
            if (entry.value === uuid && entry.key !== key) {
                return JSON.parse(entry.key);
            }
        }
        return null;
    }

    async removeArray(dbID: string, key: string): Promise<void> {
        const uuid = await this.getKeyValue(dbID, key);
        if (uuid === null) {
            return;
        }
        const allKeysWithSameUUID = await this.getAllKeys(dbID);
        allKeysWithSameUUID.filter(entry => entry.value === uuid).forEach(async (entry) => {
            await this.removeKey(dbID, entry.key);
        });
    }
}

export { ADB };
