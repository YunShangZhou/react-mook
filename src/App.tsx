import React, { MouseEventHandler, PropsWithChildren, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'antd'
import './style.scss';
import { get } from "./utils/request";

const App: React.FC = (props: PropsWithChildren) => {
  const { children } = props
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(
    () => {
      if (pathname === '/') {
        // navigate('/index', { state: { msg: '携带了寂寞' } })
      }
    }
    , [])

  const handleLink = (path: string) => {
    navigate(`/${path}`, { state: { msg: '携带了寂寞' } })
  }

  const handleGetGray = async () => {
    const res = await get('/ad/index/gray')
    console.log(`res`, res)
  }

  return (
    <div id="app">
      <h1>这是App</h1>
      <Button type="dashed" danger onClick={() => handleLink('login')}>跳转至login</Button>
      <Button type="link" onClick={() => handleLink('index')}>跳转至index</Button>
      <Button type="primary" ghost onClick={handleGetGray}>获取gray Json</Button>
    </div>
  )
}

export default App;
