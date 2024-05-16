class ScriptEvent {
    constructor(eventId, callback) {
        this.eventId = eventId;
        this.callback = callback;
    }
    _handleEvent(event) {
        this.callback(event);
    }
}
class ScriptEventRegistry {
    constructor(scriptEvents) {
        this.eventHandlers = new Map(scriptEvents.map(se => [se.eventId, se]));
        this.scriptEventRegister = this.scriptEventRegister.bind(this);
    }
    scriptEventRegister(event) {
        const eventId = event.id;
        const scriptEvent = this.eventHandlers.get(eventId);
        if (scriptEvent) {
            scriptEvent._handleEvent(event);
        }
        else {
            console.warn(`No handler for event: ${eventId}`);
        }
    }
}
export { ScriptEventRegistry, ScriptEvent };
