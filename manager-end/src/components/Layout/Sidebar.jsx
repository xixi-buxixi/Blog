import { Menu } from 'antd'

function Sidebar({ items, selectedKeys, onClick }) {
  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={selectedKeys}
      items={items}
      onClick={({ key }) => onClick(key)}
    />
  )
}

export default Sidebar