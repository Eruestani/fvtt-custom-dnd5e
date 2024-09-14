import { CONSTANTS, MODULE } from '../constants.js'
import { Logger, getSetting, setSetting } from '../utils.js'
import { CustomDnd5eForm } from './custom-dnd5e-form.js'
import { setConfig as setAbilities } from '../abilities.js'
import { setConfig as setArmorCalculations } from '../armor-calculations.js'
import { setConfig as setArmorIds } from '../armor-ids.js'
import { setConfig as setArmorTypes } from '../armor-types.js'
import { setConfig as setActorSizes } from '../actor-sizes.js'
import { setConfig as setCurrency } from '../currency.js'
import { setConfig as setDamageTypes } from '../damage-types.js'
import { setConfig as setItemActionTypes } from '../item-action-types.js'
import { setConfig as setItemActivationCostTypes } from '../item-activation-cost-types.js'
import { setConfig as setItemRarity } from '../item-rarity.js'
import { setConfig as setLanguages } from '../languages.js'
import { setConfig as setSenses } from '../senses.js'
import { setConfig as setSkills } from '../skills.js'
import { setConfig as setSpellSchools } from '../spell-schools.js'
import { setConfig as setToolIds } from '../tool-ids.js'
import { setConfig as setWeaponIds } from '../weapon-ids.js'

const listClass = `${MODULE.ID}-list`
const listClassSelector = `.${listClass}`

export class ConfigForm extends CustomDnd5eForm {
    constructor (options = {}) {
        super(options)
    }

    static DEFAULT_OPTIONS = {
        actions: {
            new: ConfigForm.createItem,
            reset: ConfigForm.reset,
            validate: ConfigForm.validate
        },
        form: {
            closeOnSubmit: false,
            handler: ConfigForm.submit
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.CONFIG.TEMPLATE.FORM
        }
    }

    async _prepareContext () {
        this.config = foundry.utils.deepClone(CONFIG.DND5E[this.type])
        this.setting = getSetting(this.settingKey)
        const data = foundry.utils.mergeObject(this.config, this.setting)

        const labelise = (data) => {
            Object.entries(data).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    data[key] = { label: value }
                }

                if (value.children) {
                    labelise(value.children)
                }
            })
        }

        labelise(data)

        const context = { items: data }
        const selects = this._getSelects()
        if (selects) context.selects = selects

        return context
    }

    _getSelects () {
        return null
    }

    static async reset () {
        const reset = async () => {
            await setSetting(this.settingKey, foundry.utils.deepClone(CONFIG.CUSTOM_DND5E[this.type]))
            this.setConfig(CONFIG.CUSTOM_DND5E[this.type])
            this.render(true)
        }

        await foundry.applications.api.DialogV2.confirm({
            window: {
                title: game.i18n.localize('CUSTOM_DND5E.dialog.reset.title')
            },
            content: `<p>${game.i18n.localize('CUSTOM_DND5E.dialog.reset.content')}</p>`,
            modal: true,
            yes: {
                label: game.i18n.localize('CUSTOM_DND5E.yes'),
                callback: async () => {
                    reset()
                }
            },
            no: {
                label: game.i18n.localize('CUSTOM_DND5E.no')
            }
        })
    }

    static async createItem () {
        const list = this.element.querySelector(listClassSelector)
        const scrollable = list.closest('.scrollable')

        const key = foundry.utils.randomID()

        const template = await this._getHtml({ items: { [key]: { fullKey: key, system: false, visible: true } } })

        list.insertAdjacentHTML('beforeend', template)

        const item = list.querySelector(`[data-key="${key}"]`)
        const dragElement = item.querySelector('.custom-dnd5e-drag')

        item.addEventListener('dragend', this._onDragEnd.bind(this))
        item.addEventListener('dragleave', this._onDragLeave.bind(this))
        item.addEventListener('dragover', this._onDragOver.bind(this))
        item.addEventListener('drop', this._onDrop.bind(this))
        dragElement.addEventListener('dragstart', this._onDragStart.bind(this))

        scrollable && (scrollable.scrollTop = scrollable.scrollHeight)
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.CONFIG.TEMPLATE.LIST, data)
        return template
    }

    static async submit (event, form, formData) {
        if (!this.validateFormData(formData)) return

        const propertiesToIgnore = ['children', 'delete', 'key', 'parentKey']
        const changedKeys = this.getChangedKeys(formData)
        const processedFormData = this.processFormData({ formData, changedKeys, propertiesToIgnore })

        this.updateActorKeys({ changedKeys, actorProperties: this.actorProperties })

        this.handleSubmit(processedFormData, this.settingKey, this.setConfig, this.requiresReload)
    }
}

export class AbilitiesForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = true
        this.settingKey = CONSTANTS.ABILITIES.SETTING.KEY
        this.setConfig = setAbilities
        this.type = 'abilities'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-abilities-form`,
        window: {
            title: 'CUSTOM_DND5E.form.abilities.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.ABILITIES.TEMPLATE.FORM
        }
    }

    _getSelects () {
        return {
            type: {
                choices: {
                    mental: 'CUSTOM_DND5E.mental',
                    physical: 'CUSTOM_DND5E.physical'
                }
            }
        }
    }

    async _getHtml (data) {
        const selects = this._getSelects()
        if (selects) data.selects = selects

        const template = await renderTemplate(CONSTANTS.ABILITIES.TEMPLATE.LIST, data)
        return template
    }
}

export class ActorSizesForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.ACTOR_SIZES.SETTING.KEY
        this.setConfig = setActorSizes
        this.type = 'actorSizes'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-actor-sizes-form`,
        window: {
            title: 'CUSTOM_DND5E.form.actorSizes.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.ACTOR_SIZES.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.ACTOR_SIZES.TEMPLATE.LIST, data)
        return template
    }
}

