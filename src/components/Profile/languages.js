import iconFlagFrance from '../../assets/questionnaire/icon-flag-france.svg'
import iconFlagCanada from '../../assets/questionnaire/icon-flag-canada.svg'
import iconFlagNetherlands from '../../assets/questionnaire/icon-flag-netherlands.svg'
import iconFlagItaly from '../../assets/questionnaire/icon-flag-italy.svg'

export const LANGUAGES = [
  { code: 'fr-FR', label: 'Français (France)', flag: iconFlagFrance },
  { code: 'en-CA', label: 'Anglais (Canada)', flag: iconFlagCanada },
  { code: 'nl-NL', label: 'Néerlandais (Pays-Bas)', flag: iconFlagNetherlands },
  { code: 'it-IT', label: 'Italien (Italie)', flag: iconFlagItaly },
]

export function languageLabel(code) {
  return LANGUAGES.find(lang => lang.code === code)?.label || code
}
