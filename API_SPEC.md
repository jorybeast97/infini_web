# Infini Web 后端接口详细规格

## 概览
- 基础 URL：`/api`
- 风格：REST + JSON，JWT 认证，统一分页/筛选/排序与错误结构
- 适配前端：`services/api.ts` 现有模型与字段；不改变字段名与嵌套结构

## 通用规范
- 响应体：除 204 均返回 JSON；日期采用 `ISO 8601`（UTC）
- 分页：`page` 默认 1；`limit` 默认 20（最大 100）；响应含 `meta: { page, limit, total }`
- 排序：`sort=field:asc|desc`，多字段逗号分隔（如 `date:desc,title:asc`）
- 字段选择：`fields=id,title,date`（返回子集以减小负载）
- 过滤：统一 query（如 `status=published`、`hasLocation=true`、`q=keyword`）
- 错误：`{ error: { code, message, details? } }`
  - 代码：`INVALID_INPUT(400)`、`UNAUTHORIZED(401)`、`FORBIDDEN(403)`、`NOT_FOUND(404)`、`CONFLICT(409)`、`RATE_LIMITED(429)`、`INTERNAL_ERROR(500)`
- 认证：`Authorization: Bearer <token>`；角色：`admin|editor|viewer`
- CORS：允许前端域；若启用刷新 Token，开启 `Allow-Credentials`

## 数据模型（与前端 types.ts 对齐）
- `Location { lat:number, lng:number, name:string }`
- `Author { id, name, role, avatar, bio, social:{ github?, twitter?, linkedin? } }`
- `BlogPost { id, title, excerpt, content, date, readTime, location?, status:'published'|'draft', partners?: string[] }`
- `Photo { id, url, caption, location, date }`
- `AppProject { id, name, description, icon, url, tags:string[] }`

## 认证
- POST `/api/auth/login`
  - body：`{ username, password }`
  - 200：`{ token, refreshToken?, user:{ id, name, role } }`
- POST `/api/auth/logout`
  - 204
- POST `/api/auth/refresh`
  - body：`{ refreshToken }`
  - 200：`{ token }`
- GET `/api/auth/me`
  - 200：`{ id, name, role }`

## 作者（Authors）
- GET `/api/authors`
  - query：`page, limit, q`
  - 200：`{ data: Author[], meta }`
- GET `/api/authors/:id`
  - 200：`Author`
- POST `/api/authors`（Admin）
  - body：`{ name, role, avatar, bio, social? }`
  - 校验：`name[1..80]`、`role[1..60]`、`avatar(URL)`、`bio[0..400]`
  - 201：`Author`
- PUT `/api/authors/:id`（Admin）
  - 200：`Author`
- DELETE `/api/authors/:id`（Admin）
  - 204

## 博客（Posts）
- GET `/api/posts`
  - query：`page, limit, status(published|draft), hasLocation(true|false), q, sort`
  - 200：`{ data: BlogPost[], meta }`
- GET `/api/posts/:id`
  - 200：`BlogPost`
- POST `/api/posts`（Admin）
  - body：`{ title, excerpt, content, date, readTime, location?, status, partners? }`
  - 校验：
    - `title[1..120]`、`excerpt[0..280]`、`readTime[1..40]`
    - `status ∈ {published,draft}`
    - `partners` 为存在的作者 `id[]`
    - `location.lat[-90..90]`、`location.lng[-180..180]`、`name[1..120]`
  - 201：`BlogPost`
- PUT `/api/posts/:id`（Admin）
  - 200：`BlogPost`
- DELETE `/api/posts/:id`（Admin）
  - 204
- GET `/api/posts/:id/preview`（可选，作者可见）
  - 200：`{ html }`

## 照片（Photos）
- GET `/api/photos`
  - query：`page, limit, hasLocation, q, sort=date:desc`
  - 200：`{ data: Photo[], meta }`
- GET `/api/photos/:id`
  - 200：`Photo`
- POST `/api/photos`（Admin）
  - body：`{ url, caption, location, date }`
  - 校验：`url(URL)`、`caption[1..140]`、`date(ISO)`、`location` 同上
  - 201：`Photo`
- PUT `/api/photos/:id`（Admin）
  - 200：`Photo`
- DELETE `/api/photos/:id`（Admin）
  - 204

## 应用（Apps）
- GET `/api/apps`
  - 200：`AppProject[]`
- GET `/api/apps/:id`
  - 200：`AppProject`
- POST `/api/apps`（Admin）
  - body：`{ name, description, icon, url, tags[] }`
  - 校验：`name[1..80]`、`description[0..400]`、`icon[1..40]`、`url(URL)`
  - 201：`AppProject`
- PUT `/api/apps/:id`（Admin）
  - 200：`AppProject`
- DELETE `/api/apps/:id`（Admin）
  - 204

## 地图聚合（Map）
- GET `/api/map/locations`
  - query：`type=post|photo`、`bbox=minLng,minLat,maxLng,maxLat`（可选范围过滤）
  - 200：`Array<{ id, lat, lng, title, type:'post'|'photo', avatars?: string[] }>`
  - 说明：聚合所有带坐标项；`avatars` 为参与作者头像 URL（最多 4 个）

## 全局搜索（Search）
- GET `/api/search`
  - query：`q`
  - 200：`{ posts: BlogPost[], photos: Photo[], authors: Author[] }`
  - 限流：每 IP 每分钟 60 次

## 上传（Uploads）
- POST `/api/uploads/images`（Admin）
  - `multipart/form-data`：`file`
  - 201：`{ id, url, width?, height?, size? }`
- POST `/api/uploads/base64`（可选）
  - body：`{ data: 'data:image/png;base64,...' }`
  - 201：同上
- 限制：大小 ≤ 5MB；类型 `image/jpeg|png|webp`

## 统计与仪表盘
- GET `/api/stats`
  - 200：`{ posts: number, photos: number, authors: number, withLocation: { posts: number, photos: number } }`

## 示例
- 登录
```
curl -X POST /api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password"}'
```
- 发布文章
```
curl -X POST /api/posts -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' \
  -d '{"title":"Nomad Life","excerpt":"...","content":"...","date":"2024-03-15","readTime":"5 min read","location":{"lat":35.6895,"lng":139.6917,"name":"Tokyo"},"status":"published","partners":["1","2"]}'
```
- Map 聚合
```
curl '/api/map/locations?bbox=139.0,35.0,140.0,36.0&type=photo'
```

## 安全与性能建议
- 缓存：公开列表 `Cache-Control: public, max-age=60`，详情短缓存
- 速率限制：登录与搜索加强限流；上传启用对象存储直传（可选）
- 审计：所有写操作记录 `userId` 与时间戳；保留变更历史（可选）
- 可观测性：统一请求 ID、结构化日志；错误打点与报警
