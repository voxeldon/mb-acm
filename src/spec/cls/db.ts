import { world } from '@minecraft/server';
import { Scoreboard, ScoreboardObjective } from '@minecraft/server';
/**
 * Simple database extending on top of Minecraft's scoreboard system.
 */
class SDB {
    private scoreboard: Scoreboard;

    constructor() {
        this.scoreboard = world.scoreboard;
    }

    /**
     * Generates a new unique identifier.
     * @returns A random uuid.
     */
    newUUID(): number {
        const min = -2147483647;
        const max = 2147483647;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Creates a new database using the provided ID.
     * @param dbID {string} - The unique string identifier for the database to create.
     */
    newDB(dbID: string): void {
        if (this.scoreboard.getObjective(dbID)) return;
        this.scoreboard.addObjective(dbID, dbID);
    }

    /**
     * Removes the database with the specified ID.
     * @param dbID {string} - The unique string identifier for the database to remove.
     */
    removeDB(dbID: string): void {
        if (!this.scoreboard.getObjective(dbID)) return;
        this.scoreboard.removeObjective(dbID);
    }

    /**
     * Verifies the existence of a database with the given ID, creating it if necessary.
     * @param dbID {string} - The unique string identifier for the database to verify or create.
     * @returns {ScoreboardObjective} The verified or newly created ScoreboardObjective associated with the database ID.
     */
    verifyDatabase(dbID: string): ScoreboardObjective {
        let objective = this.scoreboard.getObjective(dbID);
        if (!objective) {
            this.newDB(dbID);
            objective = this.scoreboard.getObjective(dbID);
            if (!objective) {
                throw new Error(`Failed to verify or create the database with ID: ${dbID}`);
            }
        }
        return objective;
    }
    
    /**
     * Adds a score to a key within the specified database.
     * @param dbID {string} - The unique string identifier for the database.
     * @param key {string} - The key to add the score to.
     * @param number {number} - The score to add.
     */
    addToKey(dbID: string, key: string, number: number): void {
        let objective = this.verifyDatabase(dbID);
        objective.addScore(key, number); 
    }

    /**
     * Sets the score for a key within the specified database.
     * @param dbID {string} - The unique string identifier for the database.
     * @param key {string} - The key to set the score for.
     * @param number {number} - The score to set.
     */
    setKey(dbID: string, key: string, number: number): void {
        let objective = this.verifyDatabase(dbID);
        objective.setScore(key, number); 
    }

    /**
     * Removes a key from the specified database.
     * @param dbID {string} - The unique string identifier for the database.
     * @param key {string} - The key to remove.
     */
    removeKey(dbID: string, key: string): void {
        let objective = this.scoreboard.getObjective(dbID);
        if (!objective) return;
        objective.removeParticipant(key); 
    }

    /**
     * Retrieves the database instance.
     * @param dbID {string} - The unique string identifier for the database.
     * @returns {ScoreboardObjective | undefined} The ScoreboardObjective associated with the database ID, or undefined if not found.
     */
    getDB(dbID: string): ScoreboardObjective | undefined {
        return this.scoreboard.getObjective(dbID);
    }

    /**
     * Retrieves all database instances.
     * @returns {ScoreboardObjective[] | undefined} The ScoreboardObjectives associated with the world, or undefined if none are found.
     */
    getAllDB(): ScoreboardObjective[] | undefined {
        return this.scoreboard.getObjectives();
    }

    /**
     * Gets the value of a key in the specified database.
     * @param dbID {string} - The unique string identifier for the database.
     * @param key {string} - The key to get the score for.
     * @returns {number | undefined} The score value associated with the key, or undefined if not found.
     */
    getKeyValue(dbID: string, key: string): number | undefined {
        const objective = this.getDB(dbID);
        if (!objective) return undefined;
        try {
            const score = objective.getScore(key); 
            return score;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Retrieves a key-value pair from the specified database based on the key.
     * @param dbID {string} - The unique string identifier for the database.
     * @param key {string} - The key to retrieve the value for.
     * @returns {{ key: string; value: number } | undefined} An object containing the key and its associated value, or undefined if not found.
     */
    getKey(dbID: string, key: string): { key: string; value: number } | undefined {
        const allKeys = this.getAllKeys(dbID);
        return allKeys.find(entry => entry.key === key);
    }

    /**
     * Retrieves all key-value pairs from the specified database.
     * @param dbID {string} - The unique string identifier for the database.
     * @returns {{ key: string; value: number }[]} An array of objects, each containing a key and its associated value.
     */
    getAllKeys(dbID: string): { key: string; value: number }[] {
        const participants = this.scoreboard.getParticipants(); 
        const result: { key: string; value: number }[] = [];

        const db = this.getDB(dbID);
        if (!db) return result;

        for (const participant of participants) {
            const score = db.getScore(participant.displayName); 
            if (score !== undefined) {
                result.push({
                    key: participant.displayName,
                    value: score
                });
            }
        }

        return result;
    }

    /**
     * Stores an array as a JSON string under a key in the specified database.
     * @param dbID {string} - The unique string identifier for the database.
     * @param key {string} - The key under which to store the array.
     * @param array {any[]} - The array to store.
     */
    setArray(dbID: string, key: string, array: any[]): void {
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

    /**
     * Retrieves an array stored under a key in the specified database.
     * @param dbID {string} - The unique string identifier for the database.
     * @param key {string} - The key under which the array is stored.
     * @returns {any[] | null} The array, or null if not found or if the key is not associated with an array.
     */
    getArray(dbID: string, key: string): any[] | null {
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

    /**
     * Removes an array stored under a key in the specified database.
     * @param dbID {string} - The unique string identifier for the database.
     * @param key {string} - The key under which the array is stored.
     */
    removeArray(dbID: string, key: string): void {
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
