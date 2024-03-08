var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { world } from '@minecraft/server';
class ADB {
    constructor() {
        this.scoreboard = world.scoreboard;
    }
    newUUID() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const min = -2147483647;
                const max = 2147483647;
                resolve(Math.floor(Math.random() * (max - min + 1)) + min);
            });
        });
    }
    newDB(dbID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.scoreboard.getObjective(dbID))
                    resolve();
                this.scoreboard.addObjective(dbID, dbID);
                resolve();
            });
        });
    }
    removeDB(dbID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.scoreboard.getObjective(dbID))
                    resolve();
                this.scoreboard.removeObjective(dbID);
                resolve();
            });
        });
    }
    verifyDatabase(dbID) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    addToKey(dbID, key, number) {
        return __awaiter(this, void 0, void 0, function* () {
            const objective = yield this.verifyDatabase(dbID);
            objective.addScore(key, number);
        });
    }
    setKey(dbID, key, number) {
        return __awaiter(this, void 0, void 0, function* () {
            const objective = yield this.verifyDatabase(dbID);
            objective.setScore(key, number);
        });
    }
    removeKey(dbID, key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let objective = this.scoreboard.getObjective(dbID);
                if (!objective)
                    resolve();
                if (!objective)
                    throw new Error(`Objective not found for dbID: ${dbID}`);
                objective.removeParticipant(key);
                resolve();
            });
        });
    }
    getDB(dbID) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                resolve(this.scoreboard.getObjective(dbID));
            });
        });
    }
    getAllDB() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                resolve(this.scoreboard.getObjectives());
            });
        });
    }
    getKeyValue(dbID, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const objective = yield this.getDB(dbID);
            if (!objective)
                return undefined;
            try {
                const score = objective.getScore(key);
                return score;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    getKey(dbID, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const allKeys = yield this.getAllKeys(dbID);
            return allKeys.find(entry => entry.key === key);
        });
    }
    getAllKeys(dbID) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = this.scoreboard.getParticipants();
            const result = [];
            const db = yield this.getDB(dbID);
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
                }
                catch (error) { }
            }
            return result;
        });
    }
    setArray(dbID, key, array) {
        return __awaiter(this, void 0, void 0, function* () {
            const arrayString = JSON.stringify(array);
            let uuid;
            const existingUUID = yield this.getKeyValue(dbID, key);
            uuid = existingUUID !== null && existingUUID !== void 0 ? existingUUID : yield this.newUUID();
            yield this.removeKey(dbID, key);
            const allKeysWithSameUUID = yield this.getAllKeys(dbID);
            allKeysWithSameUUID.filter(entry => entry.value === uuid).forEach((entry) => __awaiter(this, void 0, void 0, function* () {
                yield this.removeKey(dbID, entry.key);
            }));
            yield this.setKey(dbID, key, uuid);
            yield this.setKey(dbID, arrayString, uuid);
        });
    }
    getArray(dbID, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const uuid = yield this.getKeyValue(dbID, key);
            if (uuid === null) {
                return null;
            }
            const allKeys = yield this.getAllKeys(dbID);
            for (const entry of allKeys) {
                if (entry.value === uuid && entry.key !== key) {
                    return JSON.parse(entry.key);
                }
            }
            return null;
        });
    }
    removeArray(dbID, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const uuid = yield this.getKeyValue(dbID, key);
            if (uuid === null) {
                return;
            }
            const allKeysWithSameUUID = yield this.getAllKeys(dbID);
            allKeysWithSameUUID.filter(entry => entry.value === uuid).forEach((entry) => __awaiter(this, void 0, void 0, function* () {
                yield this.removeKey(dbID, entry.key);
            }));
        });
    }
}
export { ADB };
