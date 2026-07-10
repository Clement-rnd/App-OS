import { useRef, useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconSave from '../../assets/questionnaire/icon-save.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { ColorPickerPopover } from './ColorPickerPopover'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './EditCompanySheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380
const MAX_BRAND_COLORS = 2

export function EditCompanySheet({ company, onClose, onSave }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [isClosing, setIsClosing] = useState(false)
  const [logoUrl, setLogoUrl] = useState(company.logoUrl)
  const [coverUrl, setCoverUrl] = useState(company.coverUrl)
  const [brandColors, setBrandColors] = useState(company.brandColors.slice(0, MAX_BRAND_COLORS))
  const [openColorIndex, setOpenColorIndex] = useState(null)
  const logoInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const handleFileChange = setter => e => {
    const file = e.target.files?.[0]
    if (file) setter(URL.createObjectURL(file))
  }

  const handleColorChange = (index, value) => {
    setBrandColors(colors => colors.map((color, i) => (i === index ? value : color)))
  }

  const handleSave = () => {
    closeWithAnimation(() => onSave({ ...company, logoUrl, coverUrl, brandColors }))
  }

  return (
    <div className={`edit-company-sheet-overlay${isClosing ? ' edit-company-sheet-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="edit-company-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`edit-company-sheet${isClosing && !isDragClosing ? ' edit-company-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Modifier le profil de l'entreprise"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="edit-company-sheet__handle-row" {...dragHandlers}>
          <span className="edit-company-sheet__handle" />
        </div>

        <div className="edit-company-sheet__appbar">
          <p className="edit-company-sheet__title">Profil de l'entreprise</p>
          <button
            type="button"
            className="edit-company-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="edit-company-sheet__content">
          <div className="edit-company-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS}ms` }}>
            <label className="edit-company-sheet__label">Logo de l'entreprise</label>
            <button
              type="button"
              className="edit-company-sheet__logo-upload"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" />
              ) : (
                <span className="edit-company-sheet__logo-placeholder">{company.name[0]}</span>
              )}
              <span className="edit-company-sheet__upload-badge">
                <img src={iconPencil} alt="" />
              </span>
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="edit-company-sheet__file-input"
              onChange={handleFileChange(setLogoUrl)}
            />
          </div>

          <div className="edit-company-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 50}ms` }}>
            <label className="edit-company-sheet__label">
              Image de couverture (utilisée pour l'attestation électronique)
            </label>
            <button
              type="button"
              className="edit-company-sheet__cover-upload"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverUrl ? (
                <img src={coverUrl} alt="Image de couverture" />
              ) : (
                <span className="edit-company-sheet__cover-placeholder">Ajouter une image</span>
              )}
              <span className="edit-company-sheet__upload-badge">
                <img src={iconPencil} alt="" />
              </span>
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="edit-company-sheet__file-input"
              onChange={handleFileChange(setCoverUrl)}
            />
          </div>

          <div className="edit-company-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 100}ms` }}>
            <label className="edit-company-sheet__label">Couleurs de la marque (2 maximum)</label>
            <div className="edit-company-sheet__colors">
              {brandColors.map((color, index) => (
                <div className="edit-company-sheet__color-field" key={index}>
                  <button
                    type="button"
                    className="edit-company-sheet__swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => setOpenColorIndex(current => (current === index ? null : index))}
                    aria-label={`Modifier la couleur ${index + 1}`}
                  >
                    <img src={iconPencil} alt="" />
                  </button>
                  <span className="edit-company-sheet__swatch-hex">{color}</span>
                  {openColorIndex === index && (
                    <ColorPickerPopover
                      color={color}
                      onChange={value => handleColorChange(index, value)}
                      onClose={() => setOpenColorIndex(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="edit-company-sheet__footer">
          <button type="button" className="edit-company-sheet__save-btn" onClick={handleSave}>
            Enregistrer
            <img src={iconSave} alt="" />
          </button>
          <div className="edit-company-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
