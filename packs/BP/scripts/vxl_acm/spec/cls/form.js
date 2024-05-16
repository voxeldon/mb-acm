var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionFormData, ModalFormData, MessageFormData, FormRejectError } from '@minecraft/server-ui';
/**
 * Represents an action form that can be displayed to players.
 */
class ActionForm {
    constructor() {
        this.form = new ActionFormData();
        this.titleText = '';
        this.bodyText = '';
        this.buttons = [];
    }
    /**
     * Sets the title of the action form.
     * @param title {string} - The title text to be displayed at the top of the form.
     * @returns {ActionForm} - The instance of this ActionForm for method chaining.
     */
    setTitle(title) {
        this.titleText = title;
        return this;
    }
    /**
     * Sets the body text of the action form, providing additional context or instructions to the player.
     * @param body {string} - The body text to be displayed below the title.
     * @returns {ActionForm} - The instance of this ActionForm for method chaining.
     */
    setBody(body) {
        this.bodyText = body;
        return this;
    }
    /**
     * Adds a button to the action form with optional icon.
     * @param text {string} - The text displayed on the button.
     * @param iconPath {string} [optional] - The path to the icon displayed alongside the button text.
     * @returns {ActionForm} - The instance of this ActionForm for method chaining.
     */
    addButton(text, iconPath) {
        this.buttons.push({ text, iconPath });
        return this;
    }
    /**
     * Displays the action form to the specified player and handles their response.
     * @param player {Player} - The player to whom the form will be shown.
     * @returns {Promise<any>} - A promise that resolves with the player's response or an error object.
     */
    show(player) {
        return __awaiter(this, void 0, void 0, function* () {
            this.form.title(this.titleText);
            this.form.body(this.bodyText);
            this.buttons.forEach(button => {
                if (button.iconPath) {
                    this.form.button(button.text, button.iconPath);
                }
                else {
                    this.form.button(button.text);
                }
            });
            try {
                const response = yield this.form.show(player);
                return this.handleResponse(response);
            }
            catch (error) {
                return this.handleError(error);
            }
        });
    }
    /**
     * Handles the player's response to the action form.
     * @param response {any} - The response object returned by the form.
     * @returns {any} - An object representing the outcome of the form submission.
     * @private
     */
    handleResponse(response) {
        if (response.canceled) {
            return {
                type: 'canceled',
                reason: response.cancelationReason
            };
        }
        else {
            return {
                type: 'selected',
                selection: response.selection
            };
        }
    }
    /**
     * Handles errors that may occur during the form submission process.
     * @param error {any} - The error object thrown by the form submission.
     * @returns {any} - An object representing the error state, or logs an unexpected error.
     * @private
     */
    handleError(error) {
        if (error instanceof FormRejectError) {
            return {
                type: 'error',
                reason: error.reason
            };
        }
        else {
            console.warn(`Unexpected error: ${error}`);
        }
    }
}
/**
 * Represents a modal form that can be displayed to players.
 */
