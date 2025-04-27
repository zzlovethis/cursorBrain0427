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

# 显示使用说明
show_usage() {
  echo "GitHub Desktop 同步助手"
  echo "用法:"
  echo "  ./github_desktop_sync.sh open   - 在GitHub Desktop中打开项目"
  echo "  ./github_desktop_sync.sh push   - 提交所有更改并推送到远程仓库"
  echo "  ./github_desktop_sync.sh pull   - 从远程仓库拉取最新更改"
  echo "  ./github_desktop_sync.sh status - 检查同步状态"
}

# 确保GitHub Desktop已安装
check_github_desktop() {
  if ! [ -d "/Applications/GitHub Desktop.app" ]; then
    print_error "未找到GitHub Desktop。请确保已安装GitHub Desktop。"
    exit 1
  fi
}

# 在GitHub Desktop中打开项目
open_in_github_desktop() {
  print_info "正在GitHub Desktop中打开项目..."
  open -a "GitHub Desktop" "$PROJECT_DIR"
  print_success "已在GitHub Desktop中打开项目！"
}

# 使用同步脚本推送更改
push_changes() {
  print_info "正在提交并推送更改..."
  
  # 检查是否有本地更改
  if [[ -z $(git status -s) ]]; then
    print_warning "没有本地更改需要提交。"
  else
    # 使用我们的同步脚本推送更改
    if [ -z "$1" ]; then
      message="通过GitHub Desktop助手更新 - $(date "+%Y-%m-%d %H:%M:%S")"
    else
      message="$1"
    fi
    
    "$PROJECT_DIR/sync.sh" "$message"
  fi
  
  # 再次打开GitHub Desktop以刷新状态
  open_in_github_desktop
}

# 使用同步脚本拉取更改
pull_changes() {
  print_info "正在从远程仓库拉取最新更改..."
  
  # 获取当前分支
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  
  # 拉取更改
  if git pull origin "$current_branch"; then
    print_success "已成功拉取最新更改！"
  else
    print_error "拉取更改失败。请检查网络连接或权限设置。"
    exit 1
  fi
  
  # 再次打开GitHub Desktop以刷新状态
  open_in_github_desktop
}

# 检查同步状态
check_status() {
  print_info "正在检查同步状态..."
  
  # 获取当前分支
  current_branch=$(git rev-parse --abbrev-ref HEAD)
  
  # 使用我们的同步脚本检查状态
  "$PROJECT_DIR/sync.sh" --status
  
  # 再次打开GitHub Desktop以刷新状态
  open_in_github_desktop
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
    *)
      show_usage
      ;;
  esac
}

# 执行主函数
main "$@" 