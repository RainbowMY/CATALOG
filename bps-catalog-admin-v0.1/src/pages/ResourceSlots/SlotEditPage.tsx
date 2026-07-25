import { useMemo, useState } from 'react'
import {
  Card, Form, Input, InputNumber, Select, Button, Table, Space, Tag, Typography, message,
  Modal, Image, Switch, Popconfirm, Empty, Alert, Divider, Cascader,
} from 'antd'
import {
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, ArrowUpOutlined, ArrowDownOutlined, PictureOutlined, SearchOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getSlot, PRODUCTS, getProduct, genCollectionKey, CATEGORY_TREE,
  type SlotItem, type SlotType, type SlotStatus, type BannerContentType,
} from '../../data/mock'

const { Title } = Typography

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="#eef0f3"/><text x="200" y="105" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#bfbfbf">Banner 图</text></svg>'
)

const CONTENT_OPTIONS: { value: BannerContentType; label: string }[] = [
  { value: 'image', label: '纯图（无跳转）' },
  { value: 'image_link', label: '图 + 链接' },
  { value: 'product_feed', label: 'Feed 流（商品）' },
]

const CONTENT_LABEL: Record<BannerContentType, { label: string; color: string }> = {
  image: { label: '纯图', color: 'cyan' },
  image_link: { label: '图+链接', color: 'orange' },
  product_feed: { label: 'Feed 流', color: 'purple' },
}

