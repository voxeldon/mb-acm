```ts
import { AddonData, DropDown, SettingData, Slider, TextField, Toggle } from "./acm";
import { ACM } from "./acm/lib";

const acm_data = new ACM.AcmData();

const newToggle: Toggle = {
    label: 'my_toggle',
    default_value: false
}

const newSilder: Slider = {
    label: 'my_slider',
    min: 0, 
    max: 100,
    step: 1,
    default_value: 0
}

const newDropDown: DropDown = {
    label: 'my_drop_down',
    options: ['my_option0','my_option1','my_option2'],
    default_index_value: 0
}

const newTextFeild: TextField = {
    label: 'my_text_feild',
    placeholder: 'my_text_placeholder'
}

const addon_data: AddonData = {
    addon_id: 'my_addon',
    team_id: 'my_team',
    author: 'addon_author',
    description: ['description', 'description_line2'],
    settings: [newToggle, newSilder, newDropDown, newTextFeild],
    information: [
        'info_header',
        'info_author',
        'info_line0',
        'info_line1'
    ]
}

function on_data_changed(data: SettingData){
    console.warn(JSON.stringify(data))
}

acm_data.generate_addon_data(addon_data);
acm_data.subscribe([addon_data], on_data_changed);
```
acm.my_team.my_addon.addon_id=My Addon Name
acm.my_team.my_addon.description=A breif description of this addon.
acm.my_team.my_addon.description_line2=More breif information about this addon.
acm.my_team.my_addon.addon_author=Donthedev

acm.my_team.my_addon.info_header=MY ADDON NAME!
acm.my_team.my_addon.info_author=Example by Donthedev.
acm.my_team.my_addon.info_line0=This addon lets developers easily create config and help menus for addons.
acm.my_team.my_addon.info_line1=This addon makes configuration simpler for players housing all addon options in a single area.

acm.my_team.my_addon.my_toggle=My Toggle
acm.my_team.my_addon.my_slider=My Slider
acm.my_team.my_addon.my_drop_down=My Drop Down
acm.my_team.my_addon.my_option0=Choice A
acm.my_team.my_addon.my_option1=Choice B
acm.my_team.my_addon.my_option2=Choice C
acm.my_team.my_addon.my_text_feild=My Text Feild
acm.my_team.my_addon.my_text_placeholder=My Placeholder Text