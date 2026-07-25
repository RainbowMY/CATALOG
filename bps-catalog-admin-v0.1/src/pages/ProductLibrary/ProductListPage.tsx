import { useMemo, useState } from 'react'
import { Table, Card, Input, Select, Button, Tag, Space, Image, Typography, message, Popconfirm, Cascader, Tooltip, Tabs, Modal } from 'antd'
import { SearchOutlined, EditOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { PRODUCTS, CATEGORY_TREE, type CatalogProduct, type ProductStatus } from '../../data/mock'

/** 分类 Cascader：value 为 nameEn，与商品 categoryPath 一致 */
const CATEGORY_CASCADER_OPTIONS = CATEGORY_TREE.map((l1) => ({
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
}))

/** 筛选用 Cascader：value 为分类 id */
const CATEGORY_FILTER_OPTIONS = CATEGORY_TREE.map((l1) => ({
  value: l1.id,
  label: `${l1.nameCn} / ${l1.nameEn}`,
  children: l1.children?.map((l2) => ({
    value: l2.id,
    label: `${l2.nameCn} / ${l2.nameEn}`,
    children: l2.children?.map((l3) => ({
      value: l3.id,
      label: `${l3.nameCn} / ${l3.nameEn}`,
    })),
  })),
}))

const STATUS_MAP: Record<ProductStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  listed: { label: '已上架', color: 'success' },
  unlisted: { label: '已下架', color: 'warning' },
}

const SHIP_OPTIONS = ['US', 'CN', 'UK', 'DE', 'CA', 'FR', 'AU']

