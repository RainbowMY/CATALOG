import { useEffect, useState } from 'react'
import { Card, Button, Space, Modal, Form, Input, Typography, message, Tag, Popconfirm, Tooltip, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { CATEGORY_TREE, type CategoryNode } from '../../data/mock'

const { Title } = Typography

let _uid = 0
const newId = () => `cat_${Date.now()}_${++_uid}`

const isImageIcon = (v?: string) =>
  !!v && (v.startsWith('http') || v.startsWith('data:') || v.startsWith('blob:') || /\.(png|jpe?g|svg|webp|gif)(\?|$)/i.test(v))

/** 一级分类图标：上传图片，表单值为图片 URL / DataURL */
function IconUpload({ value, onChange }: { value?: string; onChange?: (v?: string) => void }) {
  const [list, setList] = useState<UploadFile[]>(() =>
    isImageIcon(value) ? [{ uid: '-1', name: 'icon.png', status: 'done', url: value, thumbUrl: value }] : [],
  )

  useEffect(() => {
    if (isImageIcon(value)) {
      setList([{ uid: '-1', name: 'icon.png', status: 'done', url: value, thumbUrl: value }])
    } else if (!value) {
      setList([])
    }
  }, [value])

  return (
    <div>
      {!isImageIcon(value) && value ? (
        <div style={{ marginBottom: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
          当前为图标名「{value}」，上传图片后将替换为图片图标
        </div>
      ) : null}
      <Upload
        listType="picture-card"
        maxCount={1}
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
        fileList={list}
        beforeUpload={(file) => {
          const reader = new FileReader()
          reader.onload = () => {
            const url = reader.result as string
            setList([{ uid: file.uid, name: file.name, status: 'done', url, thumbUrl: url }])
            onChange?.(url)
          }
          reader.readAsDataURL(file)
          return false
        }}
        onRemove={() => {
          setList([])
          onChange?.(undefined)
        }}
      >
        {list.length >= 1 ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8, fontSize: 12 }}>上传图标</div>
          </div>
        )}
      </Upload>
    </div>
  )
}

