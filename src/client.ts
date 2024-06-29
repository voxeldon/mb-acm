import { RawText } from "./spec/lib"

export const ICON_PATH = {
    exclaim: 'textures/vxl_acm/icons/exclaim',
    missing: 'textures/vxl_acm/icons/missing',
    question: 'textures/vxl_acm/icons/question',
    return: 'textures/vxl_acm/icons/return'
}

export const LANG = {
    title: {
        main: RawText.TRANSLATE('acm.title'),
        short: RawText.TRANSLATE('acm.title_short'),
        info: RawText.TRANSLATE('acm.title_info'),
        settings: RawText.TRANSLATE('acm.title_settings')
    },
    button: {
        okay: RawText.TRANSLATE('acm.button.okay'),
        information: RawText.TRANSLATE('acm.button.information'),
        settings: RawText.TRANSLATE('acm.button.settings'),
        event: RawText.TRANSLATE('acm.button.event'),
        return: RawText.TRANSLATE('acm.button.return')
    },
    body: {
        header: RawText.TRANSLATE('acm.body.header'),
        registered: RawText.TRANSLATE('acm.body.registered')
    }
}