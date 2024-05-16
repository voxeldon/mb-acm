import { RawText } from "../spec/lib";
class Localize {
    static get_prefix(addon_data) {
        const split = addon_data.displayName.split('.');
        const team_id = split[1];
        const addon_id = split[2];
        return `acm.${team_id}.${addon_id}.`;
    }
    static text(addon_data, text) {
        if (text !== '\n') {
            const pre_fix = this.get_prefix(addon_data);
            return RawText.TRANSLATE(pre_fix + text);
        }
        else
            return RawText.TEXT(text);
    }
    static group(addon_data, group) {
        let msgs = [];
        const pre_fix = this.get_prefix(addon_data);
        msgs = group;
        msgs.unshift(RawText.TEXT(pre_fix));
        return RawText.MESSAGE(...msgs);
    }
}
export { Localize };
