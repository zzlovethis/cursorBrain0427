#!/bin/bash

# 整合GitHub Desktop与同步脚本的工作流
# 此脚本用于确保GitHub Desktop与项目的手动同步脚本协同工作

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # 无颜色

# 输出信息函数
print_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
  echo -e "\n${MAGENTA}=== $1 ===${NC}\n"
}

print_github_desktop() {
  echo -e "${CYAN}[GitHub Desktop]${NC} $1"
}

# 显示使用说明
show_usage() {
  print_header "GitHub Desktop 同步助手"
  echo "用法:"
  echo "  ./github_desktop_sync.sh open   - 在GitHub Desktop中打开项目"
  echo "  ./github_desktop_sync.sh push   - 提交所有更改并推送到远程仓库"
  echo "  ./github_desktop_sync.sh pull   - 从远程仓库拉取最新更改"
  echo "  ./github_desktop_sync.sh status - 检查同步状态"
  echo "  ./github_desktop_sync.sh help   - 显示使用帮助"
  echo ""
  echo "示例:"
  echo "  ./github_desktop_sync.sh push \"修复导航栏问题\""
}

# 确保GitHub Desktop已安装
check_github_desktop() {
  if ! [ -d "/Applications/GitHub Desktop.app" ]; then
    print_error "未找到GitHub Desktop。请确保已安装GitHub Desktop。"
    echo "可以从 https://desktop.github.com/ 下载安装。"
    exit 1
  fi
}

# 在GitHub Desktop中打开项目
open_in_github_desktop() {
  print_info "正在GitHub Desktop中打开项目..."
  open -a "GitHub Desktop" "$PROJECT_DIR"
  print_success "已在GitHub Desktop中打开项目！"
  
  # 创建一个标记文件，记录最后一次打开时间
  echo "$(date)" > "$PROJECT_DIR/.github_desktop_last_opened"
}

# 获取详细的存储库状态
get_detailed_status() {
  print_header "存储库详细状态"
  
  # 当前分支
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  echo -e "${BLUE}当前分支:${NC} $current_branch"
  
  # 远程仓库信息
  echo -e "\n${BLUE}远程仓库:${NC}"
  git remote -v
  
  # 未提交的更改
  echo -e "\n${BLUE}未提交的更改:${NC}"
  git_status=$(git status -s)
  if [ -z "$git_status" ]; then
    echo "无未提交的更改"
  else
    echo "$git_status"
  fi
  
  # 未推送的提交
  echo -e "\n${BLUE}未推送的提交:${NC}"
  unpushed=$(git log @{u}.. --oneline 2>/dev/null)
  if [ -z "$unpushed" ]; then
    echo "无未推送的提交"
  else
    echo "$unpushed"
    echo -e "\n${YELLOW}总计 $(echo "$unpushed" | wc -l | tr -d ' ') 个未推送的提交${NC}"
  fi
  
  # 本地分支和远程分支的差异
  echo -e "\n${BLUE}本地与远程差异:${NC}"
  git fetch origin $current_branch 2>/dev/null || echo "无法连接到远程仓库"
  
  # 显示GitHub Desktop信息
  if [ -f "$PROJECT_DIR/.github_desktop_last_opened" ]; then
    last_opened=$(cat "$PROJECT_DIR/.github_desktop_last_opened")
    echo -e "\n${CYAN}GitHub Desktop上次打开时间:${NC} $last_opened"
  fi
}

# 使用同步脚本推送更改
push_changes() {
  print_header "推送更改到GitHub"
  print_info "正在检查本地更改..."
  
  # 检查是否有本地更改
  if [[ -z $(git status -s) ]]; then
    print_warning "没有本地更改需要提交。"
    
    # 检查是否有未推送的提交
    unpushed=$(git log @{u}.. --oneline 2>/dev/null)
    if [ -n "$unpushed" ]; then
      echo -e "\n${YELLOW}发现 $(echo "$unpushed" | wc -l | tr -d ' ') 个未推送的提交:${NC}"
      echo "$unpushed"
      
      read -p "是否要推送这些现有的提交? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "正在推送现有提交..."
        "$PROJECT_DIR/sync.sh" --push-only
      fi
    fi
  else
    # 使用我们的同步脚本推送更改
    if [ -z "$1" ]; then
      message="通过GitHub Desktop助手更新 - $(date "+%Y-%m-%d %H:%M:%S")"
    else
      message="$1"
    fi
    
    print_info "正在提交并推送更改，提交信息: \"$message\""
    "$PROJECT_DIR/sync.sh" "$message"
  fi
  
  print_github_desktop "更改已处理，正在打开GitHub Desktop以刷新状态..."
  # 再次打开GitHub Desktop以刷新状态
  open_in_github_desktop
}

# 使用同步脚本拉取更改
pull_changes() {
  print_header "从GitHub拉取更改"
  print_info "正在从远程仓库拉取最新更改..."
  
  # 获取当前分支
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  
  # 检查未提交的更改
  if [[ -n $(git status -s) ]]; then
    print_warning "检测到未提交的本地更改。建议先提交这些更改。"
    git status -s
    
    read -p "是否要继续拉取更改? 这可能会导致合并冲突。(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_info "已取消拉取操作。"
      return
    fi
  fi
  
  # 拉取更改
  print_info "正在从 origin/$current_branch 拉取更改..."
  if git pull origin "$current_branch"; then
    print_success "已成功拉取最新更改！"
  else
    print_error "拉取更改失败。请检查网络连接或权限设置。"
    print_warning "你可以在GitHub Desktop中手动解决这个问题。"
  fi
  
  # 再次打开GitHub Desktop以刷新状态
  print_github_desktop "正在打开GitHub Desktop以显示最新状态..."
  open_in_github_desktop
}

# 检查同步状态
check_status() {
  print_header "同步状态检查"
  print_info "正在检查同步状态..."
  
  # 使用我们的同步脚本检查状态
  "$PROJECT_DIR/sync.sh" --status
  
  # 显示更详细的状态
  get_detailed_status
  
  # 再次打开GitHub Desktop以刷新状态
  print_github_desktop "正在打开GitHub Desktop以显示最新状态..."
  open_in_github_desktop
}

# 显示帮助信息
show_help() {
  show_usage
  
  print_header "GitHub Desktop集成说明"
  echo "此助手脚本可以帮助你：" 
  echo "1. 在GitHub Desktop中直观地查看项目变更和历史"
  echo "2. 利用我们的自动同步脚本提交和推送更改"
  echo "3. 在网络不稳定的情况下，确保你的更改被正确保存"
  echo ""
  echo "配置文件位置："
  echo "- GitHub Desktop配置: .github/desktop-config.yml"
  echo "- 同步脚本: sync.sh"
  echo "- 自动启动配置: com.user.githubsync.plist"
  echo ""
  print_warning "注意：GitHub Desktop只是一个可视化工具，真正的同步操作仍然通过Git命令执行。"
}

# 主函数
main() {
  check_github_desktop
  
  case "$1" in
    "open")
      open_in_github_desktop
      ;;
    "push")
      shift
      push_changes "$@"
      ;;
    "pull")
      pull_changes
      ;;
    "status")
      check_status
      ;;
    "help")
      show_help
      ;;
    *)
      show_usage
      ;;
  esac
}

# 执行主函数
main "$@" 