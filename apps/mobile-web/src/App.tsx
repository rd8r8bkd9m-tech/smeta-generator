import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { UiKitPage } from './pages/UiKitPage'

// Auth pages
import { PhoneAuthPage } from './pages/auth/PhoneAuthPage'
import { CodeAuthPage } from './pages/auth/CodeAuthPage'

// Main pages
import { FeedPage } from './pages/FeedPage'
import { ViewerPage } from './pages/ViewerPage'
import { TextViewerPage } from './pages/TextViewerPage'
import { CreatePage } from './pages/CreatePage'
import { TextCreatePage } from './pages/TextCreatePage'
import { AudiencePage } from './pages/AudiencePage'
import { ProfilePage } from './pages/ProfilePage'
import { InboxPage } from './pages/InboxPage'
import { SettingsPage } from './pages/SettingsPage'
import { SuccessPage } from './pages/SuccessPage'

function App() {
  return (
    <Routes>
      {/* Dev UI Kit */}
      <Route path="/dev/ui-kit" element={<UiKitPage />} />

      {/* Auth flow */}
      <Route path="/auth/phone" element={<PhoneAuthPage />} />
      <Route path="/auth/code" element={<CodeAuthPage />} />

      {/* Main app with shell */}
      <Route path="/" element={<AppShell />}>
        <Route index element={<FeedPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="viewer/:id" element={<ViewerPage />} />
        <Route path="viewer-text/:id" element={<TextViewerPage />} />
        <Route path="create" element={<CreatePage />} />
        <Route path="create-text" element={<TextCreatePage />} />
        <Route path="audience" element={<AudiencePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="success" element={<SuccessPage />} />
      </Route>
    </Routes>
  )
}

export default App