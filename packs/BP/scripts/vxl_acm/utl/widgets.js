import { VerifyData } from "../acm/cls/verify_data";
import { Localize } from "./localize";
const verify = new VerifyData();
class Widgets {
    constructor(model_form, addon_data) {
        this.widget_index = new Map();
        this.widget_slot = 0;
        this.addon_data = addon_data;
        this.model_form = model_form;
        this.valid_setting_keys = [];
        this.on_ready();
    }
    on_ready() {
        const participants = this.addon_data.getParticipants();
        const settingsWithScores = [];
        // Fetch settings and their scores
        for (const participant of participants) {
            if (participant.displayName.startsWith('set:')) {
                const score = this.addon_data.getScore(participant) || 0; // Default score to 0 if undefined
                const key_string = participant.displayName.replace('set:', '');
                try {
                    const setting_key = JSON.parse(key_string);
                    if (verify.is_addon_setting(setting_key)) {
                        // Store setting along with its score
                        settingsWithScores.push({ setting: setting_key, score: score });
                    }
                    else {
                        console.warn(`ACM ERROR: ADDON: ${this.addon_data.displayName}.${setting_key} is invalid.`);
                    }
                }
                catch (e) {
                    console.warn(`Error parsing setting: ${key_string}`);
                }
            }
        }
        // Sort settings by score
        settingsWithScores.sort((a, b) => a.score - b.score);
        // Use sorted settings for widget generation
        this.valid_setting_keys = settingsWithScores.map(s => s.setting);
        if (this.valid_setting_keys.length > 0) {
            this.generate_widgets();
        }
    }
    generate_widgets() {
        for (const setting of this.valid_setting_keys) {
            if (verify.is_drop_down(setting))
                this.generate_drop_down_widget(setting);
            else if (verify.is_slider(setting))
                this.generate_slider_widget(setting);
            else if (verify.is_text_field(setting))
                this.generate_text_field_widget(setting);
            else if (verify.is_toggle(setting))
                this.generate_toggle_widget(setting);
            else
                return;
        }
    }
    generate_drop_down_widget(setting) {
        const label = Localize.text(this.addon_data, setting.label);
        const options_raw = setting.options;
        const options = [];
        let default_value = 0;
        if (setting.default_index_value)
            default_value = setting.default_index_value;
        for (const option of options_raw)
            options.push(Localize.text(this.addon_data, option));
        this.model_form.dropdown(label, options, default_value);
        this.widget_index.set(this.widget_slot, ['dropdown', setting.label]);
        this.widget_slot += 1;
    }
    generate_slider_widget(setting) {
        const label = Localize.text(this.addon_data, setting.label);
        const min = setting.min;
        const max = setting.max;
        const step = setting.step;
        let default_value = setting.min;
        if (setting.default_value)
            default_value = setting.default_value;
        this.model_form.slider(label, min, max, step, default_value);
        this.widget_index.set(this.widget_slot, ['slider', setting.label]);
        this.widget_slot += 1;
    }
    generate_text_field_widget(setting) {
        const label = Localize.text(this.addon_data, setting.label);
        let placeholder = Localize.text(this.addon_data, setting.placeholder);
        let default_value = '';
        if (setting.default_value) {
            default_value = setting.default_value;
            this.model_form.textField(label, placeholder, default_value);
        }
        else
            this.model_form.textField(label, placeholder);
        this.widget_index.set(this.widget_slot, ['text_feild', setting.label]);
        this.widget_slot += 1;
    }
    generate_toggle_widget(setting) {
        const label = Localize.text(this.addon_data, setting.label);
        const default_value = setting.default_value;
        this.model_form.toggle(label, default_value);
        this.widget_index.set(this.widget_slot, ['toggle', setting.label]);
        this.widget_slot += 1;
    }
}
export { Widgets };
