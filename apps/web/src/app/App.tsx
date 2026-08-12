import { Route, Router } from "@solidjs/router";
import { MotionProvider } from "@church/ui/motion";
import { Layout } from "./components/layout/Layout";
import { AdminActivityEditPage, AdminActivitiesPage } from "./routes/admin/activities";
import { AdminAssetsPage } from "./routes/admin/assets";
import { AdminArticleEditPage } from "./routes/admin/articles/edit";
import { AdminArticlesPage } from "./routes/admin/articles/index";
import { AdminBoardPage } from "./routes/admin/board/index";
import { AdminBoardPostEditPage } from "./routes/admin/board/post-edit";
import { AdminBoardPostsPage } from "./routes/admin/board/posts";
import { AdminPage } from "./routes/admin/index";
import { BoardPage } from "./routes/board/index";
import { HomePage } from "./routes/index";
import { LoginPage } from "./routes/auth/login";
import { RegisterPage } from "./routes/auth/register";
import { ResourcesPage } from "./routes/resources/index";
import { DashboardHomePage } from "./routes/dashboard/index";
import { DashboardAccountsPage } from "./routes/dashboard/accounts";
import { DashboardUsersPage } from "./routes/dashboard/users";
import { DashboardBranchesPage } from "./routes/dashboard/branches";
import { DashboardBranchSetupPage } from "./routes/dashboard/branch-setup";

export function App() {
  return (
    <MotionProvider>
      <Router root={Layout}>
        <Route path="/" component={HomePage} />
        <Route path="/board" component={BoardPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register" component={RegisterPage} />

        <Route path="/dashboard" component={DashboardHomePage} />
        <Route path="/dashboard/accounts" component={DashboardAccountsPage} />
        <Route path="/dashboard/users" component={DashboardUsersPage} />
        <Route path="/dashboard/branches" component={DashboardBranchesPage} />
        <Route path="/dashboard/branch/setup" component={DashboardBranchSetupPage} />

        <Route path="/admin" component={AdminPage} />
        <Route path="/admin/assets" component={AdminAssetsPage} />
        <Route path="/admin/articles" component={AdminArticlesPage} />
        <Route path="/admin/articles/new" component={AdminArticleEditPage} />
        <Route path="/admin/articles/:id/edit" component={AdminArticleEditPage} />
        <Route path="/admin/board" component={AdminBoardPage} />
        <Route path="/admin/board/:ministryId/posts" component={AdminBoardPostsPage} />
        <Route path="/admin/board/posts/:id/edit" component={AdminBoardPostEditPage} />
        <Route path="/admin/activities" component={AdminActivitiesPage} />
        <Route path="/admin/activities/new" component={AdminActivityEditPage} />
        <Route path="/admin/activities/:id/edit" component={AdminActivityEditPage} />
      </Router>
    </MotionProvider>
  );
}
