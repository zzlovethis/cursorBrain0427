// actionBar.js
Component({
  properties: {
    itemId: {
      type: String,
      value: ''
    },
    itemType: {
      type: String,
      value: ''
    },
    isFloating: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isActive: {
      view: false,
      like: false,
      bookmark: false
    },
    stats: {
      viewCount: 0,
      likeCount: 0,
      bookmarkCount: 0,
      shareCount: 0
    }
  },

  lifetimes: {
    attached() {
      // Initialize user interactions if itemId and itemType are provided
      if (this.properties.itemId && this.properties.itemType) {
        this.loadStats();
        this.checkUserInteractions();
      }
    }
  },

  methods: {
    // Load interaction statistics for the current item
    async loadStats() {
      try {
        const db = wx.cloud.database();
        const item = await db.collection(this.properties.itemType)
          .doc(this.properties.itemId)
          .field({
            viewCount: true,
            likeCount: true,
            bookmarkCount: true,
            shareCount: true
          })
          .get();
        
        if (item && item.data) {
          this.setData({
            'stats.viewCount': item.data.viewCount || 0,
            'stats.likeCount': item.data.likeCount || 0,
            'stats.bookmarkCount': item.data.bookmarkCount || 0,
            'stats.shareCount': item.data.shareCount || 0
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    },

    // Check which interactions the current user has performed
    async checkUserInteractions() {
      const openid = wx.getStorageSync('openid');
      if (!openid) return;

      try {
        const db = wx.cloud.database();
        
        // Check if user has liked this item
        const likeResult = await db.collection('likes').where({
          openid,
          itemId: this.properties.itemId,
          itemType: this.properties.itemType
        }).count();
        
        // Check if user has bookmarked this item
        const bookmarkResult = await db.collection('bookmarks').where({
          openid,
          itemId: this.properties.itemId,
          itemType: this.properties.itemType
        }).count();

        this.setData({
          'isActive.view': true, // Always mark view as active
          'isActive.like': likeResult.total > 0,
          'isActive.bookmark': bookmarkResult.total > 0
        });
      } catch (error) {
        console.error('Failed to check user interactions:', error);
      }
    },

    // Handle view action
    async handleView() {
      if (!this.properties.itemId || !this.properties.itemType) return;
      
      try {
        const result = await wx.cloud.callFunction({
          name: 'userInteraction',
          data: {
            action: 'view',
            itemId: this.properties.itemId,
            itemType: this.properties.itemType
          }
        });
        
        if (result.result.success) {
          this.setData({
            'isActive.view': true
          });
          this.loadStats();
        }
      } catch (error) {
        console.error('Failed to record view:', error);
      }
    },

    // Handle like action
    async handleLike() {
      if (!this.properties.itemId || !this.properties.itemType) return;
      
      wx.vibrateShort({ type: 'medium' });
      
      try {
        const result = await wx.cloud.callFunction({
          name: 'userInteraction',
          data: {
            action: 'like',
            itemId: this.properties.itemId,
            itemType: this.properties.itemType
          }
        });
        
        if (result.result.success) {
          this.setData({
            'isActive.like': result.result.isLiked,
            'stats.likeCount': this.data.isActive.like 
              ? this.data.stats.likeCount + 1 
              : Math.max(0, this.data.stats.likeCount - 1)
          });
        }
      } catch (error) {
        console.error('Failed to toggle like:', error);
      }
    },

    // Handle bookmark action
    async handleBookmark() {
      if (!this.properties.itemId || !this.properties.itemType) return;
      
      wx.vibrateShort({ type: 'medium' });
      
      try {
        const result = await wx.cloud.callFunction({
          name: 'userInteraction',
          data: {
            action: 'bookmark',
            itemId: this.properties.itemId,
            itemType: this.properties.itemType
          }
        });
        
        if (result.result.success) {
          this.setData({
            'isActive.bookmark': result.result.isBookmarked,
            'stats.bookmarkCount': this.data.isActive.bookmark 
              ? this.data.stats.bookmarkCount + 1 
              : Math.max(0, this.data.stats.bookmarkCount - 1)
          });
        }
      } catch (error) {
        console.error('Failed to toggle bookmark:', error);
      }
    },

    // Handle share action
    handleShare() {
      if (!this.properties.itemId || !this.properties.itemType) return;
      
      // Trigger share sheet
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      
      // Record share action
      wx.cloud.callFunction({
        name: 'userInteraction',
        data: {
          action: 'share',
          itemId: this.properties.itemId,
          itemType: this.properties.itemType
        }
      }).then(result => {
        if (result.result.success) {
          this.setData({
            'stats.shareCount': this.data.stats.shareCount + 1
          });
        }
      }).catch(error => {
        console.error('Failed to record share:', error);
      });
      
      // Trigger a custom event for parent components
      this.triggerEvent('customshare', {
        itemId: this.properties.itemId,
        itemType: this.properties.itemType
      });
    }
  }
})