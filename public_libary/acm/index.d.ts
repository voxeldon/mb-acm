export type AddonConfig = {
    form_type: string,
}

export type SettingData = { [key: string]: any }

export type AddonData = {
    addon_id: string,
    team_id: string,
    author: string,
    icon_path?: string,
    description: string[]
    information?: string[]
    settings?: any[]
    event_callback?: string
}

export type AddonSetting = TextField | DropDown | Slider | Toggle

export type TextField = {
    label: string, 
    placeholder: string, 
    default_value?: string
}

export type DropDown = {
    label: string, 
    options: string[], 
    default_index_value?: number
}

export type Slider = {
    label: string, 
    min: number, 
    max: number, 
    step: number, 
    default_value?: number
}

export type Toggle = {
    label: string, 
    default_value: boolean
}