export class ArmorCalculationsForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.ARMOR_CALCULATIONS.SETTING.KEY
        this.setConfig = setArmorCalculations
        this.type = 'armorClasses'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-armor-calculations-form`,
        window: {
            title: 'CUSTOM_DND5E.form.armorCalculations.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.ARMOR_CALCULATIONS.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.ARMOR_CALCULATIONS.TEMPLATE.LIST, data)
        return template
    }
}

export class ArmorIdsForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = true
        this.settingKey = CONSTANTS.ARMOR_IDS.SETTING.KEY
        this.setConfig = setArmorIds
        this.type = 'armorIds'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-armor-ids-form`,
        window: {
            title: 'CUSTOM_DND5E.form.armorIds.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.ARMOR_IDS.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.ARMOR_IDS.TEMPLATE.LIST, data)
        return template
    }
}

export class ArmorTypesForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.ARMOR_TYPES.SETTING.KEY
        this.setConfig = setArmorTypes
        this.type = 'armorTypes'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-armor-types-form`,
        window: {
            title: 'CUSTOM_DND5E.form.armorTypes.title'
        }
    }
}

export class CurrencyForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.CURRENCY.SETTING.KEY
        this.setConfig = setCurrency
        this.type = 'currencies'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-currency-form`,
        window: {
            title: 'CUSTOM_DND5E.form.currency.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.CURRENCY.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.CURRENCY.TEMPLATE.LIST, data)
        return template
    }
}

export class DamageTypesForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.DAMAGE_TYPES.SETTING.KEY
        this.setConfig = setDamageTypes
        this.type = 'damageTypes'
        this.actorProperties = ['system.traits.di.value', 'system.traits.dr.value', 'system.traits.dv.value']
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-damage-types-form`,
        window: {
            title: 'CUSTOM_DND5E.form.damageTypes.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.DAMAGE_TYPES.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.DAMAGE_TYPES.TEMPLATE.LIST, data)
        return template
    }
}

export class ItemActionTypesForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.ITEM_ACTION_TYPES.SETTING.KEY
        this.setConfig = setItemActionTypes
        this.type = 'itemActionTypes'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-item-action-types-form`,
        window: {
            title: 'CUSTOM_DND5E.form.itemActionTypes.title'
        }
    }
}

export class ItemActivationCostTypesForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.ITEM_ACTIVATION_COST_TYPES.SETTING.KEY
        this.setConfig = setItemActivationCostTypes
        this.type = 'abilityActivationTypes'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-item-activation-cost-types-form`,
        window: {
            title: 'CUSTOM_DND5E.form.itemActivationCostTypes.title'
        }
    }
}

export class ItemRarityForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.ITEM_RARITY.SETTING.KEY
        this.setConfig = setItemRarity
        this.type = 'itemRarity'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-item-rarity-form`,
        window: {
            title: 'CUSTOM_DND5E.form.itemRarity.title'
        }
    }
}

export class LanguagesForm extends ConfigForm {
    constructor () {
        super()
        this.nestable = true
        this.requiresReload = false
        this.settingKey = CONSTANTS.LANGUAGES.SETTING.KEY
        this.setConfig = setLanguages
        this.type = 'languages'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-languages-form`,
        window: {
            title: 'CUSTOM_DND5E.form.languages.title'
        }
    }
}

export class SensesForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.SENSES.SETTING.KEY
        this.setConfig = setSenses
        this.type = 'senses'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-senses-form`,
        window: {
            title: 'CUSTOM_DND5E.form.senses.title'
        }
    }
}

export class SkillsForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = true
        this.settingKey = CONSTANTS.SKILLS.SETTING.KEY
        this.setConfig = setSkills
        this.type = 'skills'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-skills-form`,
        window: {
            title: 'CUSTOM_DND5E.form.skills.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.SKILLS.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.SKILLS.TEMPLATE.LIST, data)
        return template
    }
}

export class SpellSchoolsForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = false
        this.settingKey = CONSTANTS.SPELL_SCHOOLS.SETTING.KEY
        this.setConfig = setSpellSchools
        this.type = 'spellSchools'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-spell-schools-form`,
        window: {
            title: 'CUSTOM_DND5E.form.spellSchools.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.SPELL_SCHOOLS.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.SPELL_SCHOOLS.TEMPLATE.LIST, data)
        return template
    }
}

export class ToolIdsForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = true
        this.settingKey = CONSTANTS.TOOL_IDS.SETTING.KEY
        this.setConfig = setToolIds
        this.type = 'toolIds'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-tool-ids-form`,
        window: {
            title: 'CUSTOM_DND5E.form.toolIds.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.TOOL_IDS.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.TOOL_IDS.TEMPLATE.LIST, data)
        return template
    }
}

export class WeaponIdsForm extends ConfigForm {
    constructor () {
        super()
        this.requiresReload = true
        this.settingKey = CONSTANTS.WEAPON_IDS.SETTING.KEY
        this.setConfig = setWeaponIds
        this.type = 'weaponIds'
    }

    static DEFAULT_OPTIONS = {
        id: `${MODULE.ID}-weapon-ids-form`,
        window: {
            title: 'CUSTOM_DND5E.form.weaponIds.title'
        }
    }

    static PARTS = {
        form: {
            template: CONSTANTS.WEAPON_IDS.TEMPLATE.FORM
        }
    }

    async _getHtml (data) {
        const template = await renderTemplate(CONSTANTS.WEAPON_IDS.TEMPLATE.LIST, data)
        return template
    }
}
