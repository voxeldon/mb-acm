# ACM LIB

## Overview

This libary allows developers to create configuration and help menus for Minecraft addons.

## Types

### `Toggle`
Represents a toggle setting.

- **Properties:**
  - `label: string` - The name of the setting, can be translated.
  - `default_value: boolean` - The default value of the toggle.

### `Slider`
Represents a slider setting.

- **Properties:**
  - `label: string` - The name of the setting, can be translated.
  - `min: number` - The minimum value of the slider.
  - `max: number` - The maximum value of the slider.
  - `step: number` - The step value for the slider.
  - `default_value: number` - The default value of the slider.

### `DropDown`
Represents a dropdown setting.

- **Properties:**
  - `label: string` - The name of the setting, can be translated.
  - `options: string[]` - The options for the dropdown, can be translated.
  - `default_index_value: number` - The default index of the selected option.

### `TextField`
Represents a text field setting.

- **Properties:**
  - `label: string` - The name of the setting, can be translated.
  - `placeholder: string` - The placeholder text, can be translated.

### `AddonData`
Represents the data for an addon.

- **Properties:**
  - `addon_id: string` - The addon ID, should not use capitals or spaces.
  - `team_id: string` - The team ID, should not use capitals or spaces.
  - `author: string` - The author of the addon, can be translated.
  - `description: string[]` - The description of the addon, can be translated. Each entry in the array will be separated into a newline in the UI.
  - `settings: (Toggle | Slider | DropDown | TextField)[]` - Optional addon settings. Adds a settings button for each entry in the array.
  - `information: string[]` - Optional addon information, can be translated. Each entry in the array will be separated into a newline in the UI.
  - `event_callback: string` - Optional script event string. When pressed, it will run the specified script event.

### `SettingData`
Represents the data for a setting.

## Imports

```ts
import { AddonData, DropDown, SettingData, Slider, TextField, Toggle } from "./acm";
import { ACM } from "./acm/lib";
```

## Functions

### `generate_addon_data`

Generates the addon data on world load.

```ts
acm_data.generate_addon_data(addon_data: AddonData): void;
```

- **Parameters:**
  - `addon_data: AddonData` - The data for the addon.

### `subscribe`

Subscribes to callback updates when addon settings are updated.

```ts
acm_data.subscribe(addon_data: AddonData[], on_data_changed: (data: SettingData) => void): void;
```

- **Parameters:**
  - `addon_data: AddonData[]` - The data for the addon.
  - `on_data_changed: (data: SettingData) => void` - The callback function run when addon settings are updated.

## Example Usage

```ts
const acm_data = new ACM.AcmData();

const newToggle: Toggle = {
    label: 'my_toggle',
    default_value: false
};

const newSlider: Slider = {
    label: 'my_slider',
    min: 0,
    max: 100,
    step: 1,
    default_value: 0
};

const newDropDown: DropDown = {
    label: 'my_drop_down',
    options: ['my_option0', 'my_option1', 'my_option2'],
    default_index_value: 0
};

const newTextField: TextField = {
    label: 'my_text_field',
    placeholder: 'my_text_placeholder'
};

const addon_data: AddonData = {
    addon_id: 'my_addon',
    team_id: 'my_team',
    author: 'addon_author',
    description: ['description', 'description_line2'],
    settings: [newToggle, newSlider, newDropDown, newTextField],
    information: ['info_header', 'info_author', 'info_line0', 'info_line1'],
    event_callback: 'my_team:custom_scriptevent_id'
};

function on_data_changed(data: SettingData) {
    console.warn(JSON.stringify(data));
}

acm_data.generate_addon_data(addon_data);
acm_data.subscribe([addon_data], on_data_changed);
```

## Localization Guide

Follow this syntax for language files to ensure all strings are auto-translated:

acm + addon_id + team_id + entry

When defining AddonData, you can use entry to trigger the translation. 

For example, the author field can be set to a specific entry key, and the corresponding translation will be pulled from the language file.

```
const addon_data: AddonData = {
    author: 'addon_author'
};
acm.my_team.my_addon.addon_author=Donthedev

```

```
acm.my_team.my_addon.addon_id=My Addon Name
acm.my_team.my_addon.description=A brief description of this addon.
acm.my_team.my_addon.description_line2=More brief information about this addon.
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
acm.my_team.my_addon.my_text_field=My Text Field
acm.my_team.my_addon.my_text_placeholder=My Placeholder Text