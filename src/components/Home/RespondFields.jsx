import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import iconRegenerate from '../../assets/home/icon-regenerate.svg'
import './RespondSheet.css'

const SUGGESTIONS = [
  name =>
    `Merci pour votre retour, ${name} ! Nous sommes heureux d'avoir pu vous accompagner et apprécions votre confiance. N'hésitez pas à nous contacter pour tout futur projet.`,
  name =>
    `Nous vous remercions chaleureusement, ${name}, pour ce retour. Toute l'équipe est ravie d'avoir répondu à vos attentes et reste à votre disposition.`,
  name =>
    `${name}, merci beaucoup pour votre confiance et ce message ! C'est un plaisir de vous avoir accompagné, à bientôt pour de nouveaux projets.`,
]

// Regenerating cycles through three phases so it reads as a real
// generation step rather than an instant text swap: the current
// suggestion fades out, a skeleton stands in while "thinking", then the
// new suggestion fades in word by word (unlike other entrances in the
// app, which move as one block) for a subtle "being typed out" feel.
const REGEN_EXIT_MS = 200
const REGEN_LOADING_MS = 900
const WORD_STAGGER_MS = 15
const WORD_ANIMATION_MS = 220
// Longest suggestion is ~27 words; give the stagger + each word's own
// animation enough room to fully finish before phase resets to idle.
const REGEN_ENTER_MS = 30 * WORD_STAGGER_MS + WORD_ANIMATION_MS

// Fallback shape (before any regeneration has ever run, so there's no
// rendered text yet to measure).
const FALLBACK_SKELETON_WIDTHS = [94, 87, 58]
const MIN_SKELETON_WIDTH = 15

