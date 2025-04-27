# 微信小程序 - 所见即所得编辑器

## 项目概述
本微信小程序提供了一个高度智能化的所见即所得(WYSIWYG)编辑功能，专为移动设备小屏幕设计，让用户能够轻松创建、编辑和分享内容，无需复杂操作。

## 设计理念
系统追求"极简操作，智能辅助"的理念，通过内置智能化功能减少用户操作负担，同时保持强大的内容创建能力。编辑器专为触摸屏设计，确保在手机等移动设备上使用舒适、高效。

## 核心功能规划

### 1. 智能化编辑界面
- 自适应界面根据用户操作习惯动态调整
- 常用功能自动置顶，减少寻找时间
- 上下文感知工具栏，只显示当前情境相关选项
- 预测用户意图，提前准备相关功能

### 2. 多模态内容输入与自动处理
- **手写内容**：直接保留为图像或可选择转换为文本
- **语音输入**：系统自动转文字并保留原音频，支持一键回听
- **图像优化**：自动裁剪、调整亮度对比度、去除背景
- **智能识别**：自动识别输入内容类型并应用合适的处理方式

### 3. 内置智能模板系统
- 基于内容自动推荐合适的版式和布局
- 输入少量内容后，系统自动补全剩余布局结构
- 模板自适应调整，保持整体设计风格一致
- 智能边界调整，确保内容不被截断或变形

### 4. 实时预览与智能调整
- 分屏实时预览最终效果
- 系统自动检测并提示可能的设计问题
- 一键应用系统建议的优化方案
- 支持在预览模式下直接进行简单调整

### 5. 系统内置智能化功能
- **自动排版**：系统识别内容结构，应用最佳排版方案
- **风格统一**：自动调整字体、颜色和间距保持一致性
- **智能建议**：根据当前内容提供下一步可能的编辑操作
- **错误检测**：自动检查并提示内容错误或不一致之处

### 6. 轻量级AI辅助（系统内置）
- 简化版AI助手，仅在关键节点提供帮助
- 用户表达需求后，系统立即转化为具体操作步骤
- AI辅助优先使用系统内置功能实现需求
- 学习用户偏好，持续提升系统智能化水平

### 7. 资源库智能管理
- 基于用户历史使用自动推荐相关资源
- 智能分类与标签系统，快速定位所需资源
- 自动同步云端资源，无缝整合微信生态内容
- 资源使用后自动优化存储，减少占用空间

### 8. 一键智能生成
- 用户提供关键词，系统自动生成完整内容框架
- 智能补全缺失部分，确保内容完整性
- 一键套用设计风格，保持视觉一致性
- 自动优化生成内容，符合移动端展示需求

### 9. 智能保存与版本管理
- 自动保存编辑状态，防止意外丢失
- 智能管理历史版本，关键节点自动创建检查点
- 系统自动分析版本差异，支持精确回退
- 跨设备编辑时智能解决冲突问题

### 10. 优化的用户反馈循环
- 系统记录用户调整行为，持续优化算法
- 针对频繁调整的区域提供快捷优化选项
- 用户操作停滞时智能提示可能的下一步
- 完成内容后提供整体优化建议，一键应用

## 实现原则
1. **简化优先**：始终寻求最简化的实现方式，减少用户操作步骤
2. **智能辅助**：系统主动提供帮助，而非被动等待用户指令
3. **内容为王**：所有设计决策以优化内容创建和展示为核心
4. **即时反馈**：用户每次操作都能获得即时、清晰的视觉反馈
5. **容错设计**：系统能够智能处理用户误操作，减少使用挫折感

## 目标用户
- 希望在移动设备上快速创建和编辑内容的普通用户
- 非专业设计人员但需要制作精美内容的用户
- 注重效率，希望减少复杂操作的用户

## 技术实现指南
- 优先使用微信小程序原生组件，确保性能和兼容性
- 核心算法在本地实现，减少网络依赖
- 使用增量同步技术，确保数据安全和高效
- 模块化设计，便于功能迭代和扩展

## 评估指标
- 完成编辑任务所需时间
- 用户操作步骤数量
- 系统智能建议采纳率
- 用户满意度和功能发现率
- 内容完成度和质量评分

## 后续发展规划
- 更深入的内容智能分析能力
- 更丰富的模板和资源库
- 更精确的用户意图预测
- 跨平台内容编辑与同步

# cursorBrain0427

WeChat Mini Program project with automatic GitHub synchronization.

## Synchronization with GitHub

This repository is set up to automatically synchronize with GitHub. The script `sync.sh` has been created to help with this process.

### Using the Sync Script

The sync script provides several options:

1. **Normal Sync** - Pull the latest changes, commit your changes, and push them:
   ```
   ./sync.sh "Your commit message"
   ```

2. **Offline Mode** - Commit changes without pulling or pushing (for when you don't have internet):
   ```
   ./sync.sh --offline "Your commit message"
   ```

3. **Push Only** - Push existing local commits without making new commits:
   ```
   ./sync.sh --push-only
   ```

4. **Check Status** - Show the current status of your repository:
   ```
   ./sync.sh --status
   ```

### Setting Up Automatic Synchronization

#### For Mac (using LaunchAgent)

1. Copy the LaunchAgent plist file to the LaunchAgents directory:
   ```
   cp com.user.githubsync.plist ~/Library/LaunchAgents/
   ```

2. Load the LaunchAgent:
   ```
   launchctl load ~/Library/LaunchAgents/com.user.githubsync.plist
   ```

3. The script will now run at system startup and every hour to check for and push any unpushed commits.

#### For Mac/Linux (using cron)

1. Open Terminal and edit your crontab:
   ```
   crontab -e
   ```

2. Add a line to run the sync script every hour (adjust the path as needed):
   ```
   0 * * * * cd /path/to/cursorBrain0427 && ./sync.sh "Auto sync $(date)"
   ```

#### For Windows (using Task Scheduler)

1. Open Task Scheduler
2. Create a new Basic Task
3. Set it to run daily or at your preferred interval
4. Set the action to "Start a program"
5. Browse to the location of your bash executable (git bash or WSL)
6. Add arguments: `-c "cd /path/to/cursorBrain0427 && ./sync.sh 'Auto sync'"` 

### Manual Push When Connection Is Available

If you've been working offline and want to push your changes when internet is available:

```
./sync.sh --push-only
```

## Project Structure

[Describe your project structure here]

## Development Guidelines

[Add any development guidelines here] 