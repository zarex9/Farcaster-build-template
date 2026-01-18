import { useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router"
import sdk from "@farcaster/miniapp-sdk"

import clientErrorHandling from "@/lib/clientErrorsReporting"
import Providers from "@/lib/providers"
import { store, updateStore } from "@/lib/store"

import Header from "./components/Header"
import Menu from "./components/Menu"
import Home from "./pages/Home"
import Promote from "./pages/Promote"
import Claim from "./pages/Claim"

export default function App() {
  const { user, client } = store()

  useEffect(() => {
    clientErrorHandling()

    const init = async () => {
      try {
        // Context is synchronous
        const { user, client } = sdk.context
        const capabilities = await sdk.getCapabilities()

        updateStore({ user, client, capabilities })
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Miniapp init failed:", err)
        }
      }

      // Always mark app as ready
      await sdk.actions
        .ready({ disableNativeGestures: true })
        .catch(() => {})

      // QuickAuth (optional but recommended)
      try {
        const { token: session } = await sdk.quickAuth.getToken()
        updateStore({ session })
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("QuickAuth failed:", err)
        }
      }
    }

    init()
  }, [])

  return (
    <div onDragStart={e => e.preventDefault()}>
      <Providers>
        <BrowserRouter>
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/promote" element={<Promote />} />
            <Route path="/claim" element={<Claim />} />
          </Routes>

          <Menu />
        </BrowserRouter>
      </Providers>

      {/* Dev-only debug overlay */}
      {/* {process.env.NODE_ENV === "development" && (
        <pre className="fixed bottom-0 inset-x-0 p-4 text-xs bg-amber-200/50 pointer-events-none">
          {JSON.stringify({ user, client }, null, 2)}
        </pre>
      )} */}
    </div>
  )
}
