import { system, TicksPerSecond, world } from "@minecraft/server";
import { cls, RawText } from "../spec/lib";
import { ICON_PATH, LANG } from "../client";
import { Widgets } from "./widgets";
import { Localize } from "./localize";
import { VerifyData } from "../acm/cls/verify_data";
import { Get } from "./get";
class InterfaceHandler {
    constructor(trigger_item = 'acm:tool') {
        this.item_use_event = world.afterEvents.itemUse;
        this.trigger_item = trigger_item;
        this.require_tag = false;
        this.tag_id = '';
    }
    on_ready() {
        if (cls.SDB.getDb('acm.vxl.acm_core'))
            this.emit_update_signal();
        this.item_use_event.subscribe(this.handle_item_event.bind(this));
    }
    update_settings(data) {
        var _a, _b;
        this.tag_id = (_a = data.tag_id) !== null && _a !== void 0 ? _a : '';
        this.require_tag = (_b = data.require_tag) !== null && _b !== void 0 ? _b : false;
        if (!this.tag_id)
            this.require_tag = false;
    }
    show_general_response(player, response) {
        const actionForm = new cls.ActionForm();
        actionForm.setTitle(LANG.title.main)
            .setBody(response)
            .addButton(LANG.button.okay)
            .show(player)
            .then(response => {
            if (response.type === 'selected')
                this.show_form_home(player);
        })
            .catch(error => { });
    }
    show_form_home(player) {
        const actionForm = new cls.ActionForm();
        const button_index = this.generate_settings_buttons(actionForm);
        const addon_count = button_index.size;
        if (button_index.size === 0) {
            this.show_general_response(player, 'No addons found');
        }
        else {
            actionForm.setTitle(LANG.title.main)
                .setBody(RawText.MESSAGE(RawText.TRANSLATE(LANG.body.header), RawText.TEXT('\n'), RawText.TEXT('\n'), RawText.TRANSLATE(LANG.body.registered), RawText.TEXT(addon_count.toString()), RawText.TEXT('\n'), RawText.TEXT('\n')))
                .show(player)
                .then(response => {
                const slot = response.selection;
                const addon_data = button_index.get(slot);
                if (addon_data) {
                    this.show_form_addon(player, addon_data);
                }
            }).catch(error => { });
        }
    }
    show_form_addon(player, addon_data) {
        const actionForm = new cls.ActionForm();
        const title = Localize.text(addon_data, 'addon_id');
        let slot_in_index = 0;
        const button_index = new Map();
        if (VerifyData.has_type(addon_data, 'info')) {
            actionForm.addButton(LANG.button.information, ICON_PATH.question);
            button_index.set(slot_in_index, 'info');
            slot_in_index += 1;
        }
        if (VerifyData.has_type(addon_data, 'set')) {
            actionForm.addButton(LANG.button.settings, ICON_PATH.exclaim);
            button_index.set(slot_in_index, 'settings');
            slot_in_index += 1;
        }
        if (VerifyData.has_type(addon_data, 'event')) {
            actionForm.addButton(LANG.button.event, ICON_PATH.exclaim);
            button_index.set(slot_in_index, 'event');
            slot_in_index += 1;
        }
        actionForm.addButton(LANG.button.return, ICON_PATH.return);
        button_index.set(slot_in_index, 'return');
        actionForm.setTitle(title)
            .setBody(RawText.MESSAGE(Get.raw_array(addon_data, 'des'), RawText.TEXT('\nAuthor: '), Localize.text(addon_data, Get.addon_author(addon_data)), RawText.TEXT('\n\n')))
            .show(player)
            .then(response => {
            const selected_slot = response.selection;
            const selected_button = button_index.get(selected_slot); // get string key based on selected_slot
            if (!selected_button)
                return;
            if (selected_button === 'info')
                this.show_form_information(player, addon_data);
            else if (selected_button === 'settings')
                this.show_form_settings(player, addon_data);
            else if (selected_button === 'event')
                this.run_event_callback(player, addon_data);
            else if (selected_button === 'return')
                this.show_form_home(player);
        }).catch(error => { });
    }
    show_form_information(player, addon_data) {
        const actionForm = new cls.ActionForm();
        actionForm.setTitle(LANG.title.info)
            .setBody(Get.raw_array(addon_data, 'info'))
            .addButton(LANG.button.return)
            .show(player)
            .then(response => {
            this.show_form_addon(player, addon_data);
        }).catch(error => { });
    }
    show_form_settings(player, addon_data) {
        const modalForm = new cls.ModalForm();
        const widgets = new Widgets(modalForm.form, addon_data);
        modalForm.setTitle(RawText.MESSAGE(RawText.TRANSLATE('acm.title_settings'), RawText.TEXT(' | '), Localize.text(addon_data, 'addon_id')))
            .show(player)
            .then(response => {
            const new_data = response.values;
            if (response.type === 'submitted') {
                this.update_addon_data(player, addon_data, new_data, widgets.widget_index);
                this.show_form_addon(player, addon_data);
            }
        })
            .catch(error => {
            // Handle the error
        });
    }
    //Private Methods
    run_event_callback(player, addon_data) {
        var _a;
        const dimension = player.dimension;
        const participants = addon_data.getParticipants();
        const event_string = (_a = participants.find(participant => participant.displayName.startsWith('event:'))) === null || _a === void 0 ? void 0 : _a.displayName;
        if (!event_string)
            return;
        const event_data = event_string.replace('event:', '');
        dimension.runCommand(`/scriptevent ${event_data}`);
    }
    update_addon_data(player, addon_data, new_data, widget_index) {
        const output_data = {};
        for (const widget of widget_index) {
            const index_position = widget[0];
            const widget_id = widget[1][1];
            const setting = Get.pop_addon_setting(addon_data, widget_id);
            if (!setting) {
                console.warn('ACM ERROR: Error reading setting data');
                return;
            }
            const verify_data = new VerifyData();
            if (verify_data.is_drop_down(setting)) {
                const dropdown = setting;
                const updated_data = {
                    label: dropdown.label,
                    options: dropdown.options,
                    default_index_value: new_data[widget[0]]
                };
                cls.SDB.setKey(addon_data.displayName, `set:${JSON.stringify(updated_data)}`, index_position + 1);
                output_data[updated_data.label] = updated_data.default_index_value;
                continue;
            }
            else if (verify_data.is_slider(setting)) {
                const slider = setting;
                const updated_data = {
                    label: slider.label,
                    min: slider.min,
                    max: slider.max,
                    step: slider.step,
                    default_value: new_data[widget[0]]
                };
                cls.SDB.setKey(addon_data.displayName, `set:${JSON.stringify(updated_data)}`, index_position + 1);
                output_data[updated_data.label] = updated_data.default_value;
                continue;
            }
            else if (verify_data.is_text_field(setting)) {
                const text_feild = setting;
                const updated_data = {
                    label: text_feild.label,
                    placeholder: text_feild.placeholder,
                    default_value: new_data[widget[0]]
                };
                cls.SDB.setKey(addon_data.displayName, `set:${JSON.stringify(updated_data)}`, index_position + 1);
                output_data[updated_data.label] = updated_data.default_value;
                continue;
            }
            else if (verify_data.is_toggle(setting)) {
                const toggle = setting;
                const updated_data = {
                    label: toggle.label,
                    default_value: new_data[widget[0]]
                };
                cls.SDB.setKey(addon_data.displayName, `set:${JSON.stringify(updated_data)}`, index_position + 1);
                output_data[updated_data.label] = updated_data.default_value;
                continue;
            }
            else
                continue;
        }
        try {
            player.runCommand(`/scriptevent acm_data:${addon_data.displayName.replace('acm.', '')}${JSON.stringify(output_data)}`);
        }
        catch (error) {
            console.warn('ACM ERROR: Error sending script event: ' + `acm_data:${addon_data.displayName.replace('acm.', '')}${JSON.stringify(output_data)}`);
        }
    }
    handle_item_event(event) {
        const item = event.itemStack;
        const type_id = item.typeId;
        const player = event.source;
        if (type_id !== this.trigger_item)
            return;
        if (this.require_tag)
            if (!player.hasTag(this.tag_id))
                return;
        this.show_form_home(player);
    }
    generate_settings_buttons(actionForm) {
        const settings_data = Get.global_acm_settings();
        const button_index = new Map();
        var slot = 0;
        for (const setting of settings_data) {
            button_index.set(slot, setting);
            slot += 1;
        }
        for (const [_slot, setting] of button_index) {
            try {
                actionForm.addButton(Localize.text(setting, 'addon_id'), Get.icon_path(setting));
            }
            catch (error) { }
        }
        return button_index;
    }
    emit_update_signal() {
        const settings_data = Get.global_acm_settings();
        const checkForPlayerAndEmit = (addon_data) => {
            system.runTimeout(() => {
                const player = world.getAllPlayers()[0];
                if (player) {
                    const output_data = this.get_all_settings(addon_data);
                    player.runCommand(`/scriptevent acm_data:${addon_data.displayName.replace('acm.', '')} ${JSON.stringify(output_data)}`);
                }
                else {
                    // Retry after the specified interval
                    checkForPlayerAndEmit(addon_data);
                }
            }, TicksPerSecond);
        };
        for (const addon_data of settings_data) {
            checkForPlayerAndEmit(addon_data);
        }
    }
    get_all_settings(addon_data) {
        const participants = addon_data.getParticipants();
        const output_data = {};
        for (const participant of participants) {
            const id = participant.displayName;
            if (id.startsWith('set:')) {
                const setting_object = JSON.parse(id.replace('set:', ''));
                if (setting_object.default_value) {
                    output_data[setting_object.label] = setting_object.default_value;
                }
                else if (setting_object.default_value_index) {
                    output_data[setting_object.label] = setting_object.default_value_index;
                }
            }
        }
        return output_data;
    }
}
export { InterfaceHandler };
