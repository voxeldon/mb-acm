import { world } from "@minecraft/server";
import { cls, measureTime } from "../lib";
class _SpecTestDB {
    constructor(count = 1) {
        this.createDatabases = () => {
            for (let i = 0; i < count; i++) {
                let dbName = 'test' + i;
                cls.SDB.newDb(dbName);
            }
        };
        this.setDatabaseKeys = () => {
            for (let i = 0; i < count; i++) {
                let dbName = 'test' + i;
                cls.SDB.setKey(dbName, dbName, i);
            }
        };
        this.addToDatabaseKeys = () => {
            for (let i = 0; i < count; i++) {
                let dbName = 'test' + i;
                cls.SDB.addToKey(dbName, dbName, i);
            }
        };
        this.getDatabaseKeyValues = () => {
            for (let i = 0; i < count; i++) {
                let dbName = 'test' + i;
                cls.SDB.getKeyValue(dbName, dbName);
            }
        };
        this.getAllKeysFromDatabase = () => {
            for (let i = 0; i < count; i++) {
                let dbName = 'test' + i;
                cls.SDB.getAllKeys(dbName);
            }
        };
        this.getAllDatabases = () => {
            for (let i = 0; i < count; i++) {
                cls.SDB.getAllDb();
            }
        };
        this.setArray = () => {
            for (let i = 0; i < count; i++) {
                let dbName = 'test' + i;
                cls.SDB.setArray('test' + i, 'my_array' + i, [
                    '1', '2', 'c', 'd', '5', '6', 'g', 'h', '9', '10', 'k'
                ]);
            }
        };
        this.getArray = () => {
            for (let i = 0; i < count; i++) {
                cls.SDB.getArray('test' + i, 'my_array' + i);
            }
        };
        this.removeArray = () => {
            for (let i = 0; i < count; i++) {
                cls.SDB.removeArray('test' + i, 'my_array' + i);
            }
        };
        this.removeDatabases = () => {
            for (let i = 0; i < count; i++) {
                let dbName = 'test' + i;
                cls.SDB.removeDb(dbName);
            }
        };
        this.testOnEntities = () => {
            for (let i = 0; i < count; i++) {
                let dbName = 'test_db';
                cls.SDB.newDb(dbName);
                world.getDimension("overworld").runCommand(`/scoreboard players add @e ${dbName} ${i}`);
                cls.SDB.addToKey(dbName, 'test', i);
                cls.SDB.setArray(dbName, 'my_array', [
                    'player'
                ]);
                cls.SDB.getArray(dbName, 'my_array');
                cls.SDB.removeDb(dbName);
            }
        };
    }
    test_db() {
        measureTime(this.createDatabases, "createDatabases")();
        measureTime(this.setDatabaseKeys, "setDatabaseKeys")();
        measureTime(this.addToDatabaseKeys, "addToDatabaseKeys")();
        measureTime(this.getDatabaseKeyValues, "getDatabaseKeyValues")();
        measureTime(this.getAllKeysFromDatabase, "getAllKeysFromDatabase")();
        measureTime(this.setArray, "setArray")();
        measureTime(this.getArray, "getArray")();
        measureTime(this.removeArray, "removeArray")();
        measureTime(this.getAllDatabases, "getAllDatabases")();
        measureTime(this.removeDatabases, "removeDatabases")();
        measureTime(this.testOnEntities, "testOnEntities")();
    }
}
export { _SpecTestDB };