export function SlotEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const slot = !isNew ? getSlot(id!) : undefined

  const [type, setType] = useState<SlotType>(slot?.type ?? 'feed')
  const [name, setName] = useState(slot?.name ?? '')
  const [title, setTitle] = useState(slot?.title ?? '')
  const [description, setDescription] = useState(slot?.description ?? '')
  const [status, setStatus] = useState<SlotStatus>(slot?.status ?? 'active')
  const [position, setPosition] = useState(slot?.position ?? '')
  const [homeOrder, setHomeOrder] = useState<number>(slot?.homeOrder ?? 99)
  const [items, setItems] = useState<SlotItem[]>(slot?.items ?? [])
  // feed 资源位落地集合页
  const [collectionKey, setCollectionKey] = useState(slot?.collectionKey ?? (slot?.type === 'feed' ? genCollectionKey() : ''))
  const [collectionTitle, setCollectionTitle] = useState(slot?.collectionTitle ?? '')
  const [collectionSubtitle, setCollectionSubtitle] = useState(slot?.collectionSubtitle ?? '')
  const [collectionHeaderImage, setCollectionHeaderImage] = useState(slot?.collectionHeaderImage ?? PLACEHOLDER)

  const [pickOpen, setPickOpen] = useState(false)
  const [pickSelected, setPickSelected] = useState<string[]>([])
  const [pickTarget, setPickTarget] = useState<'feed' | string>('feed') // feed = 资源位商品；string = banner slide key
  const [feedSelectedKeys, setFeedSelectedKeys] = useState<string[]>([])
  const [pickName, setPickName] = useState('')
  const [pickId, setPickId] = useState('')
  const [pickKeyword, setPickKeyword] = useState('')
  const [pickCategory, setPickCategory] = useState<string[]>([])

  const listedProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (p.status !== 'listed') return false
      if (pickName && !p.title.toLowerCase().includes(pickName.trim().toLowerCase())) return false
      if (pickId) {
        const q = pickId.trim().toLowerCase()
        const hit =
          p.id.toLowerCase().includes(q) ||
          p.itemId.toLowerCase().includes(q) ||
          p.spu.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (pickCategory[0] && p.categoryPath[0] !== pickCategory[0]) return false
      if (pickCategory[1] && p.categoryPath[1] !== pickCategory[1]) return false
      if (pickCategory[2] && p.categoryPath[2] !== pickCategory[2]) return false
      if (pickKeyword) {
        const q = pickKeyword.trim().toLowerCase()
        const blob = [
          p.title,
          p.description,
          p.id,
          p.itemId,
          p.spu,
          p.categoryPath.join(' '),
          p.material,
        ].join(' ').toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [pickName, pickId, pickKeyword, pickCategory])

  const resetPickFilters = () => {
    setPickName('')
    setPickId('')
    setPickKeyword('')
    setPickCategory([])
  }

  const batchRemoveFeed = () => {
    if (feedSelectedKeys.length === 0) return
    setItems((prev) => prev.filter((i) => !feedSelectedKeys.includes(i.key)).map((i, k) => ({ ...i, sort: k })))
    message.success(`已移除 ${feedSelectedKeys.length} 个商品`)
    setFeedSelectedKeys([])
  }

  const addItem = (item: SlotItem) => setItems((prev) => [...prev, { ...item, sort: prev.length }])
  const removeItem = (key: string) => setItems((prev) => prev.filter((i) => i.key !== key))
  const moveItem = (key: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key)
      if (idx < 0) return prev
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next.map((i, k) => ({ ...i, sort: k }))
    })
  }
  const updateItem = (key: string, patch: Partial<SlotItem>) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)))

  const changeBannerContent = (key: string, content: BannerContentType) => {
    const patch: Partial<SlotItem> = { bannerContent: content }
    if (content === 'image') {
      patch.adLink = undefined
      patch.productIds = undefined
      patch.collectionKey = undefined
      patch.collectionTitle = undefined
      patch.collectionSubtitle = undefined
      patch.collectionHeaderImage = undefined
    } else if (content === 'image_link') {
      patch.adLink = ''
      patch.productIds = undefined
      patch.collectionKey = undefined
      patch.collectionTitle = undefined
      patch.collectionSubtitle = undefined
      patch.collectionHeaderImage = undefined
    } else {
      patch.adLink = undefined
      patch.productIds = []
      patch.collectionKey = genCollectionKey()
      patch.collectionTitle = ''
      patch.collectionSubtitle = ''
      patch.collectionHeaderImage = PLACEHOLDER
    }
    updateItem(key, patch)
  }

  const openPick = (target: 'feed' | string) => {
    setPickTarget(target)
    setPickSelected([])
    resetPickFilters()
    setPickOpen(true)
  }

  const confirmPick = () => {
    if (pickTarget === 'feed') {
      pickSelected.forEach((pid) => {
        addItem({ key: `i-${Date.now()}-${pid}`, type: 'product', productId: pid, sort: 0 })
      })
      message.success(`已添加 ${pickSelected.length} 个商品`)
    } else {
      const slide = items.find((i) => i.key === pickTarget)
      const merged = Array.from(new Set([...(slide?.productIds ?? []), ...pickSelected]))
      updateItem(pickTarget, { productIds: merged })
      message.success(`已为该 Banner 图关联 ${pickSelected.length} 个商品`)
    }
    setPickSelected([])
    setPickOpen(false)
  }

  const addBannerSlide = () => {
    addItem({
      key: `slide-${Date.now()}`,
      type: 'banner_slide',
      adImage: PLACEHOLDER,
      bannerContent: 'image',
      sort: 0,
    })
    message.success('已添加 Banner 图，请选择该图下方内容形态')
  }

  const onTypeChange = (v: SlotType) => {
    setType(v)
    setItems([])
    setFeedSelectedKeys([])
    if (v === 'feed') {
      setCollectionKey(genCollectionKey())
      setCollectionTitle('')
      setCollectionSubtitle('')
      setCollectionHeaderImage(PLACEHOLDER)
    } else {
      setCollectionKey('')
      setCollectionTitle('')
      setCollectionSubtitle('')
      setCollectionHeaderImage('')
    }
  }

  return (
    <div className="page-section">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <Space size={12}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/slots')}>返回</Button>
          <Title level={5} className="page-header-title">{isNew ? '新建资源位' : `编辑资源位 · ${slot?.id}`}</Title>
        </Space>
      </div>

      <Card title="基本信息" size="small">
        <Form layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="名称（内部展示，唯一）" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：首页轮播 Banner" />
            </Form.Item>
            <Form.Item label="ID（系统自动生成，唯一）">
              <Input value={slot?.id ?? '（保存后生成）'} readOnly style={{ background: '#fafafa' }} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item label="类型" required>
              <Select
                value={type}
                onChange={onTypeChange}
                options={[
                  { value: 'feed', label: 'Feed（商品流）' },
                  { value: 'banner', label: 'Banner（轮播图）' },
                ]}
              />
            </Form.Item>
            <Form.Item label="投放位置">
              <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="如：首页 · Feed 区" />
            </Form.Item>
            <Form.Item label="状态">
              <Space>
                <Switch checked={status === 'active'} onChange={(v) => setStatus(v ? 'active' : 'inactive')} />
                <Tag color={status === 'active' ? 'success' : 'default'}>{status === 'active' ? '生效中' : '已停用'}</Tag>
              </Space>
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="首页排序权重" tooltip="数值越小越靠前；仅生效中的资源位参与首页编排">
              <InputNumber
                value={homeOrder}
                min={1}
                max={999}
                step={1}
                style={{ width: '100%' }}
                onChange={(v) => setHomeOrder(v ?? 99)}
              />
            </Form.Item>
            <Form.Item label="首页是否展示">
              <Space>
                <Switch checked={status === 'active'} disabled />
                <span style={{ fontSize: 12, color: '#999' }}>跟随资源位状态</span>
              </Space>
            </Form.Item>
          </div>
        </Form>
      </Card>

      {type === 'feed' && (
        <>
          <Card title="Feed 面向客户展示信息" size="small">
            <Form layout="vertical">
              <Form.Item label="标题（面向客户）">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：Trending Now" />
              </Form.Item>
              <Form.Item label="描述（面向客户）">
                <Input.TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="面向客户展示的资源位描述" rows={3} />
              </Form.Item>
            </Form>
          </Card>

          <Card title="集合页配置（「更多」落地页）" size="small"
            extra={<Tag color="blue">曝光 ID ≠ 资源位 ID</Tag>}
          >
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="集合页用于 Feed 超出前端展示上限时的「更多」落地页；集合页 collectionKey 与资源位 ID 相互独立，避免曝光串记。"
            />
            <Form layout="vertical">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item label="集合页 Key（系统生成，用于曝光）">
                  <Input value={collectionKey} readOnly style={{ background: '#fafafa' }} />
                </Form.Item>
                <Form.Item label="落地页标题">
                  <Input value={collectionTitle} onChange={(e) => setCollectionTitle(e.target.value)} placeholder="落地页主标题" />
                </Form.Item>
              </div>
              <Form.Item label="落地页副标题">
                <Input value={collectionSubtitle} onChange={(e) => setCollectionSubtitle(e.target.value)} placeholder="落地页副标题" />
              </Form.Item>
              <Form.Item label="落地页头图">
                <Space>
                  <Image src={collectionHeaderImage} width={120} height={56} />
                  <Button size="small" icon={<PictureOutlined />} onClick={() => message.info('上传头图（示意）')}>替换头图</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title="商品列表"
            size="small"
            extra={
              <Space>
                {feedSelectedKeys.length > 0 && (
                  <>
                    <span style={{ fontSize: 13, color: '#666' }}>已选 {feedSelectedKeys.length} 项</span>
                    <Popconfirm title={`确认移除选中的 ${feedSelectedKeys.length} 个商品？`} onConfirm={batchRemoveFeed}>
                      <Button danger icon={<DeleteOutlined />}>批量移除</Button>
                    </Popconfirm>
                    <Button onClick={() => setFeedSelectedKeys([])}>取消选择</Button>
                  </>
                )}
                <Button icon={<PlusOutlined />} onClick={() => openPick('feed')}>添加商品</Button>
              </Space>
            }
          >
            {items.length === 0 ? (
              <Empty description="暂无商品，请添加已上架商品" />
            ) : (
              <Table
                rowKey="key"
                size="small"
                dataSource={items}
                rowSelection={{
                  selectedRowKeys: feedSelectedKeys,
                  onChange: (keys) => setFeedSelectedKeys(keys as string[]),
                }}
                pagination={{
                  pageSize: 15,
                  showSizeChanger: false,
                  showTotal: (total) => `共 ${total} 个商品`,
                }}
                columns={[
                  { title: '序号', key: 'sort', width: 60, render: (_: unknown, __: SlotItem, idx: number) => idx + 1 },
                  {
                    title: '商品ID',
                    key: 'productId',
                    width: 100,
                    render: (_: unknown, r: SlotItem) => r.productId ?? '—',
                  },
                  {
                    title: '商品',
                    key: 'product',
                    render: (_: unknown, r: SlotItem) => {
                      const p = r.productId ? getProduct(r.productId) : undefined
                      return p ? (
                        <Space>
                          <Image src={p.mainImage} width={36} height={36} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.title}</div>
                            <div style={{ fontSize: 12, color: '#999' }}>{p.spu}</div>
                          </div>
                        </Space>
                      ) : '商品已下架'
                    },
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 160,
                    render: (_: unknown, r: SlotItem) => (
                      <Space size={4}>
                        <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={() => moveItem(r.key, -1)} />
                        <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={() => moveItem(r.key, 1)} />
                        <Popconfirm title="移除该商品？" onConfirm={() => {
                          removeItem(r.key)
                          setFeedSelectedKeys((prev) => prev.filter((k) => k !== r.key))
                        }}>
                          <Button type="link" danger size="small" icon={<DeleteOutlined />}>移除</Button>
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]}
              />
            )}
            <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
              提示：后台不限制商品数量；前端控制首页展示条数，用户点击「更多」进入集合页查看全部。每页固定 15 条。
            </div>
          </Card>
        </>
      )}

      {type === 'banner' && (
        <>
          <Alert
            type="info"
            showIcon
            message="Banner 配置规则"
            description="每张轮播图必须先有图片，再为该图选择下方内容形态：纯图 / 图+链接 / Feed 流。仅 Feed 流需要配置集合页（独立 collectionKey）。"
          />

          <Card
            title="Banner 轮播图"
            size="small"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={addBannerSlide}>添加 Banner 图</Button>}
          >
            {items.length === 0 ? (
              <Empty description="暂无轮播图，请添加 Banner 图" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((slide, idx) => {
                  const content = slide.bannerContent ?? 'image'
                  return (
                    <Card
                      key={slide.key}
                      size="small"
                      type="inner"
                      title={
                        <Space>
                          <span>第 {idx + 1} 张</span>
                          <Tag color={CONTENT_LABEL[content].color}>{CONTENT_LABEL[content].label}</Tag>
                        </Space>
                      }
                      extra={
                        <Space size={4}>
                          <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={() => moveItem(slide.key, -1)} />
                          <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={() => moveItem(slide.key, 1)} />
                          <Popconfirm title="移除该 Banner 图？" onConfirm={() => removeItem(slide.key)}>
                            <Button type="link" danger size="small" icon={<DeleteOutlined />}>移除</Button>
                          </Popconfirm>
                        </Space>
                      }
                    >
                      <Form layout="vertical">
                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}>
                          <Form.Item label="Banner 图（必填）" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <Image src={slide.adImage} width={140} height={70} />
                              <Button size="small" icon={<PictureOutlined />} onClick={() => message.info('替换 Banner 图（示意）')}>替换图片</Button>
                            </div>
                          </Form.Item>
                          <div>
                            <Form.Item label="该图下方内容形态" required style={{ marginBottom: 12 }}>
                              <Select
                                value={content}
                                onChange={(v: BannerContentType) => changeBannerContent(slide.key, v)}
                                options={CONTENT_OPTIONS}
                                style={{ width: 280 }}
                              />
                            </Form.Item>

                            {content === 'image' && (
                              <div style={{ color: '#999', fontSize: 12 }}>纯图：仅展示图片，无跳转、无商品。（本期前台暂不接，后台示意）</div>
                            )}

                            {content === 'image_link' && (
                              <>
                                <Form.Item label="跳转链接" required style={{ marginBottom: 4 }}>
                                  <Input
                                    value={slide.adLink ?? ''}
                                    onChange={(e) => updateItem(slide.key, { adLink: e.target.value })}
                                    placeholder="如 /products 或 https://..."
                                  />
                                </Form.Item>
                                <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>图+链接：本期前台暂不接，后台示意。</div>
                              </>
                            )}

                            {content === 'product_feed' && (
                              <div>
                                <Divider style={{ margin: '8px 0 12px' }}>集合页配置（独立曝光 ID）</Divider>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                  <Form.Item label="集合页 Key" style={{ marginBottom: 8 }}>
                                    <Input value={slide.collectionKey ?? ''} readOnly style={{ background: '#fafafa' }} />
                                  </Form.Item>
                                  <Form.Item label="落地页标题" style={{ marginBottom: 8 }}>
                                    <Input
                                      value={slide.collectionTitle ?? ''}
                                      onChange={(e) => updateItem(slide.key, { collectionTitle: e.target.value })}
                                      placeholder="落地页主标题"
                                    />
                                  </Form.Item>
                                  <Form.Item label="落地页副标题" style={{ marginBottom: 8 }}>
                                    <Input
                                      value={slide.collectionSubtitle ?? ''}
                                      onChange={(e) => updateItem(slide.key, { collectionSubtitle: e.target.value })}
                                      placeholder="落地页副标题"
                                    />
                                  </Form.Item>
                                  <Form.Item label="落地页头图" style={{ marginBottom: 8 }}>
                                    <Space>
                                      <Image src={slide.collectionHeaderImage ?? PLACEHOLDER} width={80} height={40} />
                                      <Button size="small" onClick={() => message.info('替换头图（示意）')}>替换</Button>
                                    </Space>
                                  </Form.Item>
                                </div>

                                <Divider style={{ margin: '8px 0 12px' }}>该图下商品流</Divider>
                                <div style={{ marginBottom: 8 }}>
                                  <Button size="small" icon={<PlusOutlined />} onClick={() => openPick(slide.key)}>添加商品</Button>
                                  <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
                                    已关联 {(slide.productIds ?? []).length} 个商品
                                  </span>
                                </div>
                                {(slide.productIds ?? []).length > 0 && (
                                  <Table
                                    rowKey="pid"
                                    size="small"
                                    pagination={false}
                                    dataSource={(slide.productIds ?? []).map((pid) => ({ pid }))}
                                    columns={[
                                      {
                                        title: '商品',
                                        render: (_: unknown, r: { pid: string }) => {
                                          const p = getProduct(r.pid)
                                          return p ? (
                                            <Space>
                                              <Image src={p.mainImage} width={28} height={28} />
                                              <span style={{ fontSize: 12 }}>{p.title}</span>
                                            </Space>
                                          ) : r.pid
                                        },
                                      },
                                      {
                                        title: '操作',
                                        width: 80,
                                        render: (_: unknown, r: { pid: string }) => (
                                          <Button
                                            type="link"
                                            danger
                                            size="small"
                                            onClick={() => updateItem(slide.key, {
                                              productIds: (slide.productIds ?? []).filter((x) => x !== r.pid),
                                            })}
                                          >
                                            移除
                                          </Button>
                                        ),
                                      },
                                    ]}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Form>
                    </Card>
                  )
                })}
              </div>
            )}
          </Card>
        </>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('已保存资源位')}>保存</Button>
        <Button onClick={() => navigate('/slots')}>取消</Button>
      </div>

      <Modal
        title="选择已上架商品"
        open={pickOpen}
        onCancel={() => setPickOpen(false)}
        onOk={confirmPick}
        width={860}
        destroyOnClose
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Input
            allowClear
            placeholder="商品名称"
            prefix={<SearchOutlined />}
            value={pickName}
            onChange={(e) => setPickName(e.target.value)}
            style={{ width: 160 }}
          />
          <Input
            allowClear
            placeholder="商品ID / item_id / SPU"
            prefix={<SearchOutlined />}
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
            style={{ width: 200 }}
          />
          <Cascader
            allowClear
            changeOnSelect
            placeholder="分类"
            style={{ width: 220 }}
            value={pickCategory}
            onChange={(v) => setPickCategory((v as string[]) ?? [])}
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
          />
          <Input
            allowClear
            placeholder="关键词模糊搜索"
            prefix={<SearchOutlined />}
            value={pickKeyword}
            onChange={(e) => setPickKeyword(e.target.value)}
            style={{ width: 180 }}
          />
          <Button onClick={resetPickFilters}>重置</Button>
        </div>
        <Table
          rowKey="id"
          size="small"
          rowSelection={{
            selectedRowKeys: pickSelected,
            onChange: (keys) => setPickSelected(keys as string[]),
          }}
          pagination={{ pageSize: 6, showTotal: (t) => `共 ${t} 个商品` }}
          dataSource={listedProducts}
          columns={[
            {
              title: '商品',
              dataIndex: 'title',
              render: (_: string, r: typeof PRODUCTS[0]) => (
                <Space>
                  <Image src={r.mainImage} width={32} height={32} />
                  <div>
                    <div>{r.title}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>ID: {r.id} · {r.spu}</div>
                  </div>
                </Space>
              ),
            },
            { title: '分类', dataIndex: 'categoryPath', render: (c: string[]) => c.join(' / '), width: 220 },
            { title: '状态', dataIndex: 'status', width: 80, render: () => <Tag color="success">已上架</Tag> },
          ]}
        />
      </Modal>
    </div>
  )
}
