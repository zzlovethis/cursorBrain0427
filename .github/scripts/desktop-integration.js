/**
 * GitHub Desktop 集成脚本
 * 
 * 本脚本为GitHub Desktop提供额外的集成功能，
 * 使其能够与项目的自定义同步脚本协同工作。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 项目根目录
 */
const projectRoot = path.resolve(__dirname, '../..');

/**
 * 检查同步脚本是否存在
 * @returns {boolean} 同步脚本是否存在
 */
function checkSyncScript() {
  const syncScriptPath = path.join(projectRoot, 'sync.sh');
  return fs.existsSync(syncScriptPath);
}

/**
 * 执行同步脚本
 * @param {string} mode - 同步模式
 * @param {string} message - 提交信息
 * @returns {string} 执行结果
 */
function runSyncScript(mode, message = '') {
  const syncScriptPath = path.join(projectRoot, 'sync.sh');
  
  try {
    let command = `bash "${syncScriptPath}"`;
    
    if (mode === 'status') {
      command += ' --status';
    } else if (mode === 'push-only') {
      command += ' --push-only';
    } else if (mode === 'offline') {
      command += ` --offline "${message}"`;
    } else {
      command += ` "${message}"`;
    }
    
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error('执行同步脚本时出错:', error.message);
    return error.message;
  }
}

/**
 * 创建GitHub Desktop集成日志
 * @param {string} message - 日志信息
 */
function logToDesktop(message) {
  const logPath = path.join(projectRoot, '.github', 'desktop-log.txt');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(logPath, logEntry);
  } catch (error) {
    console.error('写入日志时出错:', error.message);
  }
}

// 导出集成函数
module.exports = {
  checkSyncScript,
  runSyncScript,
  logToDesktop
}; 