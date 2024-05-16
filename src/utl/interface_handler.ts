import { ItemStack, ItemUseAfterEvent, ItemUseAfterEventSignal, Player, RawMessage, ScoreboardObjective, world } from "@minecraft/server";
import { cls, RawText } from "../spec/lib";
import { ActionForm } from "../spec/cls/form";
import { ICON_PATH, LANG } from "../client";
import { Widgets } from "./widgets";
import { Localize } from "./localize";
import { DropDown, SettingData, Slider, TextField, Toggle } from "../acm";
import { VerifyData } from "../acm/cls/verify_data";
import { Get } from "./get";

class InterfaceHandler {
    private trigger_item: string
    private item_use_event: ItemUseAfterEventSignal;
    private require_tag: boolean
    private tag_id: string
    constructor(trigger_item: string = 'acm:tool'){
        this.item_use_event = world.afterEvents.itemUse;
        this.trigger_item = trigger_item
        this.require_tag = false
        this.tag_id = ''
    }

    public on_ready(): void {
        this.item_use_event.subscribe(this.handle_item_event.bind(this));
    }

    public update_settings(data: SettingData): void {
        this.tag_id = data.tag_id ?? '';
        this.require_tag = data.require_tag ?? false;
        if (!this.tag_id) this.require_tag = false;
    }
    
    public show_general_response(player: Player, response: string | RawMessage){
        const actionForm = new cls.ActionForm();
        actionForm.setTitle(LANG.title.main)
          .setBody(response)
          .addButton(LANG.button.okay)
          .show(player)
          .then(response => {
            if (response.type === 'selected') this.show_form_home(player);
          })
          .catch(error => {}); 
    }

    public show_form_home(player: Player): void {
        const actionForm = new cls.ActionForm();
        const button_index: Map<number, ScoreboardObjective> = this.generate_settings_buttons(actionForm);
        const addon_count: number = button_index.size
        if (button_index.size === 0) {
            this.show_general_response(player, 'No addons found')
        }
        else {
            actionForm.setTitle(LANG.title.main)
            .setBody(
                RawText.MESSAGE(
                    RawText.TRANSLATE(LANG.body.header),
                    RawText.TEXT('\n'),
                    RawText.TEXT('\n'),
                    RawText.TRANSLATE(LANG.body.registered),
                    RawText.TEXT(addon_count.toString()),
                    RawText.TEXT('\n'),
                    RawText.TEXT('\n')
                )
            )
            .show(player)
            .then(response => {
               const slot: number = response.selection; 
               const addon_data: ScoreboardObjective | undefined = button_index.get(slot);
               if (addon_data) {
                    this.show_form_addon(player, addon_data)
               } 
            }).catch(error => {});
        } 
    }

    public show_form_addon(player: Player, addon_data: ScoreboardObjective): void {
        const actionForm = new cls.ActionForm();
        const title: RawMessage = Localize.text(addon_data, 'addon_id')
        let slot_in_index: number = 0
        const button_index = new Map<number, string>();

        if (VerifyData.has_type(addon_data, 'info')) {
            actionForm.addButton(LANG.button.information, ICON_PATH.question);
            button_index.set(slot_in_index, 'info');
            slot_in_index += 1
        }
        if (VerifyData.has_type(addon_data, 'set')) {
            actionForm.addButton(LANG.button.settings, ICON_PATH.exclaim);
            button_index.set(slot_in_index, 'settings');
            slot_in_index += 1
        }
        actionForm.addButton(LANG.button.return, ICON_PATH.return)
        button_index.set(slot_in_index, 'return');
        
        actionForm.setTitle(title)
          .setBody(
            RawText.MESSAGE(Get.raw_array(addon_data, 'des'), 
            RawText.TEXT('\nAuthor: '), Localize.text(addon_data, 
                Get.addon_author(addon_data)), RawText.TEXT('\n\n'))
            )
          .show(player)
          .then(response => {
            const selected_slot = response.selection;
            const selected_button: string | undefined = button_index.get(selected_slot)// get string key based on selected_slot
            if (!selected_button) return
            if (selected_button === 'info') this.show_form_information(player, addon_data)
            else if (selected_button === 'settings') this.show_form_settings(player, addon_data)
            else if (selected_button === 'return') this.show_form_home(player);
          }).catch(error => {});   
    }

