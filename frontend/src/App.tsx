import Web3AuthProvider from './providers/Web3AuthProvider';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppRoutes } from './types/enums/app-routes.enum';
import AuthProtectedRoute from './navigation/AuthProtectedRoute';
import SignInPage from './pages/SignInPage/SignInPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import DetailsProjectPage from './pages/DetailsProjectPage/DetailsProjectPage';
import PageWithNavigationTemplate from './components/templates/PageWithNavigationTemplate';
import { store } from './redux/store';
import { FC } from 'react';
import axios from 'axios';
import './App.css';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AboutPage from './pages/AboutPage/AboutPage';
import PortfolioPage from './pages/PortfolioPage/PortfolioPage';
import DetailsUserPage from './pages/DetailsUserPage/DetailsUserPage';
import MessageCenterPage from './pages/MessageCenterPage/MessageCenterPage';
import DetailsChatPage from './pages/DetailsChatPage/DetailsChatPage';
import DashboardPage from 'pages/DashboardPage/DashboardPage';

axios.defaults.baseURL = `${import.meta.env.VITE_BACKEND_URI}/${import.meta.env.VITE_BACKEND_PREFIX || ''}`;
axios.defaults.withCredentials = true;

const App = () => {
  return (
    <ReduxProvider store={store}>
      <Web3AuthProvider>
        <Content />
      </Web3AuthProvider>
    </ReduxProvider>
  );
};

export default App;

const Content: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={AppRoutes.SignIn} Component={SignInPage} />
        <Route path={AppRoutes.SignUp} Component={SignUpPage} />
        <Route Component={PageWithNavigationTemplate}>
          <Route Component={AuthProtectedRoute}>
            <Route path={AppRoutes.Home} Component={ProjectsPage} />
            <Route path={AppRoutes.Portfolio} Component={PortfolioPage} />
            <Route path={AppRoutes.DetailsProject} Component={DetailsProjectPage} />
            <Route path={AppRoutes.DetailsUser} Component={DetailsUserPage} />
            <Route path={AppRoutes.Profile} Component={ProfilePage} />
            <Route path={AppRoutes.Dashboard} Component={DashboardPage} />
            <Route path={AppRoutes.MessageCenter} Component={MessageCenterPage}>
              <Route path={AppRoutes.DetailsChat} Component={DetailsChatPage} />
            </Route>
            <Route path={AppRoutes.Root} element={<Navigate to={AppRoutes.Home} />} />
            <Route path={AppRoutes.About} Component={AboutPage} />
          </Route>
        </Route>
        <Route path={AppRoutes.Any} Component={NotFoundPage} />
      </Routes>
    </BrowserRouter>
  );
};
