const KNOWLEDGE_BASE = [
  {
    keywords: ['questionnaire', 'sondage', "demande d'avis", 'envoyer un avis', 'recolter'],
    response:
      "Pour envoyer un questionnaire, ouvrez l'onglet Récolter, choisissez le service concerné, sélectionnez un modèle de questionnaire, ajoutez un ou plusieurs destinataires, puis appuyez sur Envoyer. Le questionnaire part par e-mail ou SMS selon les informations renseignées.",
  },
  {
    keywords: ['repondre', 'avis negatif', 'avis', 'review', 'commentaire'],
    response:
      "Pour répondre à un avis, rendez-vous dans Mes Avis ou sur la page d'accueil, ouvrez l'avis concerné puis appuyez sur Répondre. Vous pouvez utiliser une suggestion générée par l'IA ou rédiger votre propre réponse.",
  },
  {
    keywords: ['notification'],
    response:
      "Les notifications sont accessibles via l'icône de cloche sur la page d'accueil. Certaines nécessitent une action (comme répondre à un avis) et restent visibles tant que l'action n'a pas été effectuée.",
  },
  {
    keywords: ['collaborateur', 'equipe', 'employe'],
    response:
      "Pour gérer vos collaborateurs, allez dans Mon Profil puis appuyez sur Voir tout dans la section Mes Collaborateurs. Vous pourrez y ajouter, modifier ou supprimer des membres de votre équipe.",
  },
  {
    keywords: ['entreprise', 'logo', 'couleur', 'marque', 'couverture'],
    response:
      "Vous pouvez modifier les informations de votre entreprise (logo, image de couverture, couleurs de marque) depuis Mon Profil, dans la section Informations Entreprises.",
  },
  {
    keywords: ['mot de passe', 'connexion', 'login', 'connecter', 'identifiant'],
    response:
      "Si vous avez oublié votre mot de passe, utilisez le lien Mot de passe oublié ? sur l'écran de connexion pour recevoir les instructions de réinitialisation.",
  },
  {
    keywords: ['profil'],
    response:
      "Votre profil personnel (Prénom, Nom, Langue, Téléphone, Mail) est modifiable depuis Mon Profil en appuyant sur Modifier mon profil.",
  },
  {
    keywords: ['bonjour', 'salut', 'hello', 'coucou', 'bonsoir'],
    response: 'Bonjour ! Comment puis-je vous aider aujourd’hui ?',
  },
  {
    keywords: ['merci'],
    response: 'Avec plaisir ! N’hésitez pas si vous avez d’autres questions.',
  },
]

const FALLBACK_RESPONSE =
  "Je n'ai pas d'information précise à ce sujet. Vous pouvez reformuler votre question, ou contacter notre équipe support à support@opinionsystem.fr."

export function generateSupportReply(message) {
  const normalized = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

  const match = KNOWLEDGE_BASE.find(entry => entry.keywords.some(keyword => normalized.includes(keyword)))
  return match ? match.response : FALLBACK_RESPONSE
}
