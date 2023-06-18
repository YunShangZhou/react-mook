import React, { Component } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import IndexPage from '../pages/index/index';
import LoginPage from '../pages/login';
import AppPage from '../App';

const allRoutes = [
  {
    path: '/',
    element: <AppPage />,
  },
  {
    path: '/index',
    element: <IndexPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
];

const router = createHashRouter(allRoutes);
const RouterInstance = <RouterProvider router={router} />;

export default RouterInstance;
