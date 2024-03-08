import { RawText } from "../itf/raw_text";
class CacheRawText {
    static processes(key, ...params) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        const message = RawText.TRANSLATE(key, ...params);
        this.cache.set(key, message);
        return message;
    }
}
CacheRawText.cache = new Map();
export { CacheRawText };
