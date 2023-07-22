import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Meet from "./pages/Meet"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/meet" element={<Meet/>}/>
    </Routes>
  )
}

export default App
