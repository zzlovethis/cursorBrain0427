// detail.js
Page({
  data: {
    itemId: '',
    itemType: '',
    item: {},
    comments: [],
    relatedItems: [],
    isCommentInputVisible: false,
    isOverlayVisible: false,
    commentText: ''
  },

  onLoad(options) {
    // Get item id and type from the URL parameters
    const { id, type } = options;
    
    if (!id || !type) {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({
      itemId: id,
      itemType: type
    });
    
    // Load the item data
    this.loadItemData();
    
    // Load comments
    this.loadComments();
    
    // Load related items
    this.loadRelatedItems();
  },
  
  // Load item data from the database
  async loadItemData() {
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      const db = wx.cloud.database();
      const result = await db.collection(this.data.itemType).doc(this.data.itemId).get();
      
      if (result && result.data) {
        this.setData({
          item: result.data
        });
        
        // Update page title
        wx.setNavigationBarTitle({
          title: result.data.title || '详情'
        });
      } else {
        wx.showToast({
          title: '未找到内容',
          icon: 'error'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to load item data:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // Load comments from the database
  async loadComments() {
    try {
      const db = wx.cloud.database();
      const result = await db.collection('comments')
        .where({
          itemId: this.data.itemId,
          itemType: this.data.itemType
        })
        .orderBy('createTime', 'desc')
        .limit(20)
        .get();
      
      if (result && result.data) {
        // Format comment data
        const formattedComments = result.data.map(comment => {
          return {
            ...comment,
            time: this.formatTime(comment.createTime)
          };
        });
        
        this.setData({
          comments: formattedComments
        });
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  },
  
  // Load related items from the database
  async loadRelatedItems() {
    try {
      const db = wx.cloud.database();
      const _ = db.command;
      
      // Get items of the same type with different ID
      const result = await db.collection(this.data.itemType)
        .where({
          _id: _.neq(this.data.itemId)
        })
        .limit(10)
        .get();
      
      if (result && result.data) {
        this.setData({
          relatedItems: result.data
        });
      }
    } catch (error) {
      console.error('Failed to load related items:', error);
    }
  },
  
  // Format timestamp to readable date
  formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return '刚刚';
    } else if (diffMin < 60) {
      return `${diffMin}分钟前`;
    } else if (diffHour < 24) {
      return `${diffHour}小时前`;
    } else if (diffDay < 30) {
      return `${diffDay}天前`;
    } else {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  
  // Navigate back
  goBack() {
    wx.navigateBack();
  },
  
  // Show more options
  showMoreOptions() {
    wx.showActionSheet({
      itemList: ['分享', '收藏', '举报'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: // Share
            this.onCustomShare();
            break;
          case 1: // Bookmark
            this.toggleBookmark();
            break;
          case 2: // Report
            wx.showToast({
              title: '举报功能开发中',
              icon: 'none'
            });
            break;
        }
      }
    });
  },
  
  // Toggle bookmark status
  async toggleBookmark() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'userInteraction',
        data: {
          action: 'bookmark',
          itemId: this.data.itemId,
          itemType: this.data.itemType
        }
      });
      
      if (result.result.success) {
        wx.showToast({
          title: result.result.isBookmarked ? '已收藏' : '已取消收藏',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },
  
  // Open a chapter
  openChapter(e) {
    const { id } = e.currentTarget.dataset;
    const chapter = this.data.item.chapters.find(c => c.id === id);
    
    if (!chapter) return;
    
    wx.navigateTo({
      url: `/pages/chapter/chapter?id=${id}&itemId=${this.data.itemId}&itemType=${this.data.itemType}`
    });
  },
  
  // Open a related item
  openRelatedItem(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}&type=${this.data.itemType}`
    });
  },
  
  // Show comment input
  showCommentInput() {
    this.setData({
      isCommentInputVisible: true,
      isOverlayVisible: true
    });
  },
  
  // Hide comment input
  hideCommentInput() {
    this.setData({
      isCommentInputVisible: false,
      isOverlayVisible: false
    });
  },
  
  // Handle comment text change
  onCommentTextChange(e) {
    this.setData({
      commentText: e.detail.value
    });
  },
  
  // Submit a comment
  async submitComment() {
    if (!this.data.commentText.trim()) {
      wx.showToast({
        title: '评论不能为空',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '发表中...'
    });
    
    try {
      const db = wx.cloud.database();
      const userInfo = wx.getStorageSync('userInfo') || {};
      const openid = wx.getStorageSync('openid');
      
      if (!openid) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      // Add comment to database
      await db.collection('comments').add({
        data: {
          itemId: this.data.itemId,
          itemType: this.data.itemType,
          content: this.data.commentText,
          createTime: db.serverDate(),
          openid,
          username: userInfo.nickName || '匿名用户',
          avatarUrl: userInfo.avatarUrl || '/images/default-avatar.png',
          likeCount: 0
        }
      });
      
      // Update comment count in the content collection
      await db.collection(this.data.itemType).doc(this.data.itemId).update({
        data: {
          commentCount: db.command.inc(1)
        }
      });
      
      wx.showToast({
        title: '评论成功',
        icon: 'success'
      });
      
      // Reset and refresh
      this.setData({
        commentText: '',
        isCommentInputVisible: false,
        isOverlayVisible: false
      });
      
      this.loadComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
      wx.showToast({
        title: '评论失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // Like a comment
  async likeComment(e) {
    const { id } = e.currentTarget.dataset;
    const commentIndex = this.data.comments.findIndex(comment => comment._id === id);
    
    if (commentIndex === -1) return;
    
    try {
      const db = wx.cloud.database();
      const comment = this.data.comments[commentIndex];
      const isLiked = comment.isLiked;
      
      // Update UI first for better user experience
      const newComments = [...this.data.comments];
      newComments[commentIndex] = {
        ...newComments[commentIndex],
        isLiked: !isLiked,
        likeCount: isLiked ? Math.max(0, comment.likeCount - 1) : comment.likeCount + 1
      };
      
      this.setData({
        comments: newComments
      });
      
      // Update database
      await db.collection('comments').doc(id).update({
        data: {
          likeCount: db.command.inc(isLiked ? -1 : 1)
        }
      });
      
      // Record like in a separate collection
      const openid = wx.getStorageSync('openid');
      if (!openid) return;
      
      const likeCollection = db.collection('commentLikes');
      const existingLike = await likeCollection.where({
        commentId: id,
        openid
      }).get();
      
      if (existingLike.data.length > 0 && isLiked) {
        // Remove like
        await likeCollection.doc(existingLike.data[0]._id).remove();
      } else if (existingLike.data.length === 0 && !isLiked) {
        // Add like
        await likeCollection.add({
          data: {
            commentId: id,
            openid,
            createTime: db.serverDate()
          }
        });
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
      
      // Revert UI changes
      this.loadComments();
    }
  },
  
  // Reply to a comment
  replyComment(e) {
    const { id } = e.currentTarget.dataset;
    const comment = this.data.comments.find(c => c._id === id);
    
    if (!comment) return;
    
    this.setData({
      isCommentInputVisible: true,
      isOverlayVisible: true,
      commentText: `回复 @${comment.username}：`
    });
  },
  
  // Hide overlay
  hideOverlay() {
    this.setData({
      isCommentInputVisible: false,
      isOverlayVisible: false
    });
  },
  
  // Custom share handling
  onCustomShare(e) {
    const item = this.data.item;
    
    // Record share interaction
    wx.cloud.callFunction({
      name: 'userInteraction',
      data: {
        action: 'share',
        itemId: this.data.itemId,
        itemType: this.data.itemType
      }
    }).catch(error => {
      console.error('Failed to record share:', error);
    });
  },
  
  // Share app message
  onShareAppMessage() {
    const item = this.data.item;
    return {
      title: item.title || '分享内容',
      path: `/pages/detail/detail?id=${this.data.itemId}&type=${this.data.itemType}`,
      imageUrl: item.coverUrl
    };
  },
  
  // Share to timeline
  onShareTimeline() {
    const item = this.data.item;
    return {
      title: item.title || '分享内容',
      query: `id=${this.data.itemId}&type=${this.data.itemType}`,
      imageUrl: item.coverUrl
    };
  }
}) 