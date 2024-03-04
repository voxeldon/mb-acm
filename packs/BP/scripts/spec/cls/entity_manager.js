var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _EntityManager_instances, _EntityManager_loadData, _EntityManager_saveData, _EntityManager_run;
import { world, system } from '@minecraft/server';
import { SDB } from './db';
/**
 * Manages entities, tracking their existence and state changes.
 */
class EntityManager {
    /**
     * Creates an instance of EntityManager.
     * @param typeId {string} - The type ID of entities this manager is responsible for.
     * @param oneshot {{ deleteOneShot: (entityId: string) => void }} - An optional object with a method to handle one-shot actions for entities.
     */
    constructor(typeId, packId, oneshot) {
        _EntityManager_instances.add(this);
        this.ACTIVE_ENTITIES = new Map();
        this.typeId = typeId;
        this.oneshot = oneshot;
        this.packId = packId;
        __classPrivateFieldGet(this, _EntityManager_instances, "m", _EntityManager_run).call(this);
    }
    /**
     * Executes a callback function for each active entity at a specified interval.
     * @param _func {(context: { entity: Entity }) => void} - The function to execute for each entity, receiving the entity as an argument.
     * @param delayInterval {number} - The interval in ticks between each execution of the function.
     */
    forEntity(_func, delayInterval) {
        system.runInterval(() => {
            for (let [id, entity] of this.ACTIVE_ENTITIES) {
                _func({ entity });
            }
        }, delayInterval);
    }
}
_EntityManager_instances = new WeakSet(), _EntityManager_loadData = function _EntityManager_loadData() {
    if (this.ACTIVE_ENTITIES.size === 0) {
        const db = new SDB();
        const saved_entities = db.getArray(this.packId, "active_entities");
        if (!saved_entities)
            return;
        for (let id of saved_entities) {
            const entity = world.getEntity(id);
            if (entity) {
                this.ACTIVE_ENTITIES.set(id, entity);
            }
        }
    }
}, _EntityManager_saveData = function _EntityManager_saveData() {
    let entitiesToSave = [];
    for (let [id, entity] of this.ACTIVE_ENTITIES) {
        entitiesToSave.push(entity.id);
    }
    const db = new SDB();
    db.setArray(this.packId, "active_entities", entitiesToSave);
}, _EntityManager_run = function _EntityManager_run() {
    __classPrivateFieldGet(this, _EntityManager_instances, "m", _EntityManager_loadData).call(this);
    world.afterEvents.entitySpawn.subscribe((event) => {
        if (event.entity.typeId !== this.typeId)
            return;
        this.ACTIVE_ENTITIES.set(event.entity.id, event.entity);
        event.entity.addTag(event.entity.id);
        __classPrivateFieldGet(this, _EntityManager_instances, "m", _EntityManager_saveData).call(this);
    });
    world.afterEvents.entityLoad.subscribe((event) => {
        if (event.entity.typeId !== this.typeId)
            return;
        this.ACTIVE_ENTITIES.set(event.entity.id, event.entity);
        event.entity.addTag(event.entity.id);
        __classPrivateFieldGet(this, _EntityManager_instances, "m", _EntityManager_saveData).call(this);
    });
    world.afterEvents.entityDie.subscribe((event) => {
        var _a;
        if (event.deadEntity.typeId !== this.typeId)
            return;
        this.ACTIVE_ENTITIES.delete(event.deadEntity.id);
        (_a = this.oneshot) === null || _a === void 0 ? void 0 : _a.deleteOneShot(event.deadEntity.id);
        __classPrivateFieldGet(this, _EntityManager_instances, "m", _EntityManager_saveData).call(this);
    });
    world.afterEvents.entityRemove.subscribe((event) => {
        var _a;
        if (event.removedEntityId !== this.typeId)
            return;
        this.ACTIVE_ENTITIES.delete(event.removedEntityId);
        (_a = this.oneshot) === null || _a === void 0 ? void 0 : _a.deleteOneShot(event.removedEntityId);
        __classPrivateFieldGet(this, _EntityManager_instances, "m", _EntityManager_saveData).call(this);
    });
};
export { EntityManager };
