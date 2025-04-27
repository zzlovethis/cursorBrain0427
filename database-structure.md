# 微信小程序数据库结构

## 用户互动云函数数据库集合

### 1. books (书籍)
```
{
  _id: string,                // 文档ID
  title: string,              // 书籍标题
  author: string,             // 作者
  category: string,           // 分类
  description: string,        // 描述
  coverUrl: string,           // 封面图片URL
  content: string,            // 内容
  chapters: Array<{           // 章节
    id: string,               // 章节ID
    title: string,            // 章节标题
    content: string,          // 章节内容
    wordCount: number,        // 字数
    updateTime: Date          // 更新时间
  }>,
  viewCount: number,          // 查看次数
  likeCount: number,          // 点赞次数
  bookmarkCount: number,      // 收藏次数
  shareCount: number,         // 分享次数
  commentCount: number,       // 评论次数
  createTime: Date,           // 创建时间
  updateTime: Date            // 更新时间
}
```

### 2. modules (模块)
```
{
  _id: string,                // 文档ID
  id: string,                 // 模块ID
  name: string,               // 模块名称
  description: string,        // 描述
  coverUrl: string,           // 封面图片URL
  content: string,            // 内容
  viewCount: number,          // 查看次数
  likeCount: number,          // 点赞次数
  bookmarkCount: number,      // 收藏次数
  shareCount: number,         // 分享次数
  commentCount: number,       // 评论次数
  createTime: Date,           // 创建时间
  updateTime: Date            // 更新时间
}
```

### 3. tools (工具)
```
{
  _id: string,                // 文档ID
  id: string,                 // 工具ID
  name: string,               // 工具名称
  description: string,        // 描述
  coverUrl: string,           // 封面图片URL
  usage: string,              // 使用说明
  viewCount: number,          // 查看次数
  likeCount: number,          // 点赞次数
  bookmarkCount: number,      // 收藏次数
  shareCount: number,         // 分享次数
  commentCount: number,       // 评论次数
  createTime: Date,           // 创建时间
  updateTime: Date            // 更新时间
}
```

### 4. views (查看记录)
```
{
  _id: string,                // 文档ID
  openid: string,             // 用户ID
  itemId: string,             // 项目ID
  itemType: string,           // 项目类型 (books, modules, tools)
  createTime: Date,           // 首次查看时间
  updateTime: Date            // 最近查看时间
}
```

### 5. likes (点赞记录)
```
{
  _id: string,                // 文档ID
  openid: string,             // 用户ID
  itemId: string,             // 项目ID
  itemType: string,           // 项目类型 (books, modules, tools)
  createTime: Date            // 点赞时间
}
```

### 6. bookmarks (收藏记录)
```
{
  _id: string,                // 文档ID
  openid: string,             // 用户ID
  itemId: string,             // 项目ID
  itemType: string,           // 项目类型 (books, modules, tools)
  createTime: Date            // 收藏时间
}
```

### 7. shares (分享记录)
```
{
  _id: string,                // 文档ID
  openid: string,             // 用户ID
  itemId: string,             // 项目ID
  itemType: string,           // 项目类型 (books, modules, tools)
  createTime: Date            // 分享时间
}
```

### 8. comments (评论)
```
{
  _id: string,                // 文档ID
  openid: string,             // 用户ID
  itemId: string,             // 项目ID
  itemType: string,           // 项目类型 (books, modules, tools)
  content: string,            // 评论内容
  username: string,           // 用户名
  avatarUrl: string,          // 用户头像
  likeCount: number,          // 点赞数
  createTime: Date            // 创建时间
}
```

### 9. commentLikes (评论点赞)
```
{
  _id: string,                // 文档ID
  openid: string,             // 用户ID
  commentId: string,          // 评论ID
  createTime: Date            // 点赞时间
}
```

## 云函数

### 1. userInteraction (用户互动)
处理用户与内容的互动，包括：
- 查看内容 (view)
- 点赞 (like)
- 收藏 (bookmark)
- 分享 (share)
- 获取用户统计 (getUserStats)
- 生成小程序码 (getQRCode)

### 2. commentService (评论服务)
处理评论相关操作：
- 添加评论
- 删除评论
- 点赞评论
- 回复评论
- 获取评论列表

## 权限设计

- 基础集合采用基于openid的权限控制
- 用户只能读取公共内容和自己的数据
- 用户只能修改和删除自己的数据
- 管理员可以读取和修改所有数据 