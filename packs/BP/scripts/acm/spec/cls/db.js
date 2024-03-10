import { world } from '@minecraft/server';
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
        if (!db)
            return false;
        db.setScore(keyId, value);
        return true;
    }
    static addToKey(objectiveId, keyId, value = 0) {
        const db = this.getDb(objectiveId);
        if (!db)
            return false;
        db.addScore(keyId, value);
        return true;
    }
    static removeKey(objectiveId, keyId) {
        const db = this.getDb(objectiveId);
        if (!db)
            return false;
        db.removeParticipant(keyId);
        return true;
    }
    static getKeyValue(objectiveId, keyId) {
        try {
            const db = this.getDb(objectiveId);
            const key = db === null || db === void 0 ? void 0 : db.getScore(keyId);
            if (key)
                return key;
        }
        catch (error) {
            return undefined;
        }
    }
    static getAllKeys(dbID) {
        const participants = this.scoreboard.getParticipants();
        const result = [];
        const db = this.getDb(dbID);
        if (!db)
            return result;
        for (const participant of participants) {
            const score = db.getScore(participant.displayName);
            if (score !== undefined) {
                result.push({ key: participant.displayName, value: score });
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
        const arrayString = JSON.stringify(array);
        let uuid;
        const existingUUID = this.getKeyValue(dbID, key);
        uuid = existingUUID !== null && existingUUID !== void 0 ? existingUUID : this.newUUID();
        this.removeKey(dbID, key);
        const allKeysWithSameUUID = this.getAllKeys(dbID).filter(entry => entry.value === uuid);
        for (const entry of allKeysWithSameUUID) {
            this.removeKey(dbID, entry.key);
        }
        this.setKey(dbID, key, uuid);
        this.setKey(dbID, arrayString, uuid);
    }
    static getArray(dbID, key) {
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
    static removeArray(dbID, key) {
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
SDB.scoreboard = world.scoreboard;
export { SDB };
