import { Route, Switch } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import Home from '@/pages/Home'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-muted-foreground">
                  The page you're looking for doesn't exist.
                </p>
              </div>
            </div>
          </Route>
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  )
}

export default App