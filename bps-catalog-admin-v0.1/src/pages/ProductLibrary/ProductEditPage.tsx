import { useState } from 'react'
import {
  Card, Form, Input, Button, Select, Upload, Space, Table, Image, Tag, Typography, message, Popconfirm, Tabs, InputNumber, Cascader, Alert,
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getProduct, CATEGORY_TREE, type SpecRow, type ProductStatus } from '../../data/mock'

const { TextArea } = Input
const { Title } = Typography

const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿' },
  { value: 'listed', label: '已上架' },
  { value: 'unlisted', label: '已下架' },
]

const COUNTRIES = ['US', 'CN', 'UK', 'DE', 'CA', 'FR', 'AU']
const SHIP_METHODS = ['Standard', 'Express', 'Economy', 'Standard', 'Express', 'Standard', 'Economy']

interface ShipRow {
  country: string
  cost: number
  method: string
  processing: string
  delivery: string
  note: string
}

export function ProductEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const product = getProduct(id)
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'draft')
  const [specs, setSpecs] = useState<SpecRow[]>(product?.specs ?? [])
  const [shipRows, setShipRows] = useState<ShipRow[]>(
    product?.shipping ?? COUNTRIES.map((c, i) => ({
      country: c,
      cost: Number((2 + i * 1.3).toFixed(2)),
      method: SHIP_METHODS[i],
      processing: `${1 + (i % 3)}-${2 + (i % 3)} business days`,
      delivery: `${5 + (i % 4)}-${9 + (i % 4)} business days`,
      note: i % 2 === 0 ? 'Tax included' : 'Remote areas may incur surcharge',
    }))
  )

  if (!product) {
    return <Card>未找到该商品</Card>
  }

  const removeSpec = (key: string) => {
    setSpecs((prev) => prev.filter((s) => s.key !== key))
    message.success('已删除该规格（不影响产品库）')
  }

  return (
    <div className="page-section">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <Space size={12} align="center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>返回</Button>
          <Title level={5} className="page-header-title">编辑商品 · {product.spu}</Title>
          <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>item_id: {product.itemId}</span>
        </Space>
      </div>

      {/* Read-only sync info bar */}
      <Card size="small" style={{ background: '#fafbfc', borderColor: '#eef0f3' }}>
        <Space split={<span style={{ color: '#e8e8e8' }}>|</span>} wrap>
          <span><span style={{ color: 'rgba(0,0,0,0.45)' }}>SPU：</span>{product.spu}</span>
          <span><span style={{ color: '#999' }}>分类：</span>{product.categoryPath.join(' / ')}</span>
          <span><span style={{ color: '#999' }}>Ship From：</span>{product.shipFrom}</span>
          <span><span style={{ color: '#999' }}>同步时间：</span>{product.syncedAt}</span>
          {product.listedAt && <span><span style={{ color: '#999' }}>上架时间：</span>{product.listedAt}</span>}
        </Space>
      </Card>

      {/* Top-level tabs */}
      <Tabs
        defaultActiveKey="display"
        items={[
          {
            key: 'display',
            label: '前台展示配置',
            children: (
              <Tabs
                defaultActiveKey="basic"
                items={[
                  {
                    key: 'basic',
                    label: '基础展示',
                    children: (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Card title="基础信息" size="small">
                          <Form layout="vertical" initialValues={{
                            title: product.title,
                            description: product.description,
                            tags: product.tags[0] ?? undefined,
                            material: product.material,
                            displayPriceUsd: product.displayPriceUsd ?? product.priceUsd,
                            displayInventory: product.displayInventory ?? product.inventory,
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                              <Form.Item label="商品标题" name="title" rules={[{ required: true }]}>
                                <Input placeholder="面向客户的商品标题" />
                              </Form.Item>
                              <Form.Item label="标签" name="tags" tooltip="每个商品仅可设置一个标签">
                                <Select
                                  allowClear
                                  placeholder="请选择标签（可不选）"
                                  options={[
                                    { value: 'Best Seller', label: 'Best Seller' },
                                    { value: 'New', label: 'New' },
                                  ]}
                                />
                              </Form.Item>
                            </div>
                            <Form.Item label="商品描述" name="description">
                              <TextArea rows={2} placeholder="面向客户的简短描述" />
                            </Form.Item>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                              <Form.Item label="材质（Material）" name="material">
                                <Input placeholder="如 Cotton / ABS Plastic" />
                              </Form.Item>
                              <Form.Item label="展示价（USD）" name="displayPriceUsd" tooltip="商品级展示价，供卡片/列表展示；与规格价独立">
                                <InputNumber min={0} step={0.01} prefix="$" style={{ width: '100%' }} />
                              </Form.Item>
                              <Form.Item label="展示库存" name="displayInventory" tooltip="商品级展示库存，供卡片/列表展示；与规格库存独立">
                                <InputNumber min={0} step={1} style={{ width: '100%' }} />
                              </Form.Item>
                            </div>
                            <div style={{ display: 'flex', gap: 24 }}>
                              <Form.Item label="主图" name="mainImage" style={{ marginBottom: 0 }}>
                                <Upload listType="picture-card" maxCount={1} defaultFileList={[{
                                  uid: '-1', name: 'main.png', status: 'done', thumbUrl: product.mainImage,
                                }]}>
                                  <div><PlusOutlined /><div style={{ fontSize: 12 }}>上传主图</div></div>
                                </Upload>
                              </Form.Item>
                              <Form.Item label="图集" name="gallery" style={{ marginBottom: 0 }}>
                                <Upload listType="picture-card" multiple defaultFileList={product.gallery.map((g, i) => ({
                                  uid: `-${i}`, name: `img${i}.png`, status: 'done', thumbUrl: g,
                                }))}>
                                  <div><PlusOutlined /><div style={{ fontSize: 12 }}>上传</div></div>
                                </Upload>
                              </Form.Item>
                            </div>
                          </Form>
                        </Card>

                        <Card title="富文本详情" size="small" extra={<Tag color="blue">独立模块</Tag>}>
                          <Form layout="vertical" initialValues={{ detailCopy: product.detailCopy }}>
                            <Form.Item name="detailCopy" style={{ marginBottom: 0 }}>
                              <TextArea rows={8} placeholder="面向客户的图文详情（富文本编辑器）" />
                            </Form.Item>
                          </Form>
                        </Card>
                      </div>
                    ),
                  },
                  {
                    key: 'specs',
                    label: '规格信息调整',
                    children: (
                      <Card
                        title="规格图与信息（同步自动填充，可修改）"
                        size="small"
                        extra={<Tag color="blue">可编辑</Tag>}
                      >
                        <Table
                          rowKey="key"
                          size="small"
                          pagination={false}
                          dataSource={specs}
                          columns={[
                            {
                              title: '规格图',
                              dataIndex: 'image',
                              width: 100,
                              render: (src: string) => (
                                <Space>
                                  <Image src={src} width={40} height={40} />
                                  <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => message.info('替换规格图（示意）')}>替换</Button>
                                </Space>
                              ),
                            },
                            { title: 'SKU', dataIndex: 'sku', width: 180 },
                            {
                              title: '颜色',
                              dataIndex: 'color',
                              width: 110,
                              render: (val: string, r: SpecRow) => (
                                <Input
                                  size="small"
                                  value={val}
                                  onChange={(e) => setSpecs((prev) => prev.map((s) => s.key === r.key ? { ...s, color: e.target.value } : s))}
                                />
                              ),
                            },
                            {
                              title: '尺码',
                              dataIndex: 'size',
                              width: 90,
                              render: (val: string, r: SpecRow) => (
                                <Input
                                  size="small"
                                  value={val}
                                  onChange={(e) => setSpecs((prev) => prev.map((s) => s.key === r.key ? { ...s, size: e.target.value } : s))}
                                />
                              ),
                            },
                            {
                              title: '价格(USD)',
                              dataIndex: 'priceUsd',
                              width: 120,
                              render: (val: number, r: SpecRow) => (
                                <InputNumber
                                  size="small"
                                  value={val}
                                  min={0}
                                  step={0.01}
                                  prefix="$"
                                  onChange={(v) => setSpecs((prev) => prev.map((s) => s.key === r.key ? { ...s, priceUsd: v ?? 0 } : s))}
                                />
                              ),
                            },
                            {
                              title: '库存',
                              dataIndex: 'inventory',
                              width: 110,
                              render: (val: number, r: SpecRow) => (
                                <InputNumber
                                  size="small"
                                  value={val}
                                  min={0}
                                  step={1}
                                  onChange={(v) => setSpecs((prev) => prev.map((s) => s.key === r.key ? { ...s, inventory: v ?? 0 } : s))}
                                />
                              ),
                            },
                            {
                              title: '操作',
                              key: 'action',
                              width: 80,
                              render: (_: unknown, r: SpecRow) => (
                                <Popconfirm title="删除该规格？不影响产品库。" onConfirm={() => removeSpec(r.key)}>
                                  <Button type="link" danger size="small" icon={<DeleteOutlined />}>删除</Button>
                                </Popconfirm>
                              ),
                            },
                          ]}
                        />
                      </Card>
                    ),
                  },
                  {
                    key: 'shipping',
                    label: '运费调整',
                    children: (
                      <Card title="不同国家运费与时效" size="small">
                        <Table
                          rowKey="country"
                          size="small"
                          pagination={false}
                          dataSource={shipRows}
                          scroll={{ x: 900 }}
                          columns={[
                            { title: '国家', dataIndex: 'country', width: 80, fixed: 'left' },
                            {
                              title: '运费(USD)',
                              dataIndex: 'cost',
                              width: 120,
                              render: (val: number, r: ShipRow) => (
                                <InputNumber
                                  size="small"
                                  value={val}
                                  min={0}
                                  step={0.01}
                                  prefix="$"
                                  onChange={(v) => setShipRows((prev) => prev.map((s) => s.country === r.country ? { ...s, cost: v ?? 0 } : s))}
                                />
                              ),
                            },
                            {
                              title: '运输方式',
                              dataIndex: 'method',
                              width: 130,
                              render: (val: string, r: ShipRow) => (
                                <Select
                                  size="small"
                                  value={val}
                                  style={{ width: '100%' }}
                                  onChange={(v) => setShipRows((prev) => prev.map((s) => s.country === r.country ? { ...s, method: v } : s))}
                                  options={['Standard', 'Express', 'Economy'].map((m) => ({ value: m, label: m }))}
                                />
                              ),
                            },
                            {
                              title: '处理时效',
                              dataIndex: 'processing',
                              width: 140,
                              render: (val: string, r: ShipRow) => (
                                <Input
                                  size="small"
                                  value={val}
                                  placeholder="如 1-2 天"
                                  onChange={(e) => setShipRows((prev) => prev.map((s) => s.country === r.country ? { ...s, processing: e.target.value } : s))}
                                />
                              ),
                            },
                            {
                              title: '送达时效',
                              dataIndex: 'delivery',
                              width: 140,
                              render: (val: string, r: ShipRow) => (
                                <Input
                                  size="small"
                                  value={val}
                                  placeholder="如 5-9 天"
                                  onChange={(e) => setShipRows((prev) => prev.map((s) => s.country === r.country ? { ...s, delivery: e.target.value } : s))}
                                />
                              ),
                            },
                            {
                              title: '说明',
                              dataIndex: 'note',
                              render: (val: string, r: ShipRow) => (
                                <Input
                                  size="small"
                                  value={val}
                                  placeholder="如 含税 / 偏远地区加价"
                                  onChange={(e) => setShipRows((prev) => prev.map((s) => s.country === r.country ? { ...s, note: e.target.value } : s))}
                                />
                              ),
                            },
                          ]}
                        />
                      </Card>
                    ),
                  },
                  {
                    key: 'category',
                    label: '分类配置',
                    children: (
                      <Card title="商品分类配置" size="small">
                        <Alert
                          type="info"
                          showIcon
                          message="此处选择的分类用于前台展示，不依赖产品库原始分类。"
                          style={{ marginBottom: 16 }}
                        />
                        <Form layout="vertical" initialValues={{
                          category: product.categoryPath,
                        }}>
                          <Form.Item label="选择分类（三级）" name="category" rules={[{ required: true }]}>
                            <Cascader
                              placeholder="请选择一级 / 二级 / 三级分类"
                              style={{ width: 480 }}
                              options={CATEGORY_TREE.map((l1) => ({
                                value: l1.nameEn,
                                label: `${l1.nameCn} / ${l1.nameEn}`,
                                children: l1.children?.map((l2) => ({
                                  value: l2.nameEn,
                                  label: `${l2.nameCn} / ${l2.nameEn}`,
                                  children: l2.children?.map((l3) => ({
                                    value: l3.nameEn,
                                    label: `${l3.nameCn} / ${l3.nameEn}`,
                                  })),
                                })),
                              }))}
                              changeOnSelect
                            />
                          </Form.Item>
                          <Form.Item label="产品库原始分类（只读参考）">
                            <Input value={product.categoryPath.join(' / ')} readOnly style={{ width: 480, background: '#fafafa' }} />
                          </Form.Item>
                        </Form>
                      </Card>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: 'library',
            label: '产品库规格详情',
            children: (
              <Card title="同步自产品库的完整规格信息（只读）" size="small">
                <Table
                  rowKey="key"
                  size="small"
                  pagination={false}
                  dataSource={product.specs}
                  columns={[
                    {
                      title: '规格图',
                      dataIndex: 'image',
                      width: 60,
                      render: (s: string) => <Image src={s} width={36} height={36} />,
                    },
                    { title: 'SKU', dataIndex: 'sku', width: 200 },
                    { title: '颜色', dataIndex: 'color', width: 100 },
                    { title: '尺码', dataIndex: 'size', width: 80 },
                    { title: '价格(USD)', dataIndex: 'priceUsd', width: 100, render: (v: number) => `$${v}` },
                    { title: '库存', dataIndex: 'inventory', width: 100, render: (v: number) => v.toLocaleString() },
                  ]}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Status + save (sticky bottom) */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        background: '#fff',
        borderTop: '1px solid #eef0f3',
        borderRadius: 8,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        padding: '12px 16px',
      }}>
        <Space>
          <span style={{ color: '#999' }}>上架状态：</span>
          <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} style={{ width: 120 }} />
          <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('已保存展示配置')}>
            保存
          </Button>
        </Space>
      </div>
    </div>
  )
}
