import { useState } from 'react'
import { Login } from './components/Login/Login'
import { Home } from './components/Home/Home'
import { ForgotPassword } from './components/ForgotPassword/ForgotPassword'
import { ResetPassword } from './components/ResetPassword/ResetPassword'
import { Reviews } from './components/Reviews/Reviews'
import { Questionnaire } from './components/Questionnaire/Questionnaire'
import { Profile } from './components/Profile/Profile'
import { Notifications } from './components/Notifications/Notifications'
import { initialNotifications } from './components/Notifications/notificationsData'
import { RespondSheet } from './components/Home/RespondSheet'
import { SupportChatFab } from './components/SupportChat/SupportChatFab'
import { SupportChatWindow } from './components/SupportChat/SupportChatWindow'

const TAB_TO_PAGE = {
  home: 'home',
  chat: 'reviews',
  send: 'questionnaire',
  user: 'profile',
}

const AUTH_PAGES = ['login', 'forgot-password', 'reset-password']

function App() {
  const [page, setPage] = useState('login')
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false)
  // Set right before navigating to 'reviews' so it can pre-select a tab
  // there (see handleOpenReviewsTab) -- cleared on every other navigation
  // so it doesn't linger and reapply itself if the user leaves and comes
  // back to "Mes Avis" through the bottom nav instead.
  const [reviewsInitialTab, setReviewsInitialTab] = useState(null)
  // Same deal as reviewsInitialTab, but for deep-linking straight to one
  // review's details sheet (an already-answered negative-review
  // notification) instead of just selecting a tab.
  const [reviewsInitialReview, setReviewsInitialReview] = useState(null)
  // A notification's own review, being responded to from *outside* Mes
  // Avis -- rendered below as an overlay (like SupportChatWindow) instead
  // of inside Notifications itself, since responding to a review isn't
  // something that should visually happen "on top of" the notifications
  // list: navigating to 'reviews' first, in the same click, means the
  // sheet opens over Mes Avis instead.
  const [respondingNotification, setRespondingNotification] = useState(null)

  const handleNavigate = tab => {
    const target = TAB_TO_PAGE[tab]
    if (target) {
      setReviewsInitialTab(null)
      setReviewsInitialReview(null)
      setPage(target)
    }
  }

  const handleOpenReviewsTab = tabLabel => {
    setReviewsInitialTab(tabLabel)
    setReviewsInitialReview(null)
    setPage('reviews')
  }

  const handleOpenReviewDetails = review => {
    setReviewsInitialReview(review)
    setReviewsInitialTab(null)
    setPage('reviews')
  }

  const handleRequestRespond = notification => {
    setRespondingNotification(notification)
    setPage('reviews')
  }

  const handleAddNotification = notification => {
    setNotifications(list => [notification, ...list])
  }

  const handleSubmitNotificationResponse = (review, responseText) => {
    setNotifications(list =>
      list.map(n =>
        n.review?.id === review.id
          ? { ...n, unread: false, actionCompleted: true, review: { ...n.review, response: responseText } }
          : n
      )
    )
    setRespondingNotification(null)
  }

  const renderPage = () => {
    if (page === 'notifications') {
      return (
        <Notifications
          notifications={notifications}
          onChangeNotifications={setNotifications}
          onNavigate={handleNavigate}
          onOpenReviewsTab={handleOpenReviewsTab}
          onOpenReviewDetails={handleOpenReviewDetails}
          onRequestRespond={handleRequestRespond}
        />
      )
    }

    if (page === 'profile') {
      return <Profile onNavigate={handleNavigate} onLogout={() => setPage('login')} />
    }

    if (page === 'reviews') {
      return (
        <Reviews
          onNavigate={handleNavigate}
          initialTabLabel={reviewsInitialTab}
          initialSelectedReview={reviewsInitialReview}
          onAddNotification={handleAddNotification}
        />
      )
    }

    if (page === 'questionnaire') {
      return <Questionnaire onNavigate={handleNavigate} />
    }

    if (page === 'home') {
      return (
        <Home
          onNavigate={handleNavigate}
          onOpenQuestionnaire={() => setPage('questionnaire')}
          onOpenNotifications={() => setPage('notifications')}
          onOpenReviewsTab={handleOpenReviewsTab}
          onAddNotification={handleAddNotification}
          unreadNotifCount={notifications.filter(n => n.unread).length}
        />
      )
    }

    if (page === 'reset-password') {
      return <ResetPassword onBack={() => setPage('login')} onResetPassword={() => setPage('login')} />
    }

    if (page === 'forgot-password') {
      return (
        <ForgotPassword
          onBack={() => setPage('login')}
          onResetPassword={() => setPage('reset-password')}
        />
      )
    }

    return (
      <Login
        onLogin={() => setPage('home')}
        onSkip={() => setPage('home')}
        onForgotPassword={() => setPage('forgot-password')}
      />
    )
  }

  const isAuthPage = AUTH_PAGES.includes(page)

  return (
    <>
      {renderPage()}

      {!isAuthPage && (
        <>
          <SupportChatFab onClick={() => setIsSupportChatOpen(true)} hidden={isSupportChatOpen} />
          {isSupportChatOpen && <SupportChatWindow onClose={() => setIsSupportChatOpen(false)} />}
        </>
      )}

      {respondingNotification && (
        <RespondSheet
          review={{
            ...respondingNotification.review,
            googleShared: respondingNotification.review.googleSharing === 'google-partage',
          }}
          onClose={() => setRespondingNotification(null)}
          onSubmit={handleSubmitNotificationResponse}
        />
      )}
    </>
  )
}

export default App
