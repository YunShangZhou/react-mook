import React, { Component } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'

import IndexPage from '../pages/index/index'
import DemoPage from '../pages/demo/index'
import LoginPage from '../pages/login'
import AppPage from '../App'


const allRoutes = [
    {
        path: '/',
        // element: <DemoPage />
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
    {
        path: '/playBar',
        element: <DemoPage />
    }
]

const router = createHashRouter(allRoutes)
const RouterInstance = <RouterProvider router={router} />

export default RouterInstance