class VerifyData {
    is_addon_setting(setting) {
        if (this.is_text_field(setting) ||
            this.is_drop_down(setting) ||
            this.is_slider(setting) ||
            this.is_toggle(setting))
            return true;
        else
            return false;
    }
    is_text_field(setting) {
        return 'label' in setting && 'placeholder' in setting;
    }
    is_drop_down(setting) {
        return 'label' in setting && Array.isArray(setting.options);
    }
    is_slider(setting) {
        return 'label' in setting && typeof setting.min === 'number' && typeof setting.max === 'number' && typeof setting.step === 'number';
    }
    is_toggle(setting) {
        return 'label' in setting && typeof setting.default_value === 'boolean';
    }
    static has_type(addon_data, type) {
        const participants = addon_data.getParticipants();
        for (const participant of participants) {
            if (participant.displayName.startsWith(`${type}:`))
                return true;
            else
                continue;
        }
        return false;
    }
}
export { VerifyData };