    public show_form_information(player: Player, addon_data: ScoreboardObjective): void {
        const actionForm = new cls.ActionForm();
        actionForm.setTitle(LANG.title.info)
          .setBody(Get.raw_array(addon_data, 'info'))
          .addButton(LANG.button.return)
          .show(player)
          .then(response => {
            this.show_form_addon(player, addon_data);
          }).catch(error => {});  
    }

    public show_form_settings(player: Player, addon_data: ScoreboardObjective) {
        const modalForm = new cls.ModalForm();
        const widgets = new Widgets(modalForm.form, addon_data);
        modalForm.setTitle(RawText.MESSAGE(RawText.TRANSLATE('acm.title_settings'), RawText.TEXT(' | '), Localize.text(addon_data,'addon_id')))
            .show(player)
            .then(response => {
                const new_data: any[] = response.values;
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

    private update_addon_data(player:Player, addon_data: ScoreboardObjective, new_data: any, widget_index: Map<number, string[]>){
        const output_data: { [key: string]: any } = {};
        for (const widget of widget_index) {
            const index_position: number = widget[0]
            const widget_id = widget[1][1];
            const setting: any = Get.addon_setting(addon_data, widget_id);
            if (!setting) {
                console.warn('ACM ERROR: Error reading setting data');
                return;
            } 
            const verify_data = new VerifyData();
            
            if (verify_data.is_drop_down(setting)) {
                const dropdown: DropDown = setting
                const updated_data: DropDown = {
                    label: dropdown.label,
                    options: dropdown.options,
                    default_index_value: new_data[widget[0]]
                }
                cls.SDB.setKey(addon_data.displayName, `set:${JSON.stringify(updated_data)}`, index_position +1)
                output_data[updated_data.label] = updated_data.default_index_value;
                continue;
            } 
            else if (verify_data.is_slider(setting)) {
                const slider: Slider = setting
                const updated_data: Slider = {
                    label: slider.label,
                    min:slider.min,
                    max:slider.max,
                    step:slider.step,
                    default_value: new_data[widget[0]]
                }
                cls.SDB.setKey(addon_data.displayName, `set:${JSON.stringify(updated_data)}`, index_position +1)
                output_data[updated_data.label] = updated_data.default_value;
                continue;
            } 
            else if (verify_data.is_text_field(setting)) {
                const text_feild: TextField = setting
                const updated_data: TextField = {
                    label: text_feild.label,
                    placeholder: text_feild.placeholder,
                    default_value: new_data[widget[0]]
                }
                cls.SDB.setKey(addon_data.displayName, `set:${JSON.stringify(updated_data)}`, index_position +1)
                output_data[updated_data.label] = updated_data.default_value;
                continue;
            } 
            else if (verify_data.is_toggle(setting)) {
                const toggle: Toggle = setting
                const updated_data: Toggle = {
                    label: toggle.label,
                    default_value: new_data[widget[0]]
                }
                cls.SDB.setKey(addon_data.displayName, `set:${JSON.stringify(updated_data)}`, index_position +1)
                output_data[updated_data.label] = updated_data.default_value;
                continue;
            }
            else continue;
        }
        try {
            player.runCommand(`/scriptevent acm_data:${addon_data.displayName.replace('acm.', '')}${JSON.stringify(output_data)}`);
        } catch (error) {
            console.warn('ACM ERROR: Error sending script event: ' + `acm_data:${addon_data.displayName.replace('acm.', '')}${JSON.stringify(output_data)}`)
        }
    }

    private handle_item_event(event: ItemUseAfterEvent): void {
        const item: ItemStack = event.itemStack;
        const type_id: string = item.typeId;
        const player: Player = event.source;
        if (type_id !== this.trigger_item) return;
        if (this.require_tag) if(!player.hasTag(this.tag_id)) return
        this.show_form_home(player)
    }

    private generate_settings_buttons(actionForm: ActionForm): Map<number, ScoreboardObjective>{
        const settings_data: ScoreboardObjective[] = Get.global_acm_settings();
        const button_index = new Map<number, ScoreboardObjective>();
        var slot = 0
        for (const setting of settings_data){
            button_index.set(slot, setting);
            slot += 1
        }
        for (const [_slot, setting] of button_index) {
            try {
                actionForm.addButton(Localize.text(setting, 'addon_id'), Get.icon_path(setting));
            } catch (error) {}
        }
        return button_index
    }
}

export {InterfaceHandler}