
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { StoryCreationProvider } from "@/context/StoryCreationContext";
import { HeaderVisibilityProvider } from "@/context/HeaderVisibilityContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Adventure from "./pages/Adventure";
import Learning from "./pages/Learning";
import Auth from "./pages/Auth";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import MyStories from "./pages/MyStories";
import PublicStories from "./pages/PublicStories";
import Discover from "./pages/Discover";
import StoryViewer from "./pages/StoryViewer";
import StoryCreation from "./pages/StoryCreation";
import CreateGenre from "./pages/CreateGenre";
import CreatePrompt from "./pages/CreatePrompt";
import CreateStartingPoint from "./pages/CreateStartingPoint";
import CreateCustomize from "./pages/CreateCustomize";
import StoryDisplay from "./pages/StoryDisplay";
import Beta from "./pages/Beta";
import Admin from "./pages/Admin";
import Diagnostics from "./pages/Diagnostics";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StoryCreationProvider>
            <HeaderVisibilityProvider>
              <BrowserRouter>
                <div className="min-h-screen relative">
                  {/* Apply the astronaut background */}
                  <div className="scene-bg"></div>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/adventure" element={<Adventure />} />
                      <Route path="/learning" element={<Learning />} />
                      <Route path="/about" element={<About />} />
                      
                      {/* Authentication Routes */}
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/auth/signin" element={<SignIn />} />
                      <Route path="/auth/signup" element={<SignUp />} />
                      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                      
                      {/* Story Creation Flow */}
                      <Route path="/create/genre" element={<CreateGenre />} />
                      <Route path="/create/prompt" element={<CreatePrompt />} />
                      <Route path="/create/starting-point" element={<CreateStartingPoint />} />
                      <Route path="/create/customize" element={<CreateCustomize />} />
                      <Route path="/story/:id" element={<StoryDisplay />} />
                      
                      {/* Legacy Story Creation */}
                      <Route path="/create-story" element={<StoryCreation />} />
                      
                      <Route 
                        path="/my-stories" 
                        element={<MyStories />} 
                      />
                      <Route path="/public-stories" element={<PublicStories />} />
                      <Route path="/discover" element={<Discover />} />
                      <Route path="/story-viewer/:id" element={<StoryViewer />} />
                      <Route path="/beta" element={<Beta />} />
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute>
                            <Admin />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/diagnostics" element={<Diagnostics />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </div>
                <Toaster />
              </BrowserRouter>
            </HeaderVisibilityProvider>
          </StoryCreationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
