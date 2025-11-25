# 目的与范围
- 目的：为现有前端（公开站点 + 管理后台）提供稳定一致的后端接口，涵盖读取、创建、更新、删除、上传与聚合查询
- 范围：认证、作者、博客、照片、应用、地图聚合、全局搜索、上传、统计；含字段校验、分页筛选、错误规范、安全要求

# 通用规范
- 基础 URL：`/api`
- 响应格式：JSON；除 204 均返回 body
- 时间：使用 `UTC ISO 8601`（如 `2024-03-15` 或完整时间戳）
- 分页：`page`（默认 1）、`limit`（默认 20，最大 100）；返回 `meta: { page, limit, total }`
- 排序：`sort`（如 `date:desc,title:asc`）、字段选择：`fields`（如 `id,title,date`）
- 过滤：统一用 query 参数（如 `status=published`、`hasLocation=true`、`q=keyword`）
- 错误：`{ error: { code, message, details? } }`；示例代码：
  - `INVALID_INPUT` 400、`UNAUTHORIZED` 401、`FORBIDDEN` 403、`NOT_FOUND` 404、`CONFLICT` 409、`RATE_LIMITED` 429、`INTERNAL_ERROR` 500
- 认证：JWT Bearer；所有写操作与管理页读取需要 `Authorization: Bearer <token>`；支持角色 `admin|editor|viewer`
- CORS：允许前端域名；若使用刷新 Token，则 `Access-Control-Allow-Credentials: true`

# 认证
## 登录
- POST `/api/auth/login`
- body：`{ username: string, password: string }`
- 200：`{ token: string, refreshToken?: string, user: { id, name, role } }`
- 401：`INVALID_CREDENTIALS`

## 登出
- POST `/api/auth/logout`
- header：`Authorization`
- 204

## 刷新令牌（可选）
- POST `/api/auth/refresh`
- body：`{ refreshToken: string }`
- 200：`{ token: string }`

## 当前用户
- GET `/api/auth/me`
- header：`Authorization`
- 200：`{ id, name, role }`

# 模型与字段
- `Location { lat: number, lng: number, name: string }`
- `Author { id, name, role, avatar, bio, social: { github?, twitter?, linkedin? } }`
- `BlogPost { id, title, excerpt, content, date, readTime, location?, status: 'published'|'draft', partners?: string[] }`
- `Photo { id, url, caption, location, date }`
- `AppProject { id, name, description, icon, url, tags[] }`

# 作者（Authors）
## 列表
- GET `/api/authors`
- query：`page, limit, q`
- 200：`{ data: Author[], meta }`
## 详情
- GET `/api/authors/:id`
- 200：`Author`
## 创建（Admin）
- POST `/api/authors`
- body：`{ name, role, avatar, bio, social? }`
- 校验：`name[1..80]`、`avatar` 为 URL、`role[1..60]`、`bio[0..400]`
- 201：`Author`
## 更新（Admin）
- PUT `/api/authors/:id`
- 200：`Author`
## 删除（Admin）
- DELETE `/api/authors/:id`
- 204

# 博客（Posts）
## 列表
- GET `/api/posts`
- query：
  - `page, limit`
  - `status`：`published|draft`
  - `hasLocation`：`true|false`
  - `q`：标题/摘要全文检索
  - `sort`：默认 `date:desc`
- 200：`{ data: BlogPost[], meta }`
## 详情
- GET `/api/posts/:id`
- 200：`BlogPost`
## 创建（Admin）
- POST `/api/posts`
- body：`{ title, excerpt, content, date, readTime, location?, status, partners? }`
- 校验：
  - `title[1..120]`、`excerpt[0..280]`、`readTime[1..40]`
  - `status` 枚举；`partners` 中每项需为存在的 `Author.id`
  - `location.lat[-90..90]`、`location.lng[-180..180]`、`name[1..120]`
- 201：`BlogPost`
## 更新（Admin）
- PUT `/api/posts/:id`
- 200：`BlogPost`
## 删除（Admin）
- DELETE `/api/posts/:id`
- 204
## 预览（可选）
- GET `/api/posts/:id/preview`（作者可见，不公开缓存）
- 200：`{ html: string }`（后端可渲染 Markdown）

# 照片（Photos）
## 列表
- GET `/api/photos`
- query：`page, limit, hasLocation, q, sort=date:desc`
- 200：`{ data: Photo[], meta }`
## 详情
- GET `/api/photos/:id`
- 200：`Photo`
## 创建（Admin）
- POST `/api/photos`
- body：`{ url, caption, location, date }`
- 校验：`url` 为 URL、`caption[1..140]`、`date` 格式、`location` 同上
- 201：`Photo`
## 更新（Admin）
- PUT `/api/photos/:id`
- 200：`Photo`
## 删除（Admin）
- DELETE `/api/photos/:id`
- 204

# 应用（Apps）
## 列表
- GET `/api/apps`
- 200：`AppProject[]`
## 详情
- GET `/api/apps/:id`
- 200：`AppProject`
## 创建（Admin）
- POST `/api/apps`
- body：`{ name, description, icon, url, tags[] }`
- 校验：`name[1..80]`、`description[0..400]`、`icon[1..40]`（如 lucide 名称或 URL）、`url` 为 URL
- 201：`AppProject`
## 更新（Admin）
- PUT `/api/apps/:id`
- 200：`AppProject`
## 删除（Admin）
- DELETE `/api/apps/:id`
- 204

# 地图聚合（Map）
- GET `/api/map/locations`
- 200：`Array<{ id, lat, lng, title, type: 'post'|'photo', avatars?: string[] }>`
- 说明：聚合所有带坐标项；`avatars` 可返回参与作者头像（用于弹窗头像栈），最多 4 个
- 过滤：`type=post|photo`、`bbox=minLng,minLat,maxLng,maxLat`（可选范围过滤）

# 全局搜索
- GET `/api/search`
- query：`q`
- 200：`{ posts: BlogPost[], photos: Photo[], authors: Author[] }`
- 限流：每 IP 每分钟 60 次

# 上传
- POST `/api/uploads/images`
- `multipart/form-data` 字段：`file`
- 201：`{ id, url, width?, height?, size? }`
- 可选：`POST /api/uploads/base64 { data }` 返回同上
- 安全：大小限制（如 5MB）、类型白名单（jpeg/png/webp）

# 统计与仪表盘
- GET `/api/stats`
- 200：`{ posts: number, photos: number, authors: number, withLocation: { posts: number, photos: number } }`

# 示例响应
## Posts 列表
```json
{
  "data": [
    {
      "id": "2",
      "title": "Nomad Life in Tokyo",
      "excerpt": "Spending a month...",
      "content": "...",
      "date": "2023-11-10",
      "readTime": "8 min read",
      "location": { "lat": 35.6895, "lng": 139.6917, "name": "Tokyo, Japan" },
      "status": "published",
      "partners": ["1", "2"]
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42 }
}
```

## Map 聚合
```json
[
  { "id": "post:1", "lat": 37.7749, "lng": -122.4194, "title": "Declarative UI", "type": "post", "avatars": ["https://.../a.png"] },
  { "id": "photo:2", "lat": 35.6909, "lng": 139.7005, "title": "Shinjuku", "type": "photo" }
]
```

# 校验要点
- `lat/lng` 范围与数字类型；`name` 非空
- `partners` 必须为存在作者 ID；否则 400 `INVALID_PARTNER`
- `date` 必须是有效日期；未来日期允许但可选警告
- 上传图片必须通过 MIME 检查与尺寸限制

# 安全与性能
- 缓存：公开接口列表可设置 `Cache-Control: public, max-age=60`，详情按需
- 速率限制：登录与搜索加强限流
- 审计：所有写操作记录 `userId`、时间戳；可选操作日志接口
- 可观测性：统一请求 ID；错误打点

# 与前端兼容性
- 替换 `services/api.ts` 的本地存储实现为真实请求，数据结构保持一致（字段名与 types.ts）
- 关键调用位置：
  - 列表页 Blog/Gallery 调用列表接口（pages/Blog.tsx:9、pages/Gallery.tsx:9）
  - 详情编辑：AdminBlog 与 BlogEditor（pages/admin/AdminBlog.tsx:12、pages/admin/BlogEditor.tsx:28–37）
  - 地图聚合：Home 与 Gallery 弹窗（pages/Home.tsx:31–35、pages/Gallery.tsx:90–96）

# 后续扩展
- Webhook：发布/删除触发 CDN 缓存刷新
- 草稿分享：一次性预览令牌
- 国际化：`title/excerpt/content` 多语言字段
