/*  
 Author: Donthedev <https://github.com/voxeldon> 
**************************************************
 Copyright (c) Voxel Media Co - Voxel Lab Studios
**************************************************
*/

import { RawMessage, ScoreboardObjective } from "@minecraft/server";
import { RawText } from "../spec/lib";

class Localize {
    private static get_prefix(addon_data: ScoreboardObjective): string {
        const split: string[] = addon_data.displayName.split('.');
        const team_id: string = split[1];
        const addon_id: string = split[2];
        return `acm.${team_id}.${addon_id}.`
    }

    static text(addon_data: ScoreboardObjective, text: string): RawMessage {
        if (text !== '\n') {
            const pre_fix: string = this.get_prefix(addon_data);
            return RawText.TRANSLATE(pre_fix + text);
        } else return RawText.TEXT(text);
    }

    static group(addon_data: ScoreboardObjective, group: RawMessage[]): RawMessage{
        let msgs: RawMessage[] = []
        const pre_fix: string = this.get_prefix(addon_data);
        msgs = group
        msgs.unshift(RawText.TEXT(pre_fix));
        return RawText.MESSAGE(...msgs);
    }
}

export {Localize}