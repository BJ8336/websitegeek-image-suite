import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ToolPlaceholder from './components/ToolPlaceholder'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import NotFound from './pages/NotFound'
import { tools } from './data/toolsConfig'

// Tools with a real implementation. Everything else in toolsConfig still
// falls back to ToolPlaceholder until its phase is built.
const TOOL_COMPONENTS = {}

function App() {
  return (
    <BrowserRouter basename="/image-suite" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          {tools.map((tool) => {
            const ToolComponent = TOOL_COMPONENTS[tool.slug]
            return (
              <Route
                key={tool.slug}
                path={`/${tool.slug}`}
                element={ToolComponent ? <ToolComponent /> : <ToolPlaceholder tool={tool} />}
              />
            )
          })}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
