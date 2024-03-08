import { RawText } from "../itf/raw_text";
import { RawMessage } from '@minecraft/server';

class CacheRawText {
    private static cache = new Map<string, RawMessage>();

    public static processes(key: string, ...params: string[]): RawMessage {
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }
        const message = RawText.TRANSLATE(key, ...params);
        this.cache.set(key, message);
        return message;
    }
}

export { CacheRawText };
