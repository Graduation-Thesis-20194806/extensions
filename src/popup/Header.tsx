import Logo from '@/common/components/Logo'
import { Space } from 'antd'
import { useCallback, useContext } from 'react'
import styled from 'styled-components'
import { RouterContext, RouterEnum } from '.'
import { LogoutOutlined } from '@ant-design/icons'
import { logout } from '@/services/auth'

export default function Header() {
  const { appState, setRouter } = useContext(RouterContext)
  const handleLogout = useCallback(() => {
    logout().then(() => {
      setRouter(RouterEnum.LOGIN)
    })
  }, [setRouter])
  return (
    <HeaderContainer>
      <Logo fontSize={20} />
      <Space style={{ cursor: 'pointer' }} onClick={handleLogout}>
        <span>{appState?.userName}</span>
        <LogoutOutlined style={{ fontSize: 20 }} />
      </Space>
    </HeaderContainer>
  )
}

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
