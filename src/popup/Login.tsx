import { LoginDto } from '@/common/types/user'
import { login } from '@/services/auth'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Form, Input } from 'antd'
import { useContext, useState } from 'react'
import { RouterContext, RouterEnum } from '.'

const LoginContainer = () => {
  const { setRouter } = useContext(RouterContext)
  const [error, setError] = useState<string | undefined>()
  const onFinish = async (values: LoginDto) => {
    try {
      const res = await login(values)
      if (!res) {
        setError('There are something wrong')
      } else {
        setRouter(RouterEnum.CHANGE_PROJECT)
      }
    } catch (e: any) {
      setError(e.message)
    }
  }
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 className="container-label">Login</h1>
      </div>
      <Form
        name="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        {error && (
          <Form.Item>
            <Alert type="error" message={error} />
          </Form.Item>
        )}
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: 'Please input your Email!',
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your Password!',
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Flex gap={'1rem'} align="center">
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
            Or <a href="">register now!</a>
          </Flex>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginContainer
