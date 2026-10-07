import { type ReactNode } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppShell } from "@/components/AppShell";
import Home from "@/pages/Home";
import History from "@/pages/History";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/"><AppShell><Home /></AppShell></Route>
        <Route path="/history"><AppShell><History /></AppShell></Route>
        <Route path="/about"><AppShell><About /></AppShell></Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}

export default App;
