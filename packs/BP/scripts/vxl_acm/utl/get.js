import { Localize } from "./localize";
import { cls, RawText } from "../spec/lib";
class Get {
    static raw_array(addon_data, type) {
        const keys = addon_data.getParticipants();
        let data_key = RawText.TEXT(`Unknown: ${addon_data.displayName} | ${type}`);
        let string_array = [];
        let raw_text_array = [];
        for (const key of keys) {
            if (key.displayName.startsWith(type)) {
                let description_key = key.displayName.replace(`${type}:`, '');
                description_key = JSON.parse(description_key);
                if (Array.isArray(description_key))
                    string_array = description_key;
                else
                    continue;
            }
            else
                continue;
        }
        if (string_array.length > 0) {
            for (const line of string_array) {
                raw_text_array.push(Localize.text(addon_data, line));
                raw_text_array.push(RawText.TEXT('\n'));
            }
            if (raw_text_array.length > 0)
                data_key = RawText.MESSAGE(...raw_text_array);
        }
        return data_key;
    }
    static addon_author(addon_data) {
        let author = 'Unknown Author';
        const keys = addon_data.getParticipants();
        for (const key of keys) {
            if (key.displayName.startsWith('aut')) {
                author = key.displayName.replace('aut:', '');
            }
            else
                continue;
        }
        return author;
    }
    static pop_addon_setting(addon_data, widget_id) {
        const participants = addon_data.getParticipants();
        for (const participant of participants) {
            if (participant.displayName.startsWith('set:')) {
                const setting = JSON.parse(participant.displayName.replace('set:', ''));
                const setting_id = setting.label;
                if (setting_id === widget_id) {
                    cls.SDB.removeKey(addon_data.displayName, participant.displayName);
                    return setting;
                }
                else
                    continue;
            }
        }
        return undefined;
    }
    static addon_setting(addon_data, widget_id) {
        const participants = addon_data.getParticipants();
        for (const participant of participants) {
            if (participant.displayName.startsWith('set:')) {
                const setting = JSON.parse(participant.displayName.replace('set:', ''));
                const setting_id = setting.label;
                if (setting_id === widget_id) {
                    return setting;
                }
                else
                    continue;
            }
        }
        return undefined;
    }
    static global_acm_settings() {
        const global_data = cls.SDB.getAllDb();
        const valid_data = [];
        if (global_data) {
            for (const data of global_data) {
                if (data.displayName.startsWith('acm'))
                    valid_data.push(data);
                else
                    continue;
            }
        }
        return valid_data;
    }
    static icon_path(addon_data) {
        const participants = addon_data.getParticipants();
        for (const participant of participants) {
            if (participant.displayName.startsWith('icon:'))
                return participant.displayName.replace('icon:', '');
        }
        return 'textures/vxl_acm/icons/missing';
    }
}
export { Get };
