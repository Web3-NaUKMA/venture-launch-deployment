import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import projectReducer from './slices/project.slice';
import projectLaunchReducer from './slices/project-launch.slice';
import milestoneReducer from './slices/milestone.slice';
import userReducer from './slices/user.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    milestone: milestoneReducer,
    user: userReducer,
    projectLaunch: projectLaunchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
