import { useMemo, useState } from 'react'
import { Table, Card, Button, Tag, Typography, Space, Modal, Input, Form, Switch, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { SLOTS, insertSlot, updateSlotStatus, type ResourceSlot, type SlotStatus } from '../../data/mock'

const STATUS_LABEL: Record<SlotStatus, string> = {
  active: '生效中',
  inactive: '已停用',
}

export function SlotListPage() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()
  const [name, setName] = useState('')
  const [toggleSlot, setToggleSlot] = useState<ResourceSlot | null>(null)

  const slots = useMemo(() => SLOTS, [tick])

  const previewId = useMemo(() => `S${String(SLOTS.length + 1).padStart(3, '0')}`, [tick])

  const openCreate = () => {
    setName('')
    form.resetFields()
    setCreateOpen(true)
  }

  const handleCreate = () => {
    if (!name.trim()) {
      message.warning('请填写资源位名称')
      return
    }
    if (SLOTS.some((s) => s.name === name.trim())) {
      message.error('资源位名称已存在，请更换')
      return
    }
    const slot = insertSlot(name.trim())
    message.success(`已创建资源位 ${slot.name}（${slot.id}）`)
    setCreateOpen(false)
    setTick((t) => t + 1)
    navigate(`/slots/${slot.id}`)
  }

  const onToggle = (slot: ResourceSlot) => {
    setToggleSlot(slot)
  }

  const confirmToggle = () => {
    if (!toggleSlot) return
    const next: SlotStatus = toggleSlot.status === 'active' ? 'inactive' : 'active'
    updateSlotStatus(toggleSlot.id, next)
    message.success(`已${next === 'active' ? '启用' : '停用'}资源位 ${toggleSlot.name}`)
    setToggleSlot(null)
    setTick((t) => t + 1)
  }

  const nextStatus = toggleSlot ? (toggleSlot.status === 'active' ? '已停用' : '生效中') : ''

  return (
    <Card className="page-card" bordered>
      <div className="page-header">
        <Typography.Title level={5} className="page-header-title">资源位</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建资源位
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={slots}
        size="small"
        scroll={{ x: 1500 }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 90 },
          { title: '名称（内部）', dataIndex: 'name', width: 200 },
          {
            title: '类型',
            dataIndex: 'type',
            width: 90,
            render: (t: string) => (
              <Tag color={t === 'banner' ? 'blue' : 'purple'}>{t === 'banner' ? 'Banner' : 'Feed'}</Tag>
            ),
          },
          {
            title: '标题（客户端）',
            dataIndex: 'title',
            width: 180,
            render: (v: string | undefined, r: ResourceSlot) =>
              r.type === 'feed' ? (v || '—') : '—',
          },
          {
            title: '副标题（客户端）',
            dataIndex: 'description',
            width: 200,
            render: (v: string | undefined, r: ResourceSlot) =>
              r.type === 'feed' ? (v || '—') : '—',
          },
          { title: '投放位置', dataIndex: 'position', width: 200 },
          { title: 'Item 数', key: 'count', width: 80, render: (_: unknown, r: ResourceSlot) => r.items.length },
          {
            title: '首页排序',
            dataIndex: 'homeOrder',
            width: 90,
            sorter: (a: ResourceSlot, b: ResourceSlot) => (a.homeOrder ?? 99) - (b.homeOrder ?? 99),
            render: (v: number | undefined, r: ResourceSlot) =>
              r.status === 'active' ? (v ?? '—') : <span style={{ color: '#bbb' }}>未启用</span>,
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 110,
            render: (_: unknown, r: ResourceSlot) => (
              <Space size={6}>
                <Switch
                  size="small"
                  checked={r.status === 'active'}
                  onChange={() => onToggle(r)}
                />
                <span style={{ fontSize: 12, color: r.status === 'active' ? '#52c41a' : '#999' }}>
                  {STATUS_LABEL[r.status]}
                </span>
              </Space>
            ),
          },
          { title: '创建时间', dataIndex: 'createdAt', width: 140 },
          { title: '最近一次操作时间', dataIndex: 'updatedAt', width: 150, render: (v: string | undefined) => v ?? '—' },
          { title: '操作人', dataIndex: 'operator', width: 100, render: (v: string | undefined) => v ?? '—' },
          {
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_: unknown, r: ResourceSlot) => (
              <Space>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/slots/${r.id}`)}>
                  编辑
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="新建资源位"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        okText="创建并去配置"
        cancelText="取消"
        width={520}
        destroyOnClose
      >
        <Form layout="vertical" form={form} style={{ marginTop: 12 }}>
          <Form.Item label="资源位名称（内部展示，需唯一）" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：首页轮播 Banner"
              onPressEnter={handleCreate}
              maxLength={32}
              showCount
            />
          </Form.Item>
          <Form.Item label="ID（系统自动生成，唯一）">
            <Input value={previewId} readOnly style={{ background: '#fafafa' }} />
          </Form.Item>
          <div style={{ color: '#999', fontSize: 12 }}>
            提示：名称仅用于内部识别；面向客户的标题/描述将在编辑页按类型配置。
          </div>
        </Form>
      </Modal>

      <Modal
        title="状态变更确认"
        open={!!toggleSlot}
        onCancel={() => setToggleSlot(null)}
        onOk={confirmToggle}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: toggleSlot?.status === 'active' }}
        width={440}
      >
        <div style={{ padding: '4px 0' }}>
          <p style={{ margin: '8px 0' }}>
            即将把资源位 <strong>{toggleSlot?.name}</strong>（{toggleSlot?.id}）的状态由
            <Tag color={toggleSlot?.status === 'active' ? 'success' : 'default'} style={{ margin: '0 6px' }}>
              {toggleSlot ? STATUS_LABEL[toggleSlot.status] : ''}
            </Tag>
            变更为
            <Tag color={nextStatus === '生效中' ? 'success' : 'default'} style={{ margin: '0 6px' }}>
              {nextStatus}
            </Tag>
          </p>
          <p style={{ color: '#999', fontSize: 13, margin: 0 }}>
            {toggleSlot?.status === 'active'
              ? '停用后，该资源位将不再在前端展示，已配置的 Item 不会丢失。'
              : '启用后，该资源位将立即在前端生效展示。'}
          </p>
        </div>
      </Modal>
    </Card>
  )
}