export function CategoryTreePage() {
  const [tree, setTree] = useState<CategoryNode[]>(CATEGORY_TREE)
  const [sel1, setSel1] = useState<string | null>(null)
  const [sel2, setSel2] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<CategoryNode | null>(null)
  const [addColumn, setAddColumn] = useState<1 | 2 | 3>(1)
  const [form] = Form.useForm()

  const l1Node = tree.find((n) => n.id === sel1) ?? null
  const l2List = l1Node?.children ?? []
  const l2Node = l2List.find((n) => n.id === sel2) ?? null
  const l3List = l2Node?.children ?? []

  const pickL1 = (id: string) => { setSel1(id); setSel2(null) }
  const pickL2 = (id: string) => setSel2(id)

  const deepClone = (n: CategoryNode): CategoryNode => ({ ...n, children: n.children?.map(deepClone) })

  const updateTree = (fn: (draft: CategoryNode[]) => void) => {
    setTree((prev) => { const d = prev.map(deepClone); fn(d); return d })
  }

  const findIn = (nodes: CategoryNode[], id: string): CategoryNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n
      if (n.children) { const f = findIn(n.children, id); if (f) return f }
    }
    return null
  }

  const removeFrom = (nodes: CategoryNode[], id: string) => {
    const i = nodes.findIndex((n) => n.id === id)
    if (i >= 0) { nodes.splice(i, 1); return true }
    for (const n of nodes) { if (n.children && removeFrom(n.children, id)) return true }
    return false
  }

  const openAdd = (col: 1 | 2 | 3) => {
    setEditingNode(null)
    setAddColumn(col)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (node: CategoryNode) => {
    setEditingNode(node)
    form.setFieldsValue({ nameCn: node.nameCn, nameEn: node.nameEn, icon: node.icon ?? '' })
    setModalOpen(true)
  }

  const isL1Context = editingNode
    ? tree.some((n) => n.id === editingNode.id)
    : addColumn === 1

  const handleSave = () => {
    form.validateFields().then((v) => {
      if (editingNode) {
        updateTree((d) => {
          const n = findIn(d, editingNode.id)
          if (n) {
            n.nameCn = v.nameCn
            n.nameEn = v.nameEn
            if (tree.some((t) => t.id === editingNode.id)) n.icon = v.icon || undefined
          }
        })
        message.success('已修改分类')
      } else {
        const node: CategoryNode = {
          id: newId(),
          nameCn: v.nameCn,
          nameEn: v.nameEn,
          ...(addColumn === 1 && v.icon ? { icon: v.icon } : {}),
        }
        updateTree((d) => {
          if (addColumn === 1) { d.push(node); setSel1(node.id) }
          else if (addColumn === 2 && l1Node) {
            const p = findIn(d, l1Node.id); if (p) { (p.children ??= []).push(node); setSel2(node.id) }
          } else if (addColumn === 3 && l2Node) {
            const p = findIn(d, l2Node.id); if (p) { (p.children ??= []).push(node) }
          }
        })
        message.success('已添加分类')
      }
      setModalOpen(false)
    })
  }

  const handleDelete = (node: CategoryNode) => {
    updateTree((d) => removeFrom(d, node.id))
    if (sel1 === node.id) { setSel1(null); setSel2(null) }
    else if (sel2 === node.id) setSel2(null)
    message.success('已删除该分类')
  }

  // ===== Column renderer =====
  const Column = ({
    title,
    nodes,
    selectedId,
    onSelect,
    onAdd,
    canAdd,
    emptyText,
  }: {
    title: string
    nodes: CategoryNode[]
    selectedId: string | null
    onSelect: (id: string) => void
    onAdd: () => void
    canAdd: boolean
    emptyText: string
  }) => (
    <div style={{ flex: 1, minWidth: 0, border: '1px solid #eef0f3', borderRadius: 8, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #eef0f3', background: '#fafbfc', borderRadius: '8px 8px 0 0' }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{title}</span>
        {canAdd ? (
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={onAdd}>添加</Button>
        ) : null}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 4 }}>
        {nodes.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#bbb', fontSize: 13 }}>{emptyText}</div>
        ) : (
          nodes.map((n) => (
            <div
              key={n.id}
              onClick={() => onSelect(n.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                background: selectedId === n.id ? '#e6f4ff' : 'transparent',
                border: selectedId === n.id ? '1px solid #91caff' : '1px solid transparent',
                marginBottom: 2,
              }}
            >
              <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                {n.icon && isImageIcon(n.icon) ? (
                  <img
                    src={n.icon}
                    alt=""
                    style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: '#f5f5f5' }}
                  />
                ) : n.icon ? (
                  <Tag color="blue" style={{ margin: 0, flexShrink: 0 }}>{n.icon}</Tag>
                ) : null}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.nameCn}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.nameEn}</div>
                </div>
              </div>
              <Space size={0} onClick={(e) => e.stopPropagation()}>
                <Tooltip title="编辑">
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(n)} />
                </Tooltip>
                <Popconfirm title="删除该分类？" description={n.children?.length ? '该分类下有子分类，将一并删除。' : '删除后不可恢复。'} onConfirm={() => handleDelete(n)}>
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            </div>
          ))
        )}
      </div>
    </div>
  )

  return (
    <Card className="page-card" bordered>
      <div className="page-header">
        <Title level={5} className="page-header-title">分类管理</Title>
      </div>

      <div className="page-toolbar" style={{ marginBottom: 16 }}>
        <Tag color="blue">三级分栏</Tag>
        <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>点击左侧逐级选择；中文名称用于内部阅读，英文名称用于前端展示</span>
      </div>

      <div style={{ display: 'flex', gap: 12, minHeight: 480 }}>
        <Column
          title="一级分类"
          nodes={tree}
          selectedId={sel1}
          onSelect={pickL1}
          onAdd={() => openAdd(1)}
          canAdd
          emptyText="暂无一级分类"
        />
        <Column
          title="二级分类"
          nodes={l2List}
          selectedId={sel2}
          onSelect={pickL2}
          onAdd={() => openAdd(2)}
          canAdd={!!l1Node}
          emptyText={l1Node ? '暂无二级分类' : '请先选择一级分类'}
        />
        <Column
          title="三级分类"
          nodes={l3List}
          selectedId={null}
          onSelect={() => {}}
          onAdd={() => openAdd(3)}
          canAdd={!!l2Node}
          emptyText={l2Node ? '暂无三级分类' : '请先选择二级分类'}
        />
      </div>

      <Modal
        title={editingNode ? '编辑分类' : '添加分类'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="中文名称（内部阅读）" name="nameCn" rules={[{ required: true, message: '请输入中文名称' }]}>
            <Input placeholder="如：连衣裙" />
          </Form.Item>
          <Form.Item label="英文名称（前端展示）" name="nameEn" rules={[{ required: true, message: '请输入英文名称' }]}>
            <Input placeholder="如：Dresses" />
          </Form.Item>
          {isL1Context && (
            <Form.Item
              label="L1 图标（仅一级分类）"
              name="icon"
              tooltip="用于前端一级分类展示，上传图片即可"
              extra="支持 PNG / JPG / SVG / WEBP，建议正方形"
            >
              <IconUpload />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  )
}
