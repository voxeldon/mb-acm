import { RawMessage, ScoreboardObjective } from "@minecraft/server";

/**
 * Defines the structure of a Database.
 */
export type Database = ScoreboardObjective | undefined;

/**
 * Defines the structure of a button in the action form.
 */
export type Button = {
    text: string | RawMessage;
    iconPath?: string;
};