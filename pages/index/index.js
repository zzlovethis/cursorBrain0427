// index.js
const app = getApp()

// 屏幕宽高
let windowWidth = 0;
let windowHeight = 0;

// 按钮的默认位置（右下角）
const BUTTON_SIZE = 85; // rpx
const BUTTON_RADIUS = BUTTON_SIZE / 2;
const DEFAULT_POSITION = {
  x: 0,
  y: 0
};

// 动画相关
let animationTimer = null;
let velocityX = 0;
let velocityY = 0;
const FRICTION = 0.95; // 摩擦系数
const RETURN_THRESHOLD = 0.5; // 速度阈值，低于此值认为已停止

// 光线传感器
let lightSensor = null;
// 光线阈值
const LIGHT_THRESHOLD = {
  DARK: 10,    // 10 lux以下为暗环境
  NORMAL: 100, // 10-100 lux为正常环境
  BRIGHT: 1000 // 100 lux以上为亮环境
};

// 常量定义
const PLACEHOLDER_TEXT = '快速记录你的想法...';
const WINDOW_WIDTH = wx.getSystemInfoSync().windowWidth;
const WINDOW_HEIGHT = wx.getSystemInfoSync().windowHeight;
const DEFAULT_BUTTON_POSITION = {
  x: WINDOW_WIDTH - 70,
  y: WINDOW_HEIGHT - 140
};

