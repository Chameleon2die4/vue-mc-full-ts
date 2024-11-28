export type LocaleMessages = {
    [key: string]: {
        [key: string]: string
    }
}

export type LocaleOptions = {
    locale: string
    fallback: string
    messages: LocaleMessages
}

class Locale {
    private locale: string = 'en'
    private fallback: string = 'en'
    private messages: LocaleMessages = {
        en: {
            required: 'This field is required',
            email: 'Invalid email address',
            url: 'Invalid URL',
            minLength: 'Must be at least {min} characters',
            maxLength: 'Must be at most {max} characters',
            min: 'Must be at least {min}',
            max: 'Must be at most {max}',
            between: 'Must be between {min} and {max}',
            numeric: 'Must be a number',
            integer: 'Must be an integer',
            alpha: 'Must contain only letters',
            alphanumeric: 'Must contain only letters and numbers',
            date: 'Must be a valid date',
            before: 'Must be before {date}',
            after: 'Must be after {date}',
            match: 'Invalid format',
            in: 'Must be one of: {values}',
            notIn: 'Must not be one of: {values}',
            boolean: 'Must be a boolean',
            object: 'Must be an object',
            array: 'Must be an array'
        },
        es: {
            required: 'Este campo es obligatorio',
            email: 'Dirección de correo inválida',
            url: 'URL inválida',
            minLength: 'Debe tener al menos {min} caracteres',
            maxLength: 'Debe tener como máximo {max} caracteres',
            min: 'Debe ser al menos {min}',
            max: 'Debe ser como máximo {max}',
            between: 'Debe estar entre {min} y {max}',
            numeric: 'Debe ser un número',
            integer: 'Debe ser un número entero',
            alpha: 'Debe contener solo letras',
            alphanumeric: 'Debe contener solo letras y números',
            date: 'Debe ser una fecha válida',
            before: 'Debe ser antes de {date}',
            after: 'Debe ser después de {date}',
            match: 'Formato inválido',
            in: 'Debe ser uno de: {values}',
            notIn: 'No debe ser uno de: {values}',
            boolean: 'Debe ser un valor booleano',
            object: 'Debe ser un objeto',
            array: 'Debe ser un array'
        },
        fr: {
            required: 'Ce champ est requis',
            email: 'Adresse email invalide',
            url: 'URL invalide',
            minLength: 'Doit contenir au moins {min} caractères',
            maxLength: 'Doit contenir au maximum {max} caractères',
            min: 'Doit être au moins {min}',
            max: 'Doit être au maximum {max}',
            between: 'Doit être entre {min} et {max}',
            numeric: 'Doit être un nombre',
            integer: 'Doit être un nombre entier',
            alpha: 'Doit contenir uniquement des lettres',
            alphanumeric: 'Doit contenir uniquement des lettres et des chiffres',
            date: 'Doit être une date valide',
            before: 'Doit être avant {date}',
            after: 'Doit être après {date}',
            match: 'Format invalide',
            in: 'Doit être l\'un des: {values}',
            notIn: 'Ne doit pas être l\'un des: {values}',
            boolean: 'Doit être un booléen',
            object: 'Doit être un objet',
            array: 'Doit être un tableau'
        },
        de: {
            required: 'Dieses Feld ist erforderlich',
            email: 'Ungültige E-Mail-Adresse',
            url: 'Ungültige URL',
            minLength: 'Muss mindestens {min} Zeichen lang sein',
            maxLength: 'Darf maximal {max} Zeichen lang sein',
            min: 'Muss mindestens {min} sein',
            max: 'Darf maximal {max} sein',
            between: 'Muss zwischen {min} und {max} liegen',
            numeric: 'Muss eine Zahl sein',
            integer: 'Muss eine ganze Zahl sein',
            alpha: 'Darf nur Buchstaben enthalten',
            alphanumeric: 'Darf nur Buchstaben und Zahlen enthalten',
            date: 'Muss ein gültiges Datum sein',
            before: 'Muss vor {date} sein',
            after: 'Muss nach {date} sein',
            match: 'Ungültiges Format',
            in: 'Muss eines der folgenden sein: {values}',
            notIn: 'Darf keines der folgenden sein: {values}',
            boolean: 'Muss ein boolescher Wert sein',
            object: 'Muss ein Objekt sein',
            array: 'Muss ein Array sein'
        }
    }

    constructor(options?: Partial<LocaleOptions>) {
        if (options) {
            this.setLocale(options.locale || this.locale)
            this.setFallback(options.fallback || this.fallback)
            if (options.messages) {
                this.setMessages(options.messages)
            }
        }
    }

    setLocale(locale: string): void {
        this.locale = locale
    }

    setFallback(locale: string): void {
        this.fallback = locale
    }

    setMessages(messages: LocaleMessages): void {
        this.messages = { ...this.messages, ...messages }
    }

    addMessages(locale: string, messages: { [key: string]: string }): void {
        this.messages[locale] = { ...this.messages[locale], ...messages }
    }

    getMessage(key: string, params: { [key: string]: any } = {}): string {
        const message = this.messages[this.locale]?.[key] || 
                       this.messages[this.fallback]?.[key] || 
                       key

        return this.interpolate(message, params)
    }

    private interpolate(message: string, params: { [key: string]: any }): string {
        return message.replace(/{([^}]+)}/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match
        })
    }
}

export const locale = new Locale()
export default locale