// The AI-suggestion box + reply textarea, shared between the standalone
// RespondSheet (opened directly from a review card) and the embedded
// "respond" view inside ReviewDetailsSheet (opened from within it) -- the
// surrounding chrome (review summary, footer buttons) differs between the
// two, but this part is identical.
export function RespondFields({ review, replyText, onReplyTextChange }) {
  const firstName = review.author.trim().split(' ')[0]
  // null = no suggestion generated yet; the AI box starts empty and only
  // fills in once the user explicitly asks for one via "Générer".
  const [suggestionIndex, setSuggestionIndex] = useState(null)
  const [regenPhase, setRegenPhase] = useState('idle') // 'idle' | 'exiting' | 'loading' | 'entering'
  const [skeletonLineWidths, setSkeletonLineWidths] = useState(FALLBACK_SKELETON_WIDTHS)
  const [aiContentHeight, setAiContentHeight] = useState(null)
  // Whether "Utiliser" is currently typing the suggestion into the reply
  // textarea (see handleUseSuggestion) -- disables the fields it'd race
  // with while it's revealing.
  const [isUsingSuggestion, setIsUsingSuggestion] = useState(false)
  const regenTimeoutRef = useRef(null)
  const useTimeoutRef = useRef(null)
  const textRef = useRef(null)
  const aiContentRef = useRef(null)

  useEffect(
    () => () => {
      clearTimeout(regenTimeoutRef.current)
      clearTimeout(useTimeoutRef.current)
    },
    [],
  )

  // Animate the AI box's height smoothly whenever its content's natural
  // size changes (skeleton <-> text, different line counts, etc.) instead
  // of snapping instantly.
  useLayoutEffect(() => {
    const el = aiContentRef.current
    if (!el) return
    // getBoundingClientRect(), not scrollHeight: Chromium over-counts
    // scrollHeight by one extra row-gap on a `display: flex; gap` child
    // with default `overflow: visible` (the skeleton), so it read 8px
    // taller than the element actually renders -- causing the box to
    // visibly grow then shrink back even though the skeleton is already
    // pixel-matched to the outgoing text.
    const measure = () => setAiContentHeight(el.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [regenPhase, suggestionIndex])

  const hasSuggestion = suggestionIndex != null
  const suggestion = hasSuggestion ? SUGGESTIONS[suggestionIndex % SUGGESTIONS.length](firstName) : ''

  const handleGenerate = () => {
    if (regenPhase !== 'idle') return

    // First generation: nothing rendered yet to fade out or measure a
    // skeleton from, so skip straight to the loading/thinking phase.
    if (!hasSuggestion) {
      setRegenPhase('loading')
      regenTimeoutRef.current = setTimeout(() => {
        setSuggestionIndex(0)
        setRegenPhase('entering')
        regenTimeoutRef.current = setTimeout(() => setRegenPhase('idle'), REGEN_ENTER_MS)
      }, REGEN_LOADING_MS)
      return
    }

    // Match each skeleton bar to the *actual* width of the outgoing
    // text's corresponding wrapped line (not just its line count), so
    // swapping text -> skeleton doesn't change the shape at all, only
    // fade+shimmer. Range.getClientRects() gives one rect per visual line
    // for a plain text node, but once a suggestion has been regenerated
    // once the paragraph is made of per-word <span>s (for the cascade-in
    // animation), and then it instead returns one rect per word/text
    // fragment -- so re-group the raw rects by their vertical position
    // back into one bounding box per line before measuring widths.
    if (textRef.current) {
      const containerWidth = textRef.current.clientWidth
      const range = document.createRange()
      range.selectNodeContents(textRef.current)
      const rawRects = Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0)
      const lines = []
      for (const r of rawRects) {
        const line = lines.find(l => Math.abs(l.top - r.top) < 2)
        if (line) {
          line.left = Math.min(line.left, r.left)
          line.right = Math.max(line.right, r.right)
        } else {
          lines.push({ top: r.top, left: r.left, right: r.right })
        }
      }
      if (lines.length > 0 && containerWidth > 0) {
        setSkeletonLineWidths(
          lines.map(l => Math.max(MIN_SKELETON_WIDTH, Math.min(100, ((l.right - l.left) / containerWidth) * 100))),
        )
      }
    }
    setRegenPhase('exiting')
    regenTimeoutRef.current = setTimeout(() => {
      setRegenPhase('loading')
      regenTimeoutRef.current = setTimeout(() => {
        setSuggestionIndex(i => i + 1)
        setRegenPhase('entering')
        regenTimeoutRef.current = setTimeout(() => setRegenPhase('idle'), REGEN_ENTER_MS)
      }, REGEN_LOADING_MS)
    }, REGEN_EXIT_MS)
  }

  // Reveals the suggestion into the reply textarea word by word, reusing
  // the exact same per-word cascade (.respond-sheet__ai-word, same
  // stagger/duration) as the AI box's own entrance -- see the
  // "respond-sheet__textarea--reveal" render below -- instead of a plain
  // textarea whose value can't be animated per word. Once every word has
  // settled, swap back to the real (now filled-in) textarea.
  const handleUseSuggestion = () => {
    if (!hasSuggestion || isUsingSuggestion) return
    setIsUsingSuggestion(true)
    const revealMs = (suggestion.split(' ').length - 1) * WORD_STAGGER_MS + WORD_ANIMATION_MS
    useTimeoutRef.current = setTimeout(() => {
      onReplyTextChange(suggestion)
      setIsUsingSuggestion(false)
    }, revealMs)
  }

  return (
    <>
      <div className="respond-sheet__ai">
        <div className="respond-sheet__ai-header">
          <p className="respond-sheet__ai-label">✨ Suggestion IA</p>
          <div className="respond-sheet__ai-actions">
            <button
              type="button"
              className="respond-sheet__ai-regenerate"
              onClick={handleGenerate}
              disabled={regenPhase !== 'idle' || isUsingSuggestion}
            >
              <img
                src={iconRegenerate}
                alt=""
                className={regenPhase === 'loading' ? 'respond-sheet__ai-regenerate-icon--spinning' : ''}
              />
              {hasSuggestion ? 'Régénérer' : 'Générer'}
            </button>
            <button
              type="button"
              className="respond-sheet__ai-use"
              onClick={handleUseSuggestion}
              disabled={!hasSuggestion || regenPhase !== 'idle' || isUsingSuggestion}
            >
              Utiliser
            </button>
          </div>
        </div>
        <div className="respond-sheet__ai-content" style={aiContentHeight != null ? { height: aiContentHeight } : undefined}>
          <div ref={aiContentRef}>
            {regenPhase === 'loading' ? (
              <div className="respond-sheet__ai-skeleton" aria-hidden="true">
                {skeletonLineWidths.map((width, i) => (
                  <div key={i} className="respond-sheet__ai-skeleton-line" style={{ width: `${width}%` }} />
                ))}
              </div>
            ) : !hasSuggestion ? (
              <p className="respond-sheet__ai-text respond-sheet__ai-text--placeholder">
                Cliquez sur « Générer » pour obtenir une suggestion de réponse.
              </p>
            ) : (
              <p
                ref={textRef}
                key={suggestionIndex}
                className={`respond-sheet__ai-text${regenPhase === 'exiting' ? ' respond-sheet__ai-text--exiting' : ''}`}
              >
                {regenPhase !== 'exiting'
                  ? // Every suggestion arrives through the generate/regenerate
                    // animation, so it's always rendered as per-word spans
                    // (even once the entrance animation settles) instead of
                    // swapping back to a plain text node -- that swap was a
                    // DOM structure change right after the animation
                    // finished, causing a tiny reflow jump. The spans are
                    // visually identical to plain text once settled, so
                    // nothing is lost by keeping them.
                    suggestion.split(' ').map((word, i) => (
                      // The space is a sibling text node, not inside the
                      // inline-block span -- a trailing space at the edge
                      // of an inline-block's own formatting context gets
                      // collapsed away, which ran every word together.
                      <span key={i}>
                        <span className="respond-sheet__ai-word" style={{ animationDelay: `${i * WORD_STAGGER_MS}ms` }}>
                          {word}
                        </span>{' '}
                      </span>
                    ))
                  : suggestion}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="respond-sheet__message">
        <p className="respond-sheet__message-label">Votre Réponse</p>
        {isUsingSuggestion ? (
          <div className="respond-sheet__textarea respond-sheet__textarea--reveal" aria-hidden="true">
            {suggestion.split(' ').map((word, i) => (
              <span key={i}>
                <span className="respond-sheet__ai-word" style={{ animationDelay: `${i * WORD_STAGGER_MS}ms` }}>
                  {word}
                </span>{' '}
              </span>
            ))}
          </div>
        ) : (
          <textarea
            className="respond-sheet__textarea"
            placeholder="Écrivez votre réponse..."
            value={replyText}
            onChange={e => onReplyTextChange(e.target.value)}
          />
        )}
      </div>
    </>
  )
}
