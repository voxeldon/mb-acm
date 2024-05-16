import { ScoreboardObjective } from "@minecraft/server";

class VerifyData {

    public is_addon_setting(setting: any): boolean {
        if (    this.is_text_field(setting) || 
                this.is_drop_down(setting)  || 
                this.is_slider(setting)    || 
                this.is_toggle(setting)
            ) return true
        else return false
    }
    
    public is_text_field(setting: any): boolean {
        return 'label' in setting && 'placeholder' in setting;
    }
    
    public is_drop_down(setting: any): boolean {
        return 'label' in setting && Array.isArray(setting.options);
    }
    
    public is_slider(setting: any): boolean {
        return 'label' in setting && typeof setting.min === 'number' && typeof setting.max === 'number' && typeof setting.step === 'number';
    }
    
    public is_toggle(setting: any): boolean {
        return 'label' in setting && typeof setting.default_value === 'boolean';
    }

    public static has_type(addon_data: ScoreboardObjective, type: string): boolean{
        const participants = addon_data.getParticipants();
        for (const participant of participants) {
            if (participant.displayName.startsWith(`${type}:`)) return true;
            else continue;
        }
        return false;
    }
}

export { VerifyData }