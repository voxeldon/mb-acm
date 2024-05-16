import { Player, Scoreboard, ScoreboardObjective, ScriptEventCommandMessageAfterEvent, ScriptEventCommandMessageAfterEventSignal, system, world } from "@minecraft/server";
import { AddonData, AddonSetting, SettingData} from "..";
import { VerifyData } from "./verify_data";

class AcmData {
    private callback?: (data: any) => void;
    private script_event: ScriptEventCommandMessageAfterEventSignal
    private event_keys: string[]
    private scoreboard: Scoreboard
    constructor(){
        this.callback = undefined;
        this.script_event = system.afterEvents.scriptEventReceive;
        this.event_keys = [];
        this.scoreboard = world.scoreboard;
    }
    public subscribe(addons: AddonData[], callback: (data: SettingData) => void){
        for (const addon_data of addons) {
            this.event_keys.push(`acm_data:${addon_data.team_id}.${addon_data.addon_id}`)
        }
        this.callback = callback;
        this.script_event.subscribe(this.handle_script_event.bind(this));
    }

    private handle_script_event(event: ScriptEventCommandMessageAfterEvent): void {
        const event_id: string = event.id;
        const event_message: string = event.message
        if (this.event_keys.includes(event_id) && this.callback) {
            const event_data: SettingData = JSON.parse(event_message);
            this.callback(event_data);
        }
        else if (event_id.startsWith('acm:del')) this.delete_addon_adress(event);
    }

    private delete_addon_adress(event: ScriptEventCommandMessageAfterEvent){
        const event_message: string = event.message
        let adress_id: string = ''
        if (event_message.startsWith('acm.')) adress_id = event.message;
        else adress_id = `acm.${event_message}`;
        const global_data: ScoreboardObjective[] = this.scoreboard.getObjectives();
        const player: Player = event.sourceEntity as Player;
        if (global_data) {
            for (const data of global_data) {
                if (data.displayName.includes(event_message)) {
                    player.sendMessage({translate: 'acm.util.valid_adress'});
                    try {
                        this.scoreboard.removeObjective(data.displayName);
                        player.sendMessage({translate: 'acm.util.addon_removed'});
                        return;
                    } catch (error) {
                        player.sendMessage({translate: 'acm.util.addon_removed_error'});
                        player.sendMessage(JSON.stringify(error));
                        return;
                    }
                }
                else continue;
            }
            player.sendMessage({translate: 'acm.util.invalid_adress'});
        }
    }

    public generate_addon_data(addon_data: AddonData) {
        const input_settings = addon_data.settings;
        const input_information = addon_data.information;
        const icon_path = addon_data.icon_path;
    
        let export_settings: AddonSetting[] = [];
        const export_addon_data: Partial<AddonData> = {
            addon_id: addon_data.addon_id,
            team_id: addon_data.team_id,
            author: addon_data.author,
            description: addon_data.description
        };

        if (icon_path) {
            export_addon_data.icon_path = icon_path;
        }
    
        if (input_settings) {
            export_settings = this.parse_addon_data(input_settings);
            export_addon_data.settings = export_settings;
        }
    
        if (input_information) {
            export_addon_data.information = input_information;
        }
    
        this.generate_database(export_addon_data as AddonData); // Cast to AddonData if needed
    }
    

    private parse_addon_data(settings_data: AddonSetting[]): AddonSetting[]{
        const export_settings: AddonSetting[] = [];
        for (const setting of settings_data) {
            if (new VerifyData().is_addon_setting(setting)) {
                export_settings.push(setting);
            } else {
                console.warn('ACM ERROR: Invalid addon setting')
            }
        }
        return export_settings
    }

    private generate_database(addon_data: AddonData): void {
        const db_id: string = `acm.${addon_data.team_id}.${addon_data.addon_id}`;
        var database: ScoreboardObjective | undefined = this.scoreboard.getObjective(db_id);
        if (database) return;
        this.scoreboard.addObjective(db_id);
        database = this.scoreboard.getObjective(db_id);
        if (!database) {
            console.warn(`ACM ERROR: Error generating database for ${addon_data.addon_id}`);
            return;
        }
        database.setScore(`aut:${addon_data.author}`, 0)
        database.setScore(`des:${JSON.stringify(addon_data.description)}`, 0)
        if (addon_data.icon_path) {
            database.setScore(`icon:${addon_data.icon_path}`, 0)
        }
        if (addon_data.information) {
            database.setScore(`info:${JSON.stringify(addon_data.information)}`, 0);
        }
        if (addon_data.settings) {
            addon_data.settings.forEach((setting, index) => {
                if (!database) return
                database.setScore(`set:${JSON.stringify(setting)}`, index +1);
            });
        }
    }
}
export { AcmData }