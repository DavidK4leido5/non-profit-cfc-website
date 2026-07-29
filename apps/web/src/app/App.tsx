import { Route, Router } from "@solidjs/router";
import { MotionProvider } from "@church/ui/motion";
import { Layout } from "./components/layout/Layout";
import { AdminPage } from "./routes/admin/index";
import { BoardPage } from "./routes/board/index";
import { HomePage } from "./routes/index";
import { LoginPage } from "./routes/auth/login";
import { RegisterPage } from "./routes/auth/register";
import { ResourcesPage } from "./routes/resources/index";

export function App() {
  return (
    <MotionProvider>
      <Router root={Layout}>
        <Route path="/" component={HomePage} />
        <Route path="/board" component={BoardPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register" component={RegisterPage} />
        <Route path="/admin" component={AdminPage} />
      </Router>
    </MotionProvider>
  );
}
