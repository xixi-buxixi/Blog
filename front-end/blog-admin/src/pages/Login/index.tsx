// 登录页
import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store';
import styles from './Login.module.css';

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);
    try {
      const res = await login({
        username: values.username,
        password: values.password,
      });

      message.success('ACCESS GRANTED');
      // 后端返回 {token, userInfo, ...}
      setAuth(res.data.token, res.data.userInfo);
      navigate('/dashboard');
    } catch (error) {
      // 错误已在请求拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
      </div>

      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>$</div>
          </div>
          <h1 className={styles.title}>SYS.LOG</h1>
          <p className={styles.subtitle}>CONTROL PANEL</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          size="large"
          className={styles.form}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'USERNAME REQUIRED' }]}
          >
            <Input
              prefix={<UserOutlined className={styles.inputIcon} />}
              placeholder="USERNAME"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'PASSWORD REQUIRED' }]}
          >
            <Input.Password
              prefix={<LockOutlined className={styles.inputIcon} />}
              placeholder="PASSWORD"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div className={styles.formExtra}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>REMEMBER CREDENTIALS</Checkbox>
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className={styles.submitBtn}
            >
              INITIALIZE LOGIN
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;