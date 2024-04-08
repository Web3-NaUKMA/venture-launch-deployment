import Web3AuthContext from './contexts/Web3AuthContext';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppRoutes } from './types/enums/app-routes.enum';
import AuthProtectedRoute from './navigation/AuthProtectedRoute';
import SignInPage from './pages/SignInPage/SignInPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import AccountRegistrationPage from './pages/AccountRegistrationPage/AccountRegistrationPage';
import DetailsProjectPage from './pages/DetailsProjectPage/DetailsProjectPage';
import PageWithNavigationTemplate from './components/templates/PageWithNavigationTemplate';
import { store } from './redux/store';
import { FC } from 'react';
import axios from 'axios';
import './App.css';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AboutPage from './pages/AboutPage/AboutPage';
import PortfolioPage from './pages/PortfolioPage/PortfolioPage';

axios.defaults.baseURL = `${import.meta.env.VITE_BACKEND_HOST}:${
  import.meta.env.VITE_BACKEND_PORT || 8000
}/${import.meta.env.VITE_BACKEND_PREFIX || ''}`;
axios.defaults.withCredentials = true;

const App = () => {
  return (
    <ReduxProvider store={store}>
      <Web3AuthContext>
        <Content />
      </Web3AuthContext>
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
        <Route path={AppRoutes.AccountRegistration} Component={AccountRegistrationPage} />

        <Route Component={PageWithNavigationTemplate}>
          <Route Component={AuthProtectedRoute}>
            <Route path={AppRoutes.Projects} Component={ProjectsPage} />
            <Route path={AppRoutes.Portfolio} Component={PortfolioPage} />
            <Route path={AppRoutes.DetailsProject} Component={DetailsProjectPage} />
            <Route path={AppRoutes.Profile} Component={ProfilePage} />
          </Route>
          <Route path={AppRoutes.Root} element={<Navigate to={AppRoutes.Projects} />} />
          <Route path={AppRoutes.About} Component={AboutPage} />
        </Route>
        <Route path={AppRoutes.Any} Component={NotFoundPage} />
      </Routes>
    </BrowserRouter>
  );
};
