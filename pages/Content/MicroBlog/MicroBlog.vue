<template>
  <view class="full">
    <uni-nav-bar left-icon="back" @click-left="navBack" :status-bar="true" shadow="true" fixed="true" title="详情">
    </uni-nav-bar>
    <view class="cu-card dynamic solid-bottom margin-bottom-sm" :class="isCard?'no-card':''">
      <view class="cu-item shadow">
        <!-- 头像部分 -->
        <view class="cu-list menu-avatar">
          <view class="cu-item">
            <image class="cu-avatar round" style="width:80upx;height:80upx" :src="microBlogInfo.creator.avatarUrl"
              mode="aspectFill" :lazy-load="isLazyLoad" @click.stop="toUser(microBlogInfo.creator.objectId)"></image>
            <view class="content flex-sub">
              <view class="flex justify-between">
                <text class="text-df text-bold">{{microBlogInfo.creator.nickname}}</text>
                <image v-if="microBlogInfo.creator.objectId!=objectId" style="width:48upx;height:48upx"
                  src="../../../static/img/more.png" mode="aspectFill" @click.stop="moreActionSheetTap(microBlogInfo)">
                </image>
              </view>
              <view class="text-gray text-sm flex justify-between">
                <text class="text-sm">{{microBlogInfo.createdAt}}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 内容部分 -->
        <view class="text-content padding-lg" style="padding-bottom:0;padding-top:0;">
          {{microBlogInfo.content?microBlogInfo.content:''}}
        </view>
        <!-- 图片部分 -->
        <view class="grid flex-sub" style="padding:0"
          :class="microBlogInfo.imgList.length!=1?'col-3 grid-square':'col-1'"
          v-if="microBlogInfo.imgList[0]===''?false:true">
          <view class="bg-img" :class="imgItem.length!=1?'':'only-img'"
            v-for="(imgItem,imgIndex) in microBlogInfo.imgList" :key="imgIndex">
            <image :src="imgItem" style="width:750upx" :mode="microBlogInfo.imgList.length!=1?'aspectFill':'widthFix'"
              @click.stop="previewImg(microBlogInfo.imgList,imgIndex)"></image>
          </view>
        </view>
        <!-- 按钮部分 -->
        <view class="flex solid-bottom padding justify-between" style="padding-top: 0;padding-bottom:0upx;">
          <view class="radius">
            <!-- 点赞 -->
            <button class="btn-share" type="primary" v-if="!microBlogInfo.isLike"
              @click.stop="like(microBlogInfo.objectId,microBlogInfo.creator.objectId)">
              <image class='btnImg' src='../../../static/img/like.png'></image>
            </button>
            <!-- 取消点赞 -->
            <button class="btn-share" type="primary" v-else @click.stop="unlike(microBlogInfo.objectId)">
              <image class='btnImg' src='../../../static/img/islike.png'></image>
            </button>
            <!-- 评论 -->
            <button class="btn-share" type="primary" @click.stop="toComment(microBlogInfo.objectId)">
              <image class='btnImg' src='../../../static/img/comment.png'></image>
            </button>
            <!-- 分享 -->
            <button class="btn-share" type="primary" open-type="share">
              <image class='btnImg' src='../../../static/img/share.png'></image>
            </button>
          </view>
          <view class="radius">
            <!-- 收藏 -->
            <button class="btn-share" type="primary" v-if="!microBlogInfo.isCollect"
              @click.stop="collect(microBlogInfo.objectId,microBlogInfo.creator.objectId)">
              <image class='btnImg' src='../../../static/img/collect.png'></image>
            </button>
            <!-- 取消收藏 -->
            <button class="btn-share" type="primary" v-else @click.stop="unCollect(microBlogInfo.objectId)">
              <image class='btnImg' src='../../../static/img/iscollect.png'></image>
            </button>
          </view>
        </view>
        <!-- 标签部分 -->
        <view v-if="microBlogInfo.tag" class="flex justify-start padding"
          style="flex-flow:row wrap;padding-top: 0;padding-bottom:0upx;">
          <text v-for="(tagItem,tagIndex) in microBlogInfo.tag" :key="tagIndex"
            class="bg-gray light round text-bold text-sm"
            style="padding: 5upx 30upx;margin-right:30upx">{{tagItem}}</text>
        </view>
        <!-- 统计部分 -->
        <view class="flex solid-bottom padding-xl justify-between align-center"
          style="padding-top: 0;padding-bottom:0upx;">
          <view class="radius flex justify-center align-center">
            <view style="line-height:70upx;margin-right:50upx" @click.stop="toLike(microBlogInfo.objectId)">
              {{microBlogInfo.likes.count?microBlogInfo.likes.count:0}}点赞</view>
            <view style="line-height:70upx" class="text-gray" @click.stop="toComment(microBlogInfo.objectId)">
              {{microBlogInfo.comments.count?microBlogInfo.comments.count:0}}评论</view>
          </view>
          <view v-if="microBlogInfo.Geolocation.name" class="radius flex justify-center align-center"
            @click.stop="openLocation(microBlogInfo.Geolocation)">
            <image class="card-btn" style="width:60upx;height:60upx" src="../../../static/img/address.png"
              mode="aspectFill" />
            <text class="bg-gray round text-bold text-sm"
              style="padding: 5upx 30upx">{{microBlogInfo.Geolocation.name}}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue"
  export default {
    components: {
      uniNavBar
    },
    data() {
      return {
        microBlogId: '',
        objectId: '',
        isCard: true,
        microBlogInfo: {}
      }
    },
    onLoad: function (option) {
      this.microBlogId = option.microBlogId
      if (!this.microBlogId) {
        uni.showToast({
          title: '提示',
          duration: 2000,
          icon: '微博已删除'
        })
      }
      this.loadUserData()
      this.initData()
    },
    onShareAppMessage() {
      return {
        title: this.microBlogInfo.content,
        path: `pages/Content/MicroBlog/MicroBlog?microBlogId=${this.microBlogInfo.objectId}`,
        imageUrl: this.microBlogInfo.imgList[0]
      }
    },
    methods: {
      loadUserData() { //获取用户信息
        try {
          if (!this.objectId) {
            this.objectId = uni.getStorageSync('bmob').objectId
          }
          if (!this.objectId) {
            console.log('this.objectId', this.objectId)
            console.log(uni.getStorageSync('bmob').objectId)
            uni.reLaunch({
              url: '../../Login/Login',
              success: () => {
                uni.showToast({
                  title: '登录过期',
                  duration: 2000,
                  icon: 'none'
                })
              }
            })
          }
        } catch (e) {
          uni.reLaunch({
            url: '../../Login/Login',
            success: () => {
              uni.showToast({
                title: '登录过期',
                duration: 2000,
                icon: 'none'
              })
            }
          })
        }
      },
      // 返回
      navBack() {
        uni.navigateBack({
          delta: 1
        })
      },
      // 获取数据
      initData() {
        uni.showLoading({
          title: '加载中'
        })
        const querBlog = this.Bmob.Query('MicroBlog')
        querBlog.include('creator')
        querBlog.get(this.microBlogId).then(res_blog => {
          console.log(res_blog)
          res_blog.isLike = false
          res_blog.isCollect = false
          res_blog.createdAt = this.getDateDiff(res_blog.createdAt)
          // 分割imgList
          if (res_blog.imgList) {
            res_blog.imgList = res_blog.imgList.split(",")
          }
          // 分割tag
          if (res_blog.tag) {
            res_blog.tag = res_blog.tag.split(",")
          }
          // 查询点赞的关联关系
          let queryLike = this.Bmob.Query('MicroBlog')
          queryLike.field('likes', res_blog.objectId)
          queryLike.relation('Like').then(res_like => {
            res_blog.likes = res_like
            // 查询是否点赞这条帖子 方法一
            for (var i = 0; i < res_like.results.length; i++) {
              if (res_like.results[i].creator.objectId === this.objectId) {
                res_blog.isLike = true
                break
              }
            }
            this.microBlogInfo = res_blog
            uni.hideLoading()
          })
          // 查询评论的关联关系
          let queryComment = this.Bmob.Query('MicroBlog')
          queryComment.field('comments', res_blog.objectId)
          // 查询评论的具体用户信息
          queryComment.relation('Comment').then(res_comment => {
            res_blog.comments = res_comment
            if (this.microBlogInfo != res_blog) {
              this.microBlogInfo = res_blog
            }
            uni.hideLoading()
          })
          // 查询收藏的关联关系
          let queryCollect = this.Bmob.Query('MicroBlog')
          queryCollect.field('collects', res_blog.objectId)
          // 查询收藏的具体的用户信息
          queryCollect.relation('Collect').then(res_collect => {
            res_blog.collects = res_collect
            // 查询是否收藏这条帖子 方法一
            for (var i = 0; i < res_collect.results.length; i++) {
              if (res_collect.results[i].creator.objectId === this.objectId) {
                res_blog.isCollect = true
                break
              }
            }
            this.microBlogInfo = res_blog
            uni.hideLoading()
          })
          // setTimeout(()=>{
          //     this.microBlogInfo=res_blog
          // },1000)
          uni.hideLoading()
        }).catch(err => {
          console.log(err)
          uni.hideLoading()
          uni.showToast({
            title: err,
            duration: 2000,
            icon: 'none'
          })
        })
      },
      toComment(objectId) {
        uni.navigateTo({
          url: `../Comment/Comment?microBlogId=${objectId}`
        })
      },
      toLike(objectId) {
        uni.navigateTo({
          url: `../Like/Like?microBlogId=${objectId}`
        })
      },
      toReport(objectId) {
        uni.navigateTo({
          url: `../Report/Report?microBlogId=${objectId}`
        })
      },
      toUser(objectId) {
        uni.navigateTo({
          url: `../User/User?objectId=${objectId}`
        })
      },
      // 大图预览 + 保存到相册
      previewImg(list, index) {
        uni.previewImage({
          urls: list,
          current: index,
          longPressActions: {
            itemList: ['保存到相册'],
            success: function (data) {
              console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片')
            },
            fail: function (err) {
              console.log(err.errMsg)
            }
          }
        })
      },
      // 点赞
      like(itemid, creatorid) {
        // 关联点赞者
        const pointer = this.Bmob.Pointer('_User')
        const poiID = pointer.set(this.objectId)
        // 关联被点赞帖子
        const pointer_blog = this.Bmob.Pointer('MicroBlog')
        const poiID_blog = pointer.set(itemid)
        // 关联被点赞者
        const pointer_creator = this.Bmob.Pointer('_User')
        const poiID_creator = pointer.set(creatorid)
        // 写入数据库Like表 写入点赞记录
        const query = this.Bmob.Query('Like')
        query.set('creator', poiID)
        query.set('liked_blog', poiID_blog)
        query.set('liked_creator', poiID_creator)
        query.save().then(res => {
          console.log(res)
          const relation = this.Bmob.Relation('Like') // 需要关联的表
          const relID = relation.add([res.objectId]) //关联表中需要关联的objectId, 返回一个Relation对象, add方法接受string和array的类型参数
          const query1 = this.Bmob.Query('MicroBlog')
          query1.get(itemid).then(result => {
            result.set('likes', relID) // 将Relation对象保存到likes字段中，即实现了一对多的关联
            result.save()
            console.log(result)
            this.microBlogInfo.isLike = true
            this.microBlogInfo.likes.count++
            uni.showToast({
              title: '点赞成功',
              duration: 2000
            })
          })
        }).catch(err => {
          console.log(err)
          uni.showToast({
            title: err.error,
            icon: 'none',
            complete: () => {
              setTimeout(() => {
                uni.hideToast()
              }, 2000)
            }
          })
        })
      },
      // 取消点赞
      unlike(itemid) {
        // 查询符合条件的点赞表的记录
        const query = this.Bmob.Query('Like')
        query.equalTo("creator", '===', this.objectId)
        query.equalTo("liked_blog", '===', itemid)
        query.find().then(res => {
          console.log(res)
          const query = this.Bmob.Query('Like')
          query.destroy(res[0].objectId).then(result => {
            console.log(result)
            this.microBlogInfo.isLike = false
            this.microBlogInfo.likes.count--
            uni.showToast({
              title: '取消点赞',
              duration: 2000
            })
          }).catch(err => {
            console.log(err)
          })
        })
      },
      // 收藏
      collect(itemid, creatorid) {
        // 关联收藏者
        const pointer = this.Bmob.Pointer('_User')
        const poiID = pointer.set(this.objectId)
        // 关联被收藏帖子
        const pointer_blog = this.Bmob.Pointer('MicroBlog')
        const poiID_blog = pointer.set(itemid)
        // 关联被收藏者
        const pointer_creator = this.Bmob.Pointer('_User')
        const poiID_creator = pointer.set(creatorid)
        // 写入数据库Collect表 写入收藏记录
        const query = this.Bmob.Query('Collect')
        query.set('creator', poiID)
        query.set('collected_blog', poiID_blog)
        query.set('collected_creator', poiID_creator)
        query.save().then(res => {
          console.log(res)
          const relation = this.Bmob.Relation('Collect') // 需要关联的表
          const relID = relation.add([res.objectId]) //关联表中需要关联的objectId, 返回一个Relation对象, add方法接受string和array的类型参数
          const query1 = this.Bmob.Query('MicroBlog')
          query1.get(itemid).then(result => {
            result.set('collects', relID) // 将Relation对象保存到likes字段中，即实现了一对多的关联
            result.save()
            console.log(result)
            this.microBlogInfo.isCollect = true
            uni.showToast({
              title: '收藏成功',
              duration: 2000
            })
          })
        }).catch(err => {
          console.log(err)
          uni.showToast({
            title: err.error,
            icon: 'none',
            complete: () => {
              setTimeout(() => {
                uni.hideToast()
              }, 2000)
            }
          })
        })
      },
      // 取消收藏
      unCollect(itemid) {
        // 查询符合条件的收藏表的记录
        const query = this.Bmob.Query('Collect')
        query.equalTo("creator", '===', this.objectId)
        query.equalTo("collected_blog", '===', itemid)
        query.find().then(res => {
          console.log(res)
          const query = this.Bmob.Query('Collect')
          query.destroy(res[0].objectId).then(result => {
            console.log(result)
            this.microBlogInfo.isCollect = false
            uni.showToast({
              title: '取消收藏',
              duration: 2000
            })
          }).catch(err => {
            console.log(err)
            uni.showToast({
              title: '取消收藏失败',
              duration: 2000,
              icon: 'none'
            })
          })
        })
      },
      // 更多弹窗
      moreActionSheetTap(item) {
        const query = this.Bmob.Query('Attention')
        query.equalTo("bloger", '===', item.creator.objectId)
        query.equalTo("fans", '===', this.objectId)
        query.find().then(res => {
          // 已关注
          if (res.length != 0) {
            uni.showActionSheet({
              itemList: ['取消关注', '举报'],
              success: (e) => {
                switch (e.tapIndex) {
                  case 0:
                    query.destroy(res[0].objectId).then(result => {
                      console.log(result)
                      uni.showToast({
                        title: '取消关注成功',
                        duration: 2000
                      })
                    }).catch(err => {
                      console.log(err)
                      uni.showToast({
                        title: '取消关注失败',
                        duration: 2000,
                        icon: 'none'
                      })
                    })
                    break
                  case 1:
                    this.toReport(item.objectId)
                    break
                  default:
                    break
                }
              }
            })
          }
          // 未关注
          else {
            uni.showActionSheet({
              itemList: ['关注', '举报'],
              success: (e) => {
                switch (e.tapIndex) {
                  case 0:
                    // 关联自己
                    const pointer = this.Bmob.Pointer('_User')
                    const poiID = pointer.set(this.objectId)
                    // 关联被博主
                    const pointer_bloger = this.Bmob.Pointer('_User')
                    const poiID_bloger = pointer.set(item.creator.objectId)
                    // 写入数据库Attention表 写入收藏记录
                    const query = this.Bmob.Query('Attention')
                    query.set('fans', poiID)
                    query.set('bloger', poiID_bloger)
                    query.save().then(res => {
                      uni.showToast({
                        title: '关注成功',
                        duration: 2000
                      })
                    }).catch(err => {
                      uni.showToast({
                        title: '关注失败',
                        duration: 200,
                        icon: 'none'
                      })
                    })
                    break
                  case 1:
                    this.toReport(item.objectId)
                    break
                  default:
                    break
                }
              }
            })
          }
        })
      },
      // 位置
      openLocation(Geolocation) {
        uni.openLocation({
          latitude: Geolocation.latitude,
          longitude: Geolocation.longitude
        })
      },
      // 时间格式化
      getDateDiff(dateTimeStamp) {
        // 时间字符串转时间戳
        //#ifdef APP-PLUS
        var f = dateTimeStamp.split(' ', 2);
        var d = (f[0] ? f[0] : '').split('-', 3);
        var timestamp = new Date(
          parseInt(d[0], 10) || null,
          (parseInt(d[1], 10) || 1) - 1,
          parseInt(d[2], 10) || null
        ).getTime() / 1000;
        //#endif
        //#ifdef MP-WEIXIN
        var timestamp = new Date(dateTimeStamp).getTime()
        //#endif

        var minute = 1000 * 60
        var hour = minute * 60
        var day = hour * 24
        var halfamonth = day * 15
        var month = day * 30
        var year = day * 365
        var now = new Date().getTime()
        var diffValue = now - timestamp
        var result
        if (diffValue < 0) {
          return
        }
        var yearC = diffValue / year
        var monthC = diffValue / month
        var weekC = diffValue / (7 * day)
        var dayC = diffValue / day
        var hourC = diffValue / hour
        var minC = diffValue / minute
        if (yearC >= 1) {
          result = dateTimeStamp
        } else if (monthC >= 1) {
          result = dateTimeStamp
        } else if (weekC >= 1) {
          result = dateTimeStamp
        } else if (dayC >= 1) {
          result = "" + parseInt(dayC) + "天前"
        } else if (hourC >= 1) {
          result = "" + parseInt(hourC) + "小时前"
        } else if (minC >= 1) {
          result = "" + parseInt(minC) + "分钟前"
        } else
          result = "刚刚"
        return result
      }
    }
  }
</script>

<style scoped>
  .full {
    background-color: #EEEEEE;
  }

  .cu-list.menu-avatar>.cu-item:after,
  .cu-list.menu>.cu-item:after {
    border-bottom: 0;
  }

  .cu-list.menu-avatar>.cu-item .content {
    left: 126upx;
    top: 20upx;
  }

  .solid-bottom::after {
    border-bottom: 0;
  }

  /* 单行card的图片大小 */
  .col-1 .bg-img image {
    max-width: 100%;
  }

  .cu-list.menu-avatar>.cu-item {
    height: 120upx;
  }

  .cu-card .grid.grid-square {
    margin: 20upx;
  }

  .card-btn {
    width: 70upx;
    height: 70upx;
    padding: 10upx;
    padding-bottom: 0;
  }

  .uni-more-content {
    border-bottom: 1upx solid #f0f0f0;
  }

  .btn-share {
    background: white;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover cover;
    display: inline-flex;
    margin-left: 10upx;
    border: 0;
    -webkit-box-shadow: 0;
    box-shadow: 0;
    width: 60upx;
    height: 60upx;
    padding: 0;
  }

  .btn-share::after {
    border: 0;
  }

  .btnImg {
    width: 50rpx;
    height: 50rpx;
  }
</style>