export function ProductListPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<CatalogProduct[]>(() => PRODUCTS.map((p) => ({ ...p })))
  const [statusTab, setStatusTab] = useState<ProductStatus>('listed')
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [categoryPath, setCategoryPath] = useState<string[]>([])
  const [shipFrom, setShipFrom] = useState<string | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pageSize, setPageSize] = useState(20)
  const [batchCategoryOpen, setBatchCategoryOpen] = useState(false)
  const [batchCategoryPath, setBatchCategoryPath] = useState<string[]>([])

  const counts = useMemo(() => ({
    listed: products.filter((p) => p.status === 'listed').length,
    unlisted: products.filter((p) => p.status === 'unlisted').length,
    draft: products.filter((p) => p.status === 'draft').length,
  }), [products])

  const rows = useMemo(() => products.filter((p) => {
    if (p.status !== statusTab) return false
    if (appliedKeyword && !p.title.includes(appliedKeyword) && !p.spu.includes(appliedKeyword)) return false
    // 分类筛选统一按 nameEn 比对（商品 categoryPath 存英文路径）
    if (categoryPath[0] && p.categoryPath[0] !== CATEGORY_TREE.find((c) => c.id === categoryPath[0])?.nameEn) return false
    if (categoryPath[1]) {
      const l1 = CATEGORY_TREE.find((c) => c.id === categoryPath[0])
      const l2 = l1?.children?.find((c) => c.id === categoryPath[1])
      if (p.categoryPath[1] !== l2?.nameEn) return false
    }
    if (categoryPath[2]) {
      const l1 = CATEGORY_TREE.find((c) => c.id === categoryPath[0])
      const l2 = l1?.children?.find((c) => c.id === categoryPath[1])
      const l3 = l2?.children?.find((c) => c.id === categoryPath[2])
      if (p.categoryPath[2] !== l3?.nameEn) return false
    }
    if (shipFrom && p.shipFrom !== shipFrom) return false
    return true
  }), [products, statusTab, appliedKeyword, categoryPath, shipFrom])

  const updateStatus = (ids: string[], status: ProductStatus) => {
    setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p)))
  }

  const handleList = (r: CatalogProduct) => {
    updateStatus([r.id], 'listed')
    message.success(`已上架 ${r.title}`)
  }
  const handleDelist = (r: CatalogProduct) => {
    updateStatus([r.id], 'unlisted')
    message.success(`已下架 ${r.title}`)
  }
  const handleDelete = (r: CatalogProduct) => {
    setProducts((prev) => prev.filter((p) => p.id !== r.id))
    setSelectedIds((prev) => prev.filter((id) => id !== r.id))
    message.success(`已删除 ${r.title}`)
  }

  const batchList = () => {
    updateStatus(selectedIds, 'listed')
    message.success(`已批量上架 ${selectedIds.length} 个商品`)
    setSelectedIds([])
  }
  const batchDelist = () => {
    updateStatus(selectedIds, 'unlisted')
    message.success(`已批量下架 ${selectedIds.length} 个商品`)
    setSelectedIds([])
  }

  const openBatchCategory = () => {
    setBatchCategoryPath([])
    setBatchCategoryOpen(true)
  }

  const confirmBatchCategory = () => {
    if (batchCategoryPath.length !== 3) {
      message.warning('请选择完整的三级分类')
      return
    }
    const path = batchCategoryPath as [string, string, string]
    setProducts((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, categoryPath: path } : p)),
    )
    message.success(`已为 ${selectedIds.length} 个商品配置分类：${path.join(' / ')}`)
    setBatchCategoryOpen(false)
    setBatchCategoryPath([])
    setSelectedIds([])
  }

  const onSearch = () => {
    setAppliedKeyword(keyword)
    setSelectedIds([])
  }

  const onReset = () => {
    setKeyword('')
    setAppliedKeyword('')
    setCategoryPath([])
    setShipFrom(undefined)
    setSelectedIds([])
  }

  const hasSelection = selectedIds.length > 0

  return (
    <Card className="page-card" bordered>
      <div className="page-header">
        <Typography.Title level={5} className="page-header-title">商品库</Typography.Title>
        <Space>
          {hasSelection && (
            <>
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>已选 {selectedIds.length} 项</span>
              <Button icon={<AppstoreOutlined />} onClick={openBatchCategory}>批量分类配置</Button>
              {statusTab === 'listed' ? (
                <Popconfirm title={`确认下架选中的 ${selectedIds.length} 个商品？`} onConfirm={batchDelist}>
                  <Button danger icon={<ArrowDownOutlined />}>批量下架</Button>
                </Popconfirm>
              ) : (
                <Popconfirm title={`确认上架选中的 ${selectedIds.length} 个商品？`} onConfirm={batchList}>
                  <Button type="primary" icon={<ArrowUpOutlined />}>批量上架</Button>
                </Popconfirm>
              )}
              <Button onClick={() => setSelectedIds([])}>取消选择</Button>
            </>
          )}
        </Space>
      </div>

      <Tabs
        activeKey={statusTab}
        onChange={(k) => { setStatusTab(k as ProductStatus); setSelectedIds([]) }}
        items={[
          { key: 'listed', label: `已上架 (${counts.listed})` },
          { key: 'unlisted', label: `已下架 (${counts.unlisted})` },
          { key: 'draft', label: `草稿箱 (${counts.draft})` },
        ]}
      />

      <div className="page-toolbar">
        <Input
          placeholder="搜索商品名称 / SPU"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={onSearch}
          style={{ width: 260 }}
          allowClear
        />
          <Cascader
            placeholder="分类"
            style={{ width: 220 }}
            allowClear
            changeOnSelect
            value={categoryPath}
            onChange={(v) => setCategoryPath((v as string[]) ?? [])}
            options={CATEGORY_FILTER_OPTIONS}
          />
          <Select
            placeholder="Ship From"
            style={{ width: 140 }}
            allowClear
            value={shipFrom}
            onChange={setShipFrom}
            options={SHIP_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>查询</Button>
          <Button onClick={onReset}>重置</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={rows}
        size="small"
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => setSelectedIds(keys as string[]),
        }}
        expandable={{
          expandedRowRender: (record: CatalogProduct) => (
            <Table
              rowKey="key"
              size="small"
              pagination={false}
              dataSource={record.specs}
              columns={[
                {
                  title: '规格图',
                  dataIndex: 'image',
                  width: 60,
                  render: (src: string) => <Image src={src} width={36} height={36} />,
                },
                { title: 'SKU', dataIndex: 'sku', width: 200 },
                { title: '颜色', dataIndex: 'color', width: 100 },
                { title: '尺码', dataIndex: 'size', width: 80 },
                { title: '价格(USD)', dataIndex: 'priceUsd', width: 100, render: (v: number) => `$${v}` },
                { title: '库存', dataIndex: 'inventory', width: 100, render: (v: number) => v.toLocaleString() },
              ]}
            />
          ),
        }}
        columns={[
          {
            title: '商品标题',
            dataIndex: 'title',
            width: 220,
            render: (_: string, r: CatalogProduct) => (
              <Space>
                <Image src={r.mainImage} width={36} height={36} />
                <Tooltip title={
                  <div>
                    <div>item_id: {r.itemId}</div>
                    <div>SPU: {r.spu}</div>
                  </div>
                }>
                  <div style={{ fontWeight: 500, cursor: 'default' }}>{r.title}</div>
                </Tooltip>
              </Space>
            ),
          },
          {
            title: '商品描述',
            dataIndex: 'description',
            width: 200,
            ellipsis: true,
            render: (v: string) => (
              <Typography.Text
                type="secondary"
                style={{ fontSize: 13 }}
                ellipsis={{ tooltip: v }}
              >
                {v}
              </Typography.Text>
            ),
          },
          { title: '一级分类', key: 'cat1', width: 140, ellipsis: true, render: (_: unknown, r: CatalogProduct) => r.categoryPath[0] },
          { title: '二级分类', key: 'cat2', width: 140, ellipsis: true, render: (_: unknown, r: CatalogProduct) => r.categoryPath[1] },
          { title: '三级分类', key: 'cat3', width: 140, ellipsis: true, render: (_: unknown, r: CatalogProduct) => r.categoryPath[2] },
          {
            title: '状态',
            dataIndex: 'status',
            width: 90,
            render: (s: ProductStatus) => <Tag color={STATUS_MAP[s].color}>{STATUS_MAP[s].label}</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            width: 220,
            fixed: 'right',
            render: (_: unknown, r: CatalogProduct) => (
              <Space size={4}>
                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/products/${r.id}`)}>
                  编辑
                </Button>
                {r.status === 'listed' && (
                  <Popconfirm title="确认下架该商品？" onConfirm={() => handleDelist(r)}>
                    <Button type="link" size="small" icon={<ArrowDownOutlined />}>下架</Button>
                  </Popconfirm>
                )}
                {r.status === 'unlisted' && (
                  <Popconfirm title="确认上架该商品？" onConfirm={() => handleList(r)}>
                    <Button type="link" size="small" icon={<ArrowUpOutlined />}>上架</Button>
                  </Popconfirm>
                )}
                {r.status === 'draft' && (
                  <Popconfirm title="确认上架该商品？" onConfirm={() => handleList(r)}>
                    <Button type="link" size="small" icon={<ArrowUpOutlined />}>上架</Button>
                  </Popconfirm>
                )}
                <Popconfirm title="确认删除该商品？" description="删除后不可恢复" onConfirm={() => handleDelete(r)}>
                  <Button type="link" danger size="small" icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100],
          onShowSizeChange: (_, size) => setPageSize(size),
          showTotal: (total) => `共 ${total} 个商品`,
        }}
      />

      <Modal
        title="批量分类配置"
        open={batchCategoryOpen}
        onCancel={() => { setBatchCategoryOpen(false); setBatchCategoryPath([]) }}
        onOk={confirmBatchCategory}
        okText="确认配置"
        cancelText="取消"
        destroyOnHidden
        width={480}
      >
        <div style={{ marginBottom: 12, color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>
          将为已选的 <Typography.Text strong>{selectedIds.length}</Typography.Text> 个商品统一设置分类（须选满三级）。
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>
          选择分类
        </div>
        <Cascader
          placeholder="请选择一 / 二 / 三级分类"
          style={{ width: '100%' }}
          value={batchCategoryPath}
          onChange={(v) => setBatchCategoryPath((v as string[]) ?? [])}
          options={CATEGORY_CASCADER_OPTIONS}
          showSearch
        />
      </Modal>
    </Card>
  )
}
