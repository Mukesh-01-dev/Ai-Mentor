import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";


const Login = lazy(() => import('./pages/auth/Login'));
const Home = lazy(() => import('./pages/Home'));

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

      </Routes>
    </Suspense>
  )
}

export default App