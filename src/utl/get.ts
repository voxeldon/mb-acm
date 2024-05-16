import { RawMessage, ScoreboardIdentity, ScoreboardObjective } from "@minecraft/server";
import { Localize } from "./localize";
import { cls, RawText } from "../spec/lib";
import { AddonSetting } from "../acm";

class Get {
    public static raw_array(addon_data: ScoreboardObjective, type: string): RawMessage{
        const keys: ScoreboardIdentity[] = addon_data.getParticipants()
        let data_key: RawMessage = RawText.TEXT(`Unknown: ${addon_data.displayName} | ${type}`)
        let string_array: string[] = []
        let raw_text_array: RawMessage[] = []
        for (const key of keys) {
            if (key.displayName.startsWith(type)) {
                let description_key = key.displayName.replace(`${type}:`, '');
                description_key = JSON.parse(description_key);
                if (Array.isArray(description_key)) string_array = description_key;
                else continue;
            }
            else continue;
        }

        if (string_array.length > 0) {
            for (const line of string_array){
                raw_text_array.push(Localize.text(addon_data, line))
                raw_text_array.push(RawText.TEXT('\n'))
            }
    
            if (raw_text_array.length > 0) data_key = RawText.MESSAGE(...raw_text_array); 
        }       
        return data_key
    }

    public static addon_author(addon_data: ScoreboardObjective): string{
        let author: string = 'Unknown Author'
        const keys: ScoreboardIdentity[] = addon_data.getParticipants()
        for (const key of keys) {
            if (key.displayName.startsWith('aut')) {
                author = key.displayName.replace('aut:', '');
            }
            else continue;
        }
        return author;
    }

    public static addon_setting(addon_data: ScoreboardObjective, widget_id: string): any | undefined {
        const participants = addon_data.getParticipants();
        for (const participant of participants) {
            if (participant.displayName.startsWith('set:')) {
                const setting: AddonSetting = JSON.parse(participant.displayName.replace('set:', ''));
                const setting_id = setting.label;
                if (setting_id === widget_id) {
                    cls.SDB.removeKey(addon_data.displayName, participant.displayName);
                    return setting
                }
                else continue;

            }
        }
        return undefined
    }

    public static global_acm_settings(): ScoreboardObjective[]{
        const global_data: ScoreboardObjective[] = cls.SDB.getAllDb();
        const valid_data: ScoreboardObjective[] = []
        if (global_data) {
            for (const data of global_data) {
                if (data.displayName.startsWith('acm')) valid_data.push(data);
                else continue;
            }
        }
        return valid_data
    }

    public static icon_path(addon_data:ScoreboardObjective): string{
        const participants = addon_data.getParticipants();
        for (const participant of participants) {
            if (participant.displayName.startsWith('icon:')) return participant.displayName.replace('icon:','');
        }
        return 'textures/vxl_acm/icons/missing';
    }
}
export { Get }