Page({
  data: {
    // 面板控制
    panelVisible: false,
    carouselVisible: false,
    phoneNumber: '13031260794',
    currentSwiperIndex: 0, // 添加当前轮播索引
    menuItems: [
      { id: 1, name: '选项1' },
      { id: 2, name: '选项2' },
      { id: 3, name: '选项3' },
      { id: 4, name: '选项4' }
    ],
    
    // 书籍数据
    recommendedBooks: [
      { id: 1, title: '深度工作', coverUrl: 'https://picsum.photos/180/240?random=1' },
      { id: 2, title: '被讨厌的勇气', coverUrl: 'https://picsum.photos/180/240?random=2' },
      { id: 3, title: '小王子', coverUrl: 'https://picsum.photos/180/240?random=3' },
      { id: 4, title: '人类简史', coverUrl: 'https://picsum.photos/180/240?random=4' }
    ],
    popularBooks: [
      { id: 1, title: '活着', coverUrl: 'https://picsum.photos/180/240?random=5' },
      { id: 2, title: '三体', coverUrl: 'https://picsum.photos/180/240?random=6' },
      { id: 3, title: '围城', coverUrl: 'https://picsum.photos/180/240?random=7' },
      { id: 4, title: '红楼梦', coverUrl: 'https://picsum.photos/180/240?random=8' }
    ],
    otherBookSections: [
      {
        id: 1,
        title: '心理学',
        books: [
          { id: 1, title: '思考快与慢', coverUrl: 'https://picsum.photos/180/240?random=9' },
          { id: 2, title: '乌合之众', coverUrl: 'https://picsum.photos/180/240?random=10' },
          { id: 3, title: '自控力', coverUrl: 'https://picsum.photos/180/240?random=11' }
        ]
      },
      {
        id: 2,
        title: '经济学',
        books: [
          { id: 1, title: '国富论', coverUrl: 'https://picsum.photos/180/240?random=12' },
          { id: 2, title: '小岛经济学', coverUrl: 'https://picsum.photos/180/240?random=13' },
          { id: 3, title: '经济学原理', coverUrl: 'https://picsum.photos/180/240?random=14' }
        ]
      },
      {
        id: 3,
        title: '小说',
        books: [
          { id: 1, title: '百年孤独', coverUrl: 'https://picsum.photos/180/240?random=15' },
          { id: 2, title: '1984', coverUrl: 'https://picsum.photos/180/240?random=16' },
          { id: 3, title: '动物农场', coverUrl: 'https://picsum.photos/180/240?random=17' }
        ]
      }
    ],
    
    // 模块列表（九宫格）数据
    moduleItems: [
      { id: 1, name: '模块一' },
      { id: 2, name: '模块二' },
      { id: 3, name: '模块三' },
      { id: 4, name: '模块四' },
      { id: 5, name: '模块五' },
      { id: 6, name: '模块六' },
      { id: 7, name: '模块七' },
      { id: 8, name: '模块八' },
      { id: 9, name: '模块九' }
    ],
    
    // 工具项列表数据
    toolItems: [
      { id: 1, name: '工具一' },
      { id: 2, name: '工具二' },
      { id: 3, name: '工具三' },
      { id: 4, name: '工具四' }
    ],
    
    // 消息列表数据
    messageList: [
      { id: 1, name: '消息一' },
      { id: 2, name: '消息二' },
      { id: 3, name: '消息三' }
    ],
    
    // 个人设置项
    settingsItems: [
      { id: 1, name: '个人资料' },
      { id: 2, name: '账号安全' },
      { id: 3, name: '隐私设置' }
    ],
    
    // 系统设置项
    systemSettings: [
      { id: 1, name: '通知设置' },
      { id: 2, name: '主题选择' },
      { id: 3, name: '关于我们' }
    ],
    
    // 按钮位置 - 修正为默认在右下角
    buttonPosition: {
      x: DEFAULT_BUTTON_POSITION.x,
      y: DEFAULT_BUTTON_POSITION.y
    },
    
    // 拖拽状态
    isDragging: false,
    
    // 环境光线状态
    lightEnvironment: 'normal', // 'dark', 'normal', 'light'
    
    // 按钮缩放比例
    buttonScale: 1,
    
    // 新增数据 - 编辑相关
    isEditPanelVisible: false,
    selectedMedia: null,
    isPlaying: false,
    audioProgress: 0,
    audioTime: '00:00/00:00',
    audioTranscript: '这是音频的文字转录内容，随着音频播放会自动滚动显示当前正在播放的内容...',
    transcriptScroll: 0,
    
    // 模拟音频播放计时器
    audioTimer: null,
    
    // 网格菜单相关数据
    isGridMenuVisible: false,
    editGridItems: [
      { id: 1, name: '下载到本地' },
      { id: 2, name: '自动阅读' },
      { id: 3, name: '添加书签' },
      { id: 4, name: '添加到书单' },
      { id: 5, name: '全文搜索' },
      { id: 6, name: '查看笔记' },
      { id: 7, name: '热门划线' },
      { id: 8, name: '赠送给朋友' },
      { id: 9, name: '纠错' },
      { id: 10, name: '私密阅读' },
      { id: 11, name: '书友想法' },
      { id: 12, name: '朋友笔记' }
    ],
    
    // 编辑工具列表
    editTools: [
      { id: 1, name: '复制' },
      { id: 2, name: '粘贴' },
      { id: 3, name: '剪切' },
      { id: 4, name: '上传' },
      { id: 5, name: '下载' },
      { id: 6, name: '撤销' },
      { id: 7, name: '重做' },
      { id: 8, name: '格式化' },
      { id: 9, name: '插入图片' }
    ],
    
    // WYSIWYG编辑模式相关数据 - 更新和完善
    isWysiwygMode: false,
    editingText: '',
    editingTitle: '',
    lastSavedText: '',
    lastSavedTitle: '',
    lastSaveTime: 0,
    autoSaveTimer: null,
    isSaving: false,
    
    // 新的WYSIWYG编辑器相关数据
    wysiwygMode: false,
    wysiwygTitle: '',
    wysiwygContent: '',
    isPreviewMode: false,
    showMediaOptions: false,
    carouselVisible: false,
    quoteText1: '我们必须爱自己，才能更好地爱身边的人。',
    quoteText2: '任何值得去的地方，都没有捷径。',
    quoteText3: '平静和自由将会陪伴你终生，你可以微笑着相信，自己有一颗强大的内心。',
    headerTitle: '每日心灵语录',
    
    // 智能提示相关
    showSmartTips: false,
    smartTips: '提示：点击右上角"完成"按钮可以保存您的编辑。',
    
    // 媒体相关
    mediaOptionsVisible: false,
    
    // 手写输入相关
    showHandwritingPanel: false,
    handwritingImage: '',
    
    // 语音输入相关
    showVoiceInputPanel: false,
    voiceInputText: '',
    isRecording: false,
    recordingStatus: '准备录音',
    voiceDuration: '00:00',
    recordingTimer: null,
    
    // 文章内容
    isTemplateMode: false,
    templates: [
      { id: 1, name: '模板1', content: '这是模板1的内容' },
      { id: 2, name: '模板2', content: '这是模板2的内容' },
      { id: 3, name: '模板3', content: '这是模板3的内容' }
    ],
    selectedTemplate: null,
    isHandwritingMode: false,
    isVoiceInputMode: false,
    isPolishingMode: false,
    isMediaInsertMode: false,
    mediaInsertOptions: [
      { id: 1, name: '图片', icon: 'image' },
      { id: 2, name: '视频', icon: 'video' },
      { id: 3, name: '表情', icon: 'smile' },
      { id: 4, name: '位置', icon: 'location' }
    ],
    previewSize: 'full-width',
    
    // 键盘相关数据
    showKeyboard: false,
    currentInputType: 'content' // 当前输入类型：'title' 或 'content'
  },
  
  // 初始化函数，设置屏幕尺寸和按钮位置
  onLoad: function() {
    console.log('页面onLoad开始...');
    
    // 获取屏幕尺寸
    const sysInfo = wx.getSystemInfoSync();
    windowWidth = sysInfo.windowWidth;
    windowHeight = sysInfo.windowHeight;
    
    // 设置按钮初始位置在右下角
    const initialButtonX = windowWidth - 70;
    const initialButtonY = windowHeight - 140;
    
    this.setData({
      buttonPosition: {
        x: initialButtonX,
        y: initialButtonY
      }
    });
    
    // 初始化其他全局变量
    DEFAULT_POSITION.x = initialButtonX;
    DEFAULT_POSITION.y = initialButtonY;
    
    // 初始化键盘隐藏计时器
    this.keyboardHideTimer = null;
    
    // 监听键盘事件
    wx.onKeyboardHeightChange((res) => {
      console.log('键盘高度变化:', res.height);
      
      // 如果键盘高度为0，说明键盘已关闭
      if (res.height === 0) {
        // 延迟一段时间再隐藏工具栏，以便用户可能从一个输入切换到另一个
        this.keyboardHideTimer = setTimeout(() => {
          this.setData({
            showKeyboard: false
          });
        }, 300);
      } else {
        // 键盘显示，确保工具栏显示
        this.setData({
          showKeyboard: true
        });
        
        // 清除任何现有的隐藏计时器
        if (this.keyboardHideTimer) {
          clearTimeout(this.keyboardHideTimer);
          this.keyboardHideTimer = null;
        }
      }
    });
    
    console.log('页面加载完成，按钮位置初始化为：', {
      x: initialButtonX,
      y: initialButtonY,
      screenWidth: windowWidth,
      screenHeight: windowHeight
    });
    
    // 设置页面渲染完成后的回调，确保按钮位置正确
    wx.nextTick(() => {
    this.setData({
        buttonPosition: {
          x: initialButtonX,
          y: initialButtonY
        }
      });
      console.log('页面渲染完成后再次确认按钮位置');
    });
  },

  // 页面显示时检查按钮位置
  onShow: function() {
    console.log('页面onShow，当前按钮位置：', this.data.buttonPosition);
    
    // 获取最新的屏幕尺寸（以防旋转或尺寸变化）
    const sysInfo = wx.getSystemInfoSync();
    windowWidth = sysInfo.windowWidth;
    windowHeight = sysInfo.windowHeight;
    
    // 如果按钮位置不正确，重设位置
    if (this.data.buttonPosition.x === 0 || this.data.buttonPosition.y === 0 || 
        !this.data.buttonPosition.x || !this.data.buttonPosition.y) {
      const correctX = windowWidth - 70;
      const correctY = windowHeight - 140;
      
      this.setData({
        buttonPosition: {
          x: correctX,
          y: correctY
        }
      });
      
      console.log('按钮位置已重设为：', {x: correctX, y: correctY});
    }
  },
  
  // 页面尺寸变化时更新按钮位置
  onResize: function(e) {
    // 获取新的屏幕尺寸
    const { windowWidth: newWidth, windowHeight: newHeight } = e.size;
    windowWidth = newWidth;
    windowHeight = newHeight;
    
    // 更新按钮位置
    const newButtonX = newWidth - 70;
    const newButtonY = newHeight - 140;
    
    this.setData({
      buttonPosition: {
        x: newButtonX,
        y: newButtonY
      }
    });
    
    console.log('屏幕尺寸变化，按钮位置已更新为：', {x: newButtonX, y: newButtonY});
  },

  // 页面卸载时清理资源
  onUnload: function() {
    console.log('页面onUnload，清理资源...');
    
    // 清理所有计时器
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
    
    if (this.fallTimer) {
      clearTimeout(this.fallTimer);
      this.fallTimer = null;
    }
    
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    if (this.keyboardHideTimer) {
      clearTimeout(this.keyboardHideTimer);
      this.keyboardHideTimer = null;
    }
    
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }
    
    // 移除键盘事件监听器
    wx.offKeyboardHeightChange();
    
    // 确保保存最新草稿
    if (this.data.wysiwygMode) {
      this.saveDraft();
    }
    
    // 清除其他可能的引用
    animationTimer = null;
    velocityX = 0;
    velocityY = 0;
    lightSensor = null;
  },

  // 切换WYSIWYG编辑模式
  toggleWYSIWYGMode: function() {
    // 如果已经在编辑模式，先提示用户保存更改
    if (this.data.wysiwygMode) {
      wx.showModal({
        title: '编辑未保存',
        content: '是否保存当前更改？',
        confirmText: '保存',
        cancelText: '放弃',
        success: (res) => {
          if (res.confirm) {
            // 用户点击了保存
            this.saveWysiwygContent();
          } else {
            // 用户放弃更改，直接退出
            this.exitWysiwygMode();
          }
        }
      });
    } else {
      // 进入编辑模式
      this.enterWysiwygMode();
    }
  },

  // 进入WYSIWYG编辑模式
  enterWysiwygMode: function() {
    // 检查是否有保存的草稿
    try {
      const draftContent = wx.getStorageSync('draft_content');
      const draftTitle = wx.getStorageSync('draft_title');
      const draftSaveTime = wx.getStorageSync('draft_save_time');
      
      if (draftContent && draftSaveTime) {
        // 计算上次保存时间
        const now = Date.now();
        const saveTimeAgo = now - draftSaveTime;
        const minutesAgo = Math.floor(saveTimeAgo / (1000 * 60));
        
        // 如果草稿保存在过去24小时内，询问是否恢复
        if (saveTimeAgo < 24 * 60 * 60 * 1000) {
          wx.showModal({
            title: '发现未完成的草稿',
            content: `${minutesAgo}分钟前有一个未完成的草稿，是否恢复？`,
            confirmText: '恢复',
            cancelText: '不需要',
            success: (res) => {
              if (res.confirm) {
                // 用户选择恢复草稿
                this.setData({
                  wysiwygMode: true,
                  wysiwygTitle: draftTitle || '',
                  wysiwygContent: draftContent,
                  lastSavedText: draftContent,
                  lastSavedTitle: draftTitle || '',
                  lastSaveTime: draftSaveTime,
                  carouselVisible: false // 关闭轮播面板
                });
                
                wx.showToast({
                  title: '草稿已恢复',
                  icon: 'success'
                });
              } else {
                // 用户选择不恢复，使用当前内容
                this.loadCurrentContent();
                
                // 清除旧草稿
                wx.removeStorageSync('draft_content');
                wx.removeStorageSync('draft_title');
                wx.removeStorageSync('draft_save_time');
              }
            }
          });
          return;
        }
      }
    } catch(e) {
      console.error('读取草稿失败:', e);
    }
    
    // 没有可用草稿或草稿太旧，使用当前内容
    this.loadCurrentContent();
  },
  
  // 加载当前显示的内容到编辑器
  loadCurrentContent: function() {
    // 检查当前显示内容，并设置为初始编辑内容
    const initialContent = this.data.quoteText1 + 
                         (this.data.quoteText2 ? '\n\n' + this.data.quoteText2 : '') + 
                         (this.data.quoteText3 ? '\n\n' + this.data.quoteText3 : '');
    
    this.setData({
      wysiwygMode: true,
      wysiwygTitle: this.data.headerTitle || '',
      wysiwygContent: initialContent,
      lastSavedText: initialContent,
      lastSavedTitle: this.data.headerTitle || '',
      lastSaveTime: Date.now(),
      carouselVisible: false // 关闭轮播面板
    });
  },

  // 退出WYSIWYG编辑模式
  exitWysiwygMode: function() {
    this.setData({
      wysiwygMode: false,
      showMediaOptions: false,
      isPreviewMode: false
    });
  },

  // 保存编辑内容
  saveWysiwygContent: function() {
    // 显示保存中的加载提示
    wx.showLoading({
      title: '保存中...',
    });
    
    // 分割文本为段落
    const paragraphs = this.data.wysiwygContent.split('\n\n');
    
    // 保存操作
    setTimeout(() => {
      this.setData({
        quoteText1: paragraphs[0] || '',
        quoteText2: paragraphs[1] || '',
        quoteText3: paragraphs[2] || '',
        headerTitle: this.data.wysiwygTitle,
        wysiwygMode: false,
        showMediaOptions: false,
        isPreviewMode: false
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }, 800);
  },

  // 切换预览模式
  togglePreviewMode: function() {
    this.setData({
      isPreviewMode: !this.data.isPreviewMode,
      showMediaOptions: false // 关闭媒体选项
    });
  },

  // 关闭预览
  closePreview: function() {
    this.setData({
      isPreviewMode: false
    });
  },

  // 更新标题
  onTitleInput: function(e) {
    this.setData({
      wysiwygTitle: e.detail.value
    });
    
    // 添加自动保存
    this.scheduleDraftAutoSave();
  },

  // 更新内容
  onContentInput: function(e) {
    this.setData({
      wysiwygContent: e.detail.value
    });
    
    // 添加自动保存
    this.scheduleDraftAutoSave();
  },

  // 调度自动保存草稿操作
  scheduleDraftAutoSave: function() {
    // 清除现有的自动保存计时器
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    // 设置新的自动保存计时器（3秒后触发）
    this.autoSaveTimer = setTimeout(() => {
      this.saveDraft();
    }, 3000);
  },
  
  // 保存草稿内容
  saveDraft: function() {
    // 只有当内容有变化时才保存
    const currentContent = this.data.wysiwygContent;
    const currentTitle = this.data.wysiwygTitle;
    
    if (currentContent !== this.data.lastSavedText || 
        currentTitle !== this.data.lastSavedTitle) {
      
      console.log('自动保存草稿...');
      
      // 更新最后保存的内容和时间
      this.setData({
        lastSavedText: currentContent,
        lastSavedTitle: currentTitle,
        lastSaveTime: Date.now()
      });
      
      // 在真实场景中，这里可以添加存储到本地或服务器的逻辑
      try {
        wx.setStorageSync('draft_content', currentContent);
        wx.setStorageSync('draft_title', currentTitle);
        wx.setStorageSync('draft_save_time', Date.now());
        
        // 可选：显示小型保存成功提示（不打扰用户）
        wx.showToast({
          title: '已自动保存',
          icon: 'none',
          duration: 1000
        });
      } catch(e) {
        console.error('保存草稿失败:', e);
      }
    }
  },
  
  // 发布内容（完成最终保存）
  publishContent: function() {
    // 确保最新内容已保存
    this.saveDraft();
    
    // 显示保存中的加载提示
    wx.showLoading({
      title: '正在发布...',
    });
    
    // 分割文本为段落
    const paragraphs = this.data.wysiwygContent.split('\n\n');
    
    // 发布操作（保存并退出编辑模式）
    setTimeout(() => {
      this.setData({
        quoteText1: paragraphs[0] || '',
        quoteText2: paragraphs[1] || '',
        quoteText3: paragraphs[2] || '',
        headerTitle: this.data.wysiwygTitle,
        wysiwygMode: false,
        showMediaOptions: false,
        isPreviewMode: false
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000
      });
      
      // 清除草稿
      wx.removeStorageSync('draft_content');
      wx.removeStorageSync('draft_title');
      wx.removeStorageSync('draft_save_time');
    }, 1000);
  },

  // 显示键盘及工具栏
  showKeyboard: function(e) {
    const inputType = e.currentTarget.dataset.inputType;
    
    // 清除任何现有的隐藏计时器
    if (this.keyboardHideTimer) {
      clearTimeout(this.keyboardHideTimer);
      this.keyboardHideTimer = null;
    }
    
    // 添加轻微震动反馈
    wx.vibrateShort({ type: 'light' });
    
    this.setData({
      showKeyboard: true,
      currentInputType: inputType
    });
  },
  
  // 隐藏键盘及工具栏
  hideKeyboard: function() {
    // 使用计时器延迟隐藏，防止在切换输入框时闪烁
    this.keyboardHideTimer = setTimeout(() => {
      this.setData({
        showKeyboard: false
      });
    }, 200);
  },
  
  // 处理工具栏项目点击
  onToolbarItemTap: function(e) {
    const tool = e.currentTarget.dataset.tool;
    
    switch(tool) {
      case 'emoji':
        wx.showToast({
          title: '表情功能开发中',
          icon: 'none'
        });
        break;
      case 'voice':
        wx.showToast({
          title: '语音输入功能开发中',
          icon: 'none'
        });
        break;
      case 'pen':
        wx.showToast({
          title: '手写输入功能开发中',
          icon: 'none'
        });
        break;
      case 'search':
        wx.showToast({
          title: '文本搜索功能开发中',
          icon: 'none'
        });
        break;
    }
  },

  // 切换媒体选项菜单显示
  toggleMediaOptions: function() {
    this.setData({
      showMediaOptions: !this.data.showMediaOptions
    });
  },

  // 隐藏媒体选项菜单
  hideMediaOptions: function() {
    this.setData({
      showMediaOptions: false
    });
  },

  // 处理媒体选项点击
  onMediaOptionTap: function(e) {
    const option = e.currentTarget.dataset.option;
    
    switch(option) {
      case 'save':
        this.saveWysiwygContent();
        break;
      case 'preview':
        this.togglePreviewMode();
        break;
      case 'announcement':
        // 公告功能
        wx.showToast({
          title: '公告功能开发中',
          icon: 'none'
        });
        break;
      case 'share':
        // 分享功能
        wx.showToast({
          title: '分享功能开发中',
          icon: 'none'
        });
        break;
      case 'custom':
        // 自定义功能
        wx.showToast({
          title: '自定义功能开发中',
          icon: 'none'
        });
        break;
      case 'image':
        // 图片功能
        this.addImageToEditor();
        break;
      case 'handwriting':
        // 手写功能
        wx.showToast({
          title: '手写功能开发中',
          icon: 'none'
        });
        break;
      case 'voice':
        // 语音功能
        wx.showToast({
          title: '语音功能开发中',
          icon: 'none'
        });
        break;
    }
    
    // 操作后隐藏菜单
    this.hideMediaOptions();
  },

  // 添加图片到编辑器
  addImageToEditor: function() {
    // 从相册或相机选择图片
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 在当前编辑内容末尾添加图片描述
        const imageDescription = '\n\n[图片描述：在此输入图片描述]\n\n';
        this.setData({
          wysiwygContent: this.data.wysiwygContent + imageDescription
        });
        
        wx.showToast({
          title: '图片已添加',
          icon: 'success'
        });
      }
    });
  },

  // 切换面板时的处理
  toggleCarousel: function() {
    console.log('toggleCarousel 被调用，当前面板状态:', this.data.carouselVisible);
    
    // 如果正在编辑模式中，不允许切换轮播面板
    if (this.data.wysiwygMode) {
      wx.showToast({
        title: '请先退出编辑模式',
        icon: 'none'
      });
      return;
    }
    
    // 如果正在拖拽中，不进行面板切换
    if (this.data.isDragging) {
      console.log('正在拖拽中，忽略面板切换操作');
      return;
    }
    
    // 如果原始面板可见，先隐藏它
    if (this.data.panelVisible) {
      this.setData({
        panelVisible: false
      });
    }
    
    // 获取屏幕信息
    const { windowWidth, windowHeight } = wx.getSystemInfoSync();
    const BUTTON_SIZE = 42.5; // 85rpx转换为px
    
    // 计算悬浮窗高度（假设为屏幕高度的70%加上250rpx，和CSS中一致）
    const rpxToPx = windowWidth / 750; // rpx到px的转换率
    const extraHeight = 250 * rpxToPx; // 额外高度250rpx转为px
    const panelHeight = windowHeight * 0.7 + extraHeight;
    
    // 如果悬浮窗已打开，点击按钮时关闭它并恢复按钮位置
    if (this.data.carouselVisible) {
      console.log('关闭悬浮窗');
      
      // 保存当前水平位置
      const currentX = this.data.buttonPosition.x;
      
        this.setData({
        carouselVisible: false
      });
      
      // 使用平滑的动画回到原位
      this.returnToOriginalPosition();
      
      return;
    }
    
    // 保存当前水平位置
    const currentX = this.data.buttonPosition.x;
    
    // 计算悬浮窗底部位置 - 考虑到面板向上增高了55rpx（从CSS中获取）
    const panelTopOffset = 55 * rpxToPx; // 面板上移距离
    const panelBottom = (windowHeight * 0.5 - panelTopOffset) + panelHeight / 2; 
    
    // 按钮新的垂直位置（悬浮窗口下方，与窗口底部保持20rpx间距）
    const buttonOffset = 20 * rpxToPx; // 20rpx转为px
    const newButtonY = panelBottom + buttonOffset;
    
    // 先打开悬浮窗
      this.setData({
      carouselVisible: true
    });
    
    // 然后执行自由落体动画
    this.animateButtonFreefall(currentX, newButtonY);
  },
  
  // 返回原始位置
  returnToOriginalPosition: function() {
    // 清除任何现有的动画计时器
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    
    // 设置目标位置（屏幕右下角附近）
    const targetX = systemInfo.windowWidth - 70;
    const targetY = systemInfo.windowHeight - 140;
    
    // 当前位置
    const currentX = this.data.buttonPosition.x;
    const currentY = this.data.buttonPosition.y;
    
    // 计算距离
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 如果已经非常接近目标位置，直接设置为目标位置
    if (distance < 5) {
      this.setData({
        buttonPosition: {
          x: targetX,
          y: targetY
        }
      });
      return;
    }
    
    // 计算每一步的移动量（使用弹性缓动）
    const stepX = dx * 0.1;
    const stepY = dy * 0.1;
    
    // 更新位置
    this.setData({
      buttonPosition: {
        x: currentX + stepX,
        y: currentY + stepY
      }
    });
    
    // 继续动画直到足够接近目标
    this.animationTimer = setTimeout(() => {
      this.returnToOriginalPosition();
    }, 16); // 大约60fps
  },

  // 关闭面板
  closePanel: function() {
    // 关闭所有面板
    this.setData({
      panelVisible: false,
      carouselVisible: false
    });
    
    // 返回原始位置
    this.returnToOriginalPosition();
    
    console.log('Panel closed, button returning to original position');
  },
  
  // 切换页面
  switchToPage: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentSwiperIndex: index
    });
  },

  // 自由落体动画
  animateButtonFreefall: function(targetX, targetY) {
    // 取消之前可能的动画
    if (this.fallTimer) {
      clearTimeout(this.fallTimer);
    }
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
    
    // 获取当前位置
    const startY = this.data.buttonPosition.y;
    
    // 动画参数
    const gravity = 0.8; // 重力加速度
    let velocity = 0; // 初始速度
    const friction = 0.8; // 反弹摩擦系数
    let time = 0;
    const duration = 1000; // 最长持续时间(ms)，防止无限动画
    const startTime = Date.now();
    
    // 自定义弹跳计数（只允许有限次数的弹跳）
    let bounceCount = 0;
    const maxBounces = 2;
    
    // 动画帧函数
    const animate = () => {
      // 计算经过的时间
      const elapsedTime = Date.now() - startTime;
      
      // 安全检查：如果动画时间过长，直接结束
      if (elapsedTime > duration) {
        this.setData({
          buttonPosition: {
            x: targetX,
            y: targetY
          }
        });
        return;
      }
      
      // 当前位置
      const { y } = this.data.buttonPosition;
      
      // 增加速度（模拟重力）
      velocity += gravity;
      
      // 计算新位置
      let newY = y + velocity;
      
      // 如果碰到目标位置（地面）
      if (newY >= targetY) {
        newY = targetY;
        
        // 只有在弹跳次数未达到最大值时才反弹
        if (bounceCount < maxBounces) {
          // 反弹（速度反向且衰减）
          velocity = -velocity * friction;
          bounceCount++;
          
          // 添加震动反馈
          wx.vibrateShort({ type: 'light' });
          
          // 缩放动画效果
          this.setData({
            buttonScale: 0.9
          });
          
          setTimeout(() => {
            this.setData({
              buttonScale: 1
            });
          }, 100);
        } else {
          // 达到最大弹跳次数，停止动画
          velocity = 0;
        }
      }
      
      // 当速度很小且位置接近目标时，结束动画
      if (Math.abs(velocity) < 0.2 && Math.abs(newY - targetY) < 0.5) {
        this.setData({
          buttonPosition: {
            x: targetX,
            y: targetY
          }
        });
        return;
      }
      
      // 更新按钮位置
      this.setData({
        buttonPosition: {
          x: targetX,
          y: newY
        }
      });
      
      // 继续下一帧
      this.fallTimer = setTimeout(animate, 16);
    };
    
    // 开始动画
    animate();
  },

  // 随机跳跃动画
  randomJump: function(initialVelocityX, initialVelocityY) {
    // 清除任何现有的动画计时器
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
    }
    
    // 获取屏幕尺寸
    const systemInfo = wx.getSystemInfoSync();
    const screenWidth = systemInfo.windowWidth;
    const screenHeight = systemInfo.windowHeight;
    
    // 按钮尺寸（rpx转px）
    const BUTTON_SIZE = 100 * screenWidth / 750;
    
    // 初始速度（增加因子使动画更加明显）
    let velocityX = initialVelocityX * 3; // 增加初始速度
    let velocityY = initialVelocityY * 3; // 增加初始速度
    
    // 物理参数
    const gravity = 0.8;        // 增加重力加速度
    const friction = 0.975;     // 减少摩擦力以延长动画
    const elasticity = 0.9;     // 提高弹性系数使反弹更有力
    
    // 振动计时器，避免频繁振动
    let lastVibrationTime = 0;
    // 弹跳计数
    let bounceCount = 0;
    const maxBounces = 12; // 增加最大弹跳次数
    
    // 添加随机初始角度
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (speed < 5) { // 如果初始速度太小，给它一个随机方向的推力
      velocityX = Math.cos(angle) * 20;
      velocityY = Math.sin(angle) * 20;
    }
    
    // 动画函数
    const animate = () => {
      // 应用重力
      velocityY += gravity;
      
      // 应用摩擦力
      velocityX *= friction;
      velocityY *= friction;
      
      // 当前位置
      let newX = this.data.buttonPosition.x + velocityX;
      let newY = this.data.buttonPosition.y + velocityY;
      
      // 边界碰撞检测
      let didBounce = false;
      
      // 边界检查 - 左右边界
      if (newX < BUTTON_SIZE/2) {
        newX = BUTTON_SIZE/2;
        velocityX = -velocityX * elasticity;
        // 每次弹跳增加一些随机性
        velocityY += (Math.random() - 0.5) * 8;
        didBounce = true;
      } else if (newX > screenWidth - BUTTON_SIZE/2) {
        newX = screenWidth - BUTTON_SIZE/2;
        velocityX = -velocityX * elasticity;
        // 每次弹跳增加一些随机性
        velocityY += (Math.random() - 0.5) * 8;
        didBounce = true;
      }
      
      // 边界检查 - 上下边界
      if (newY < BUTTON_SIZE/2) {
        newY = BUTTON_SIZE/2;
        velocityY = -velocityY * elasticity;
        // 每次弹跳增加一些随机性
        velocityX += (Math.random() - 0.5) * 8;
        didBounce = true;
      } else if (newY > screenHeight - BUTTON_SIZE/2) {
        newY = screenHeight - BUTTON_SIZE/2;
        velocityY = -velocityY * elasticity;
        // 每次弹跳增加一些随机性
        velocityX += (Math.random() - 0.5) * 8;
        didBounce = true;
      }
      
      // 如果发生弹跳
      if (didBounce) {
        bounceCount++;
        
        // 振动反馈（限制频率）
        const now = Date.now();
        if (now - lastVibrationTime > 200) { // 减少振动间隔
          // 根据速度大小调整振动强度
          const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
          if (speed > 15) {
            wx.vibrateShort({ type: 'heavy' });
          } else if (speed > 8) {
            wx.vibrateShort({ type: 'medium' });
          } else {
            wx.vibrateShort({ type: 'light' });
          }
          lastVibrationTime = now;
        }
        
        // 按钮缩放动画效果 - 让缩放更夸张
        this.setData({
          buttonScale: 0.85
        });
        
        setTimeout(() => {
          this.setData({
            buttonScale: 1.15
          });
          
          setTimeout(() => {
            this.setData({
              buttonScale: 1
            });
          }, 100);
        }, 100);
        
        // 弹跳次数过多，增加阻尼减速更快
        if (bounceCount > maxBounces * 0.7) {
          velocityX *= 0.9;
          velocityY *= 0.9;
        }
      }
      
      // 更新按钮位置
      this.setData({
        buttonPosition: {
          x: newX,
          y: newY
        }
      });
      
      // 如果速度足够小或弹跳次数达到上限，停止动画并返回原位
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (speed < 0.5 || bounceCount >= maxBounces) {
        // 停止前添加轻微振动
        wx.vibrateShort({ type: 'light' });
        
        // 等待一会儿后返回原位
        setTimeout(() => {
          this.returnToOriginalPosition();
        }, 800);
        
        return;
      }
      
      // 继续动画
      this.animationTimer = setTimeout(animate, 16); // 约60fps
    };
    
    // 开始动画前的初始振动
    wx.vibrateShort({ type: 'heavy' });
    
    // 开始动画
    animate();
  },

  // ... existing code ...
}) 