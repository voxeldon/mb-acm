import { AddonData, DropDown, SettingData, Slider, TextField, Toggle } from "./acm";
import { ACM } from "./acm/lib";
import { InterfaceHandler } from "./utl/interface_handler";

const acm_interface = new InterfaceHandler();
acm_interface.on_ready();

const acm_data = new ACM.AcmData();

const newToggle: Toggle = {
    label: 'require_tag',
    default_value: false
}

const newTextFeild: TextField = {
    label: 'tag_id',
    placeholder: 'require_tag_place_holder'
}

const addon_data: AddonData = {
    addon_id: 'acm_core',
    team_id: 'vxl',
    author: 'addon_author',
    icon_path: 'textures/vxl_acm/icons/acm_icon',
    description: ['description'],
    settings: [newToggle, newTextFeild],
    information: [
        'info_header','\n',
        'info_author','\n',
        'info_line0','\n',
        'info_line1'
    ],
    event_callback: 'acm:my_event'
}

function on_data_changed(data: SettingData){
    acm_interface.update_settings(data);
}

acm_data.generate_addon_data(addon_data);
acm_data.subscribe([addon_data], on_data_changed);