class ModalForm {
    constructor() {
        this.form = new ModalFormData();
    }
    /**
     * Sets the title of the modal form.
     * @param title {string} - The title text to be displayed at the top of the form.
     * @returns {ModalForm} - The instance of this ModalForm for method chaining.
     */
    setTitle(title) {
        this.form.title(title);
        return this;
    }
    /**
     * Adds a text field input to the modal form.
     * @param label {string} - The label for the text field.
     * @param placeholder {string} [optional] - The placeholder text displayed in the text field before input.
     * @param defaultValue {string} [optional] - The default value pre-filled in the text field.
     * @returns {ModalForm} - The instance of this ModalForm for method chaining.
     */
    addTextField(label, placeholder, defaultValue = '') {
        this.form.textField(label, placeholder, defaultValue);
        return this;
    }
    /**
     * Adds a dropdown input to the modal form with selectable options.
     * @param label {string} - The label for the dropdown.
     * @param options {string[]} - An array of options from which the player can choose.
     * @param defaultValueIndex {number} [optional] - The index of the default option selected in the dropdown.
     * @returns {ModalForm} - The instance of this ModalForm for method chaining.
     */
    addDropdown(label, options, defaultValueIndex = 0) {
        this.form.dropdown(label, options, defaultValueIndex);
        return this;
    }
    /**
    * Adds a slider input to the modal form, allowing for numerical input within a range.
    * @param label {string} - The label for the slider.
    * @param min {number} - The minimum value of the slider.
    * @param max {number} - The maximum value of the slider.
    * @param step {number} - The step increment of the slider.
    * @param defaultValue {number} [optional] - The default value of the slider.
    * @returns {ModalForm} - The instance of this ModalForm for method chaining.
    */
    addSlider(label, min, max, step, defaultValue = min) {
        this.form.slider(label, min, max, step, defaultValue);
        return this;
    }
    /**
     * Adds a toggle input to the modal form, allowing for binary choices (on/off).
     * @param label {string} - The label for the toggle.
     * @param defaultValue {boolean} [optional] - The default state of the toggle (true for on, false for off).
     * @returns {ModalForm} - The instance of this ModalForm for method chaining.
     */
    addToggle(label, defaultValue = false) {
        this.form.toggle(label, defaultValue);
        return this;
    }
    /**
     * Displays the modal form to the specified player and handles their response.
     * @param player {Player} - The player to whom the form will be shown.
     * @returns {Promise<any>} - A promise that resolves with the player's response or an error object.
     */
    show(player) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.form.show(player);
                return this.handleResponse(response);
            }
            catch (error) {
                return this.handleError(error);
            }
        });
    }
    /**
    * Handles the player's response to the modal form.
    * @param response {any} - The response object returned by the form.
    * @returns {any} - An object representing the outcome of the form submission.
    * @private
    */
    handleResponse(response) {
        if (response.canceled) {
            return {
                type: 'canceled',
                reason: response.cancelationReason
            };
        }
        else {
            return {
                type: 'submitted',
                values: response.formValues
            };
        }
    }
    /**
     * Handles errors that may occur during the form submission process.
     * @param error {any} - The error object thrown by the form submission.
     * @returns {any} - An object representing the error state, or logs an unexpected error.
     * @private
     */
    handleError(error) {
        if (error instanceof FormRejectError) {
            return {
                type: 'error',
                reason: error.reason
            };
        }
        else {
            console.warn(`Unexpected error: ${error}`);
        }
    }
}
/**
 * Represents a message form with a simple message and up to two buttons for player responses.
 */
class MessageForm {
    constructor() {
        this.form = new MessageFormData();
        this.titleText = '';
        this.bodyText = '';
        this.button1Text = '';
        this.button2Text = '';
    }
    /**
     * Sets the title of the message form.
     * @param title {string} - The title text to be displayed at the top of the form.
     * @returns {MessageForm} - The instance of this MessageForm for method chaining.
     */
    setTitle(title) {
        this.titleText = title;
        return this;
    }
    /**
     * Sets the body text of the message form, providing the main content of the message.
     * @param body {string} - The body text to be displayed below the title.
     * @returns {MessageForm} - The instance of this MessageForm for method chaining.
     */
    setBody(body) {
        this.bodyText = body;
        return this;
    }
    /**
     * Sets the text for the first button on the message form.
     * @param text {string} - The text displayed on the first button.
     * @returns {MessageForm} - The instance of this MessageForm for method chaining.
     */
    setButton1(text) {
        this.button1Text = text;
        return this;
    }
    /**
     * Sets the text for the second button on the message form.
     * @param text {string} - The text displayed on the second button.
     * @returns {MessageForm} - The instance of this MessageForm for method chaining.
     */
    setButton2(text) {
        this.button2Text = text;
        return this;
    }
    /**
    * Displays the message form to the specified player and handles their response.
    * @param player {Player} - The player to whom the form will be shown.
    * @returns {Promise<any>} - A promise that resolves with the player's response or an error object.
    */
    show(player) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.form.title(this.titleText);
                this.form.body(this.bodyText);
                this.form.button1(this.button1Text);
                this.form.button2(this.button2Text);
                const response = yield this.form.show(player);
                return this.handleResponse(response);
            }
            catch (error) {
                return this.handleError(error);
            }
        });
    }
    /**
     * Handles the player's response to the message form.
     * @param response {any} - The response object returned by the form.
     * @returns {any} - An object representing the outcome of the form submission.
     * @private
     */
    handleResponse(response) {
        if (response.canceled) {
            return {
                type: 'canceled',
                reason: response.cancelationReason
            };
        }
        else {
            return {
                type: 'selected',
                selection: response.selection
            };
        }
    }
    /**
     * Handles errors that may occur during the form submission process.
     * @param error {any} - The error object thrown by the form submission.
     * @returns {any} - An object representing the error state, or logs an unexpected error.
     * @private
     */
    handleError(error) {
        if (error instanceof FormRejectError) {
            return {
                type: 'error',
                reason: error.reason
            };
        }
        else {
            console.warn(`Unexpected error: ${error}`);
        }
    }
}
export { ActionForm, ModalForm, MessageForm };
