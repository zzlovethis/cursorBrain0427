// User Interaction Cloud Function
// Created by: Claude Assistant
// Date: 2024

// Cloud Function for logging and tracking user interaction with the time machine features
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// Main cloud function entry point
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  // 获取操作类型和相关数据
  const { action, itemId, itemType } = event
  
  // Validate required parameters
  if (!action) {
    return { success: false, message: 'Missing required parameter: action' }
  }
  
  try {
    switch (action) {
      case 'view':
        return await recordView(openid, itemId, itemType)
      case 'like':
        return await toggleLike(openid, itemId, itemType)
      case 'bookmark':
        return await toggleBookmark(openid, itemId, itemType)
      case 'share':
        return await recordShare(openid, itemId, itemType)
      case 'getUserStats':
        return await getUserStats(openid)
      case 'getQRCode':
        return await generateQRCode(itemId, itemType, event.page)
      default:
        return {
          success: false,
          message: 'Invalid action'
        }
    }
  } catch (error) {
    console.error('Error in userInteraction:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// 记录查看
async function recordView(openid, itemId, itemType) {
  if (!itemId || !itemType) {
    return { success: false, message: 'Missing required parameters' }
  }

  const viewCollection = db.collection('views')
  
  // Check if this user has already viewed this item
  const existingView = await viewCollection.where({
    openid,
    itemId,
    itemType
  }).get()

  if (existingView.data.length === 0) {
    // Record new view
    await viewCollection.add({
      data: {
        openid,
        itemId,
        itemType,
        createTime: db.serverDate()
      }
    })

    // Increment view count in the content collection if it exists
    try {
      const contentCollection = db.collection(itemType)
      await contentCollection.doc(itemId).update({
        data: {
          viewCount: db.command.inc(1)
        }
      })
    } catch (error) {
      console.log('Error updating view count in content collection:', error)
      // Continue even if updating content fails
    }
  } else {
    // Update the timestamp for the existing view
    await viewCollection.doc(existingView.data[0]._id).update({
      data: {
        updateTime: db.serverDate()
      }
    })
  }

  return {
    success: true,
    message: 'View recorded successfully'
  }
}

// 切换点赞状态
async function toggleLike(openid, itemId, itemType) {
  if (!itemId || !itemType) {
    return { success: false, message: 'Missing required parameters' }
  }

  const likeCollection = db.collection('likes')
  
  // Check if this user has already liked this item
  const existingLike = await likeCollection.where({
    openid,
    itemId,
    itemType
  }).get()

  let isLiked = false

  if (existingLike.data.length === 0) {
    // Add new like
    await likeCollection.add({
      data: {
        openid,
        itemId,
        itemType,
        createTime: db.serverDate()
      }
    })
    isLiked = true

    // Increment like count in the content collection
    try {
      const contentCollection = db.collection(itemType)
      await contentCollection.doc(itemId).update({
        data: {
          likeCount: db.command.inc(1)
        }
      })
    } catch (error) {
      console.log('Error updating like count in content collection:', error)
    }
  } else {
    // Remove existing like
    await likeCollection.doc(existingLike.data[0]._id).remove()
    
    // Decrement like count in the content collection
    try {
      const contentCollection = db.collection(itemType)
      await contentCollection.doc(itemId).update({
        data: {
          likeCount: db.command.inc(-1)
        }
      })
    } catch (error) {
      console.log('Error updating like count in content collection:', error)
    }
  }

  return {
    success: true,
    isLiked: isLiked,
    message: isLiked ? 'Item liked successfully' : 'Item unliked successfully'
  }
}

// 切换收藏状态
async function toggleBookmark(openid, itemId, itemType) {
  if (!itemId || !itemType) {
    return { success: false, message: 'Missing required parameters' }
  }

  const bookmarkCollection = db.collection('bookmarks')
  
  // Check if this user has already bookmarked this item
  const existingBookmark = await bookmarkCollection.where({
    openid,
    itemId,
    itemType
  }).get()

  let isBookmarked = false

  if (existingBookmark.data.length === 0) {
    // Add new bookmark
    await bookmarkCollection.add({
      data: {
        openid,
        itemId,
        itemType,
        createTime: db.serverDate()
      }
    })
    isBookmarked = true

    // Increment bookmark count in the content collection
    try {
      const contentCollection = db.collection(itemType)
      await contentCollection.doc(itemId).update({
        data: {
          bookmarkCount: db.command.inc(1)
        }
      })
    } catch (error) {
      console.log('Error updating bookmark count in content collection:', error)
    }
  } else {
    // Remove existing bookmark
    await bookmarkCollection.doc(existingBookmark.data[0]._id).remove()
    
    // Decrement bookmark count in the content collection
    try {
      const contentCollection = db.collection(itemType)
      await contentCollection.doc(itemId).update({
        data: {
          bookmarkCount: db.command.inc(-1)
        }
      })
    } catch (error) {
      console.log('Error updating bookmark count in content collection:', error)
    }
  }

  return {
    success: true,
    isBookmarked: isBookmarked,
    message: isBookmarked ? 'Item bookmarked successfully' : 'Item unbookmarked successfully'
  }
}

// 记录分享
async function recordShare(openid, itemId, itemType) {
  if (!itemId || !itemType) {
    return { success: false, message: 'Missing required parameters' }
  }

  const shareCollection = db.collection('shares')
  
  // Record share
  await shareCollection.add({
    data: {
      openid,
      itemId,
      itemType,
      createTime: db.serverDate()
    }
  })

  // Increment share count in the content collection
  try {
    const contentCollection = db.collection(itemType)
    await contentCollection.doc(itemId).update({
      data: {
        shareCount: db.command.inc(1)
      }
    })
  } catch (error) {
    console.log('Error updating share count in content collection:', error)
  }

  return {
    success: true,
    message: 'Share recorded successfully'
  }
}

// 获取用户统计数据
async function getUserStats(openid) {
  if (!openid) {
    return { success: false, message: 'Missing openid parameter' }
  }

  const views = await db.collection('views').where({ openid }).count()
  const likes = await db.collection('likes').where({ openid }).count()
  const bookmarks = await db.collection('bookmarks').where({ openid }).count()
  const shares = await db.collection('shares').where({ openid }).count()
  
  // Get user's recently viewed items
  const recentViews = await db.collection('views')
    .where({ openid })
    .orderBy('createTime', 'desc')
    .limit(10)
    .get()
  
  // Get user's bookmarked items
  const userBookmarks = await db.collection('bookmarks')
    .where({ openid })
    .orderBy('createTime', 'desc')
    .limit(20)
    .get()

  return {
    success: true,
    stats: {
      viewCount: views.total,
      likeCount: likes.total,
      bookmarkCount: bookmarks.total,
      shareCount: shares.total,
      recentViews: recentViews.data,
      bookmarks: userBookmarks.data
    }
  }
}

// 生成小程序码
async function generateQRCode(itemId, itemType, page = 'pages/index/index') {
  if (!page) {
    return { success: false, message: 'Missing page parameter' }
  }

  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: `itemId=${itemId}&itemType=${itemType}`,
      page: page,
      checkPath: true,
      envVersion: 'release'
    })
    
    // Upload the QR code to cloud storage
    const upload = await cloud.uploadFile({
      cloudPath: `qrcodes/${itemType}_${itemId}_${Date.now()}.jpg`,
      fileContent: result.buffer,
    })
    
    return {
      success: true,
      fileID: upload.fileID
    }
  } catch (error) {
    console.error('Error generating QR code:', error)
    return {
      success: false,
      message: error.message
    }
  }
} 