import { ScoreboardIdentityType, world } from '@minecraft/server';
class SDB {
    static newDb(objectiveId) {
        try {
            this.scoreboard.addObjective(objectiveId);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    static removeDb(objectiveId) {
        const db = this.getDb(objectiveId);
        if (!db)
            return false;
        try {
            this.scoreboard.removeObjective(objectiveId);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    static getAllDb() {
        return this.scoreboard.getObjectives();
    }
    static getDb(objectiveId) {
        return this.scoreboard.getObjective(objectiveId);
    }
    static getDbElseNew(objectiveId) {
        let db = this.getDb(objectiveId);
        if (!db) {
            const created = this.newDb(objectiveId);
            if (created)
                db = this.getDb(objectiveId);
        }
        return db;
    }
    static setKey(objectiveId, keyId, value = 0) {
        const db = this.getDb(objectiveId);
        if (db) {
            db.setScore(keyId, value);
            return true;
        }
        else
            return false;
    }
    static addToKey(objectiveId, keyId, value = 0) {
        const db = this.getDb(objectiveId);
        if (db) {
            db.addScore(keyId, value);
            return true;
        }
        else
            return false;
    }
    static removeKey(objectiveId, keyId) {
        const db = this.getDb(objectiveId);
        if (db) {
            db.removeParticipant(keyId);
            return true;
        }
        else
            return false;
    }
    static getKeyValue(objectiveId, keyId) {
        try {
            const db = this.getDb(objectiveId);
            const key = db === null || db === void 0 ? void 0 : db.getScore(keyId);
            if (key)
                return key;
        }
        catch (error) { }
        ;
        return 0;
    }
    static getAllKeys(objectiveId) {
        const result = [];
        const objective = this.getDb(objectiveId);
        if (objective) {
            const scores = objective.getScores();
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
    static newUUID() {
        const min = -2147483647;
        const max = 2147483647;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static setArray(dbID, key, array) {
        try {
            const arrayString = JSON.stringify(array);
            let uuid;
            const existingUUID = this.getKeyValue(dbID, key);
            if (!existingUUID || existingUUID == 0)
                uuid = this.newUUID();
            else
                uuid = existingUUID;
            this.removeKey(dbID, key);
            const allKeysWithSameUUID = this.getAllKeys(dbID).filter(entry => entry.score === uuid);
            for (const entry of allKeysWithSameUUID) {
                this.removeKey(dbID, entry.participant.displayName);
            }
            this.setKey(dbID, key, uuid);
            this.setKey(dbID, arrayString, uuid);
            return true;
        }
        catch (error) {
            console.warn(Error(`Error setting array @${dbID} | ${key} | ${error}`));
        }
        return false;
    }
    static getArray(dbID, key) {
        const uuid = this.getKeyValue(dbID, key);
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
    static removeArray(dbID, key) {
        const uuid = this.getKeyValue(dbID, key);
        if (uuid !== undefined) {
            const allKeysWithSameUUID = this.getAllKeys(dbID).filter(entry => entry.score === uuid);
            for (const entry of allKeysWithSameUUID) {
                this.removeKey(dbID, entry.participant.displayName);
            }
            return true;
        }
        return false;
    }
}
SDB.scoreboard = world.scoreboard;
export { SDB };
