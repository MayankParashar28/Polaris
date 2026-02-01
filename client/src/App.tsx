import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import InterviewPage from "@/pages/Interview";
import AuthPage from "@/pages/Auth";
import PortfolioBuilder from "@/pages/PortfolioBuilder";
import MarketPulse from "@/pages/MarketPulse";
import Recommendations from "@/pages/Recommendations";
import ResumePreview from "@/pages/ResumePreview";
import CareerQuest from "@/pages/CareerQuest";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import Layout from "@/components/Layout";


function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <Home />
      </Route>

      {/* Protected Routes Wrapped in Layout */}
      <Route path="/dashboard/:id">
        {(params) => (
          <Layout>
            <Dashboard />
          </Layout>
        )}
      </Route>
      <Route path="/interview/:id">
        {(params) => (
          <Layout>
            <InterviewPage />
          </Layout>
        )}
      </Route>
      <Route path="/resume/:id">
        <Layout>
          <ResumePreview />
        </Layout>
      </Route>
      <Route path="/portfolio">
        <Layout>
          <PortfolioBuilder />
        </Layout>
      </Route>
      <Route path="/market">
        <Layout>
          <MarketPulse />
        </Layout>
      </Route>
      <Route path="/recommendations">
        <Layout>
          <Recommendations />
        </Layout>
      </Route>
      <Route path="/quest">
        <Layout>
          <CareerQuest />
        </Layout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
