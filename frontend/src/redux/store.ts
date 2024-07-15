import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import projectReducer from './slices/project.slice';
import projectLaunchReducer from './slices/project-launch.slice';
import milestoneReducer from './slices/milestone.slice';
import userReducer from './slices/user.slice';
import chatReducer from './slices/chat.slice';
import messageReducer from './slices/message.slice';
import dashboardReducer from './slices/dashboard.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    milestone: milestoneReducer,
    user: userReducer,
    projectLaunch: projectLaunchReducer,
    chat: chatReducer,
    message: messageReducer,
    dashboard: dashboardReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
