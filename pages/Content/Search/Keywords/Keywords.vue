<template>
  <view class="tabs">
    <view class="blank"></view>
    <uni-search-bar :radius="100" @confirm="search" cancelButton="none"></uni-search-bar>
    <scroll-view id="tab-bar" class="scroll-h" :scroll-x="true" :show-scrollbar="false" :scroll-into-view="scrollInto">
      <view v-for="(tab,index) in tabBars" :key="tab.partIndex" class="uni-tab-item" :id="tab.partIndex"
        :data-current="index" @click="ontabtap">
        <text class="uni-tab-item-title"
          :class="tabIndex==index ? 'uni-tab-item-title-active' : ''">{{tab.partName}}</text>
      </view>
    </scroll-view>
    <swiper :style="{'height':windowHeight+'px'}" :current="tabIndex" class="swiper-box" style="flex: 1;"
      :duration="300" @change="ontabchange">
      <!-- 博客 -->
      <swiper-item class="swiper-item">
        <scroll-view class="scroll-v list" :style="{'height':windowHeight+'px'}" @scroll="scroll" scroll-y
          @scrolltolower="loadMore(0)" :scroll-top="newsList[0].scrollTop">
          <WaterfallFlow :list="newsList[0].data" :loading="loading" @click="toMicroBlog"></WaterfallFlow>
          <!-- no-search -->
          <view v-if="newsList[0].data.length === 0?true:false" class="flex justify-center align-center"
            :style="{'height':windowHeight+'px'}">
            <view style="text-align:center">
              <image src="http://static.xch752.com/undraw_share_link_qtxe.png" mode="aspectFit"
                style="width: 300upx;height: 175upx;"></image>
              <view class="text-gray margin-top-sm">没有找到您想要的内容</view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
      <!-- 用户 -->
      <swiper-item class="swiper-item">
        <scroll-view class="scroll-v list" :style="{'height':windowHeight+'px'}" @scroll="scroll" scroll-y
          @scrolltolower="loadMoreUser" :scroll-top="newsList[1].scrollTop">
          <view class="cu-list menu-avatar">
            <view class="cu-item" v-for="(item,index) in userList" :key="item.objectId" @click="toUser(item.objectId)">
              <view class="cu-avatar round lg" :style="{'background-image':'url('+item.avatarUrl+')'}"></view>
              <view class="content">
                <view class="text-black text-bold">{{item.nickname}}</view>
                <view class="text-black text-bold">{{item.introduction}}</view>
              </view>
              <view class="action">
              </view>
            </view>
          </view>
          <!-- no-search -->
          <view v-if="userList.length === 0?true:false" class="flex justify-center align-center"
            :style="{'height':windowHeight+'px'}">
            <view style="text-align:center">
              <image src="http://static.xch752.com/undraw_share_link_qtxe.png" mode="aspectFit"
                style="width: 300upx;height: 175upx;"></image>
              <view class="text-gray margin-top-sm">没有找到您想要的内容</view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
    <!-- fab -->
    <!-- <button class="fab" @click="goTop"></button> -->
  </view>
</template>
<script>
  import uniSearchBar from '@/components/uni-search-bar/uni-search-bar.vue'
  import WaterfallFlow from '@/components/nairenk-waterfall-flow/nairenk-waterfall-flow.vue';

  // 缓存每页最多
  const MAX_CACHE_DATA = 100;
  // 缓存页签数量
  const MAX_CACHE_PAGE = 3;

  export default {
    components: {
      WaterfallFlow,
      uniSearchBar
    },
    data() {
      return {
        pageSize: 6,
        newsList: [],
        cacheTab: [],
        tabIndex: 0,
        tabBars: [{
          partName: '微博',
          partIndex: 0
        }, {
          partName: '用户',
          partIndex: 1
        }],
        scrollInto: "",
        windowHeight: '',
        loading: false,
        btnShow: false,
        keywords: '',
        userList: []
      }
    },
    onLoad: function (option) {
      this.keywords = option.keywords
      this.getSysInfo()
      this.getParts()
      this.getList(0)
    },
    methods: {
      // 获取屏幕高度
      getSysInfo() {
        uni.getSystemInfo({
          success: (e) => {
            this.windowHeight = e.windowHeight - (e.windowWidth / 750) * (230)
          }
        })
      },
      search(e) {
        this.keywords = e.value
        this.getList(0)
        this.getListUser()
      },
      // 获取分区
      getParts() {
        this.tabBars.forEach((tabBar) => {
          this.newsList.push({
            data: [],
            scrollTop: 0,
            oldScrollTop: 0,
            loadingText: '加载更多...',
            pageNum: 1
          })
        })
      },
      // 获取某分区数据
      getList(index) {
        this.loading = true
        this.newsList[index].data = []
        this.newsList[index].pageNum = 1
        this.getSysInfo()
        const queryBlog = this.Bmob.Query('MicroBlog')
        queryBlog.include('creator')
        queryBlog.order("-createdAt")
        queryBlog.equalTo("content", "==", {
          "$regex": "" + this.keywords + ".*"
        })
        queryBlog.limit(this.pageSize)
        queryBlog.find().then(res_blog => {
          res_blog.map(item => {
            if (item.imgList) {
              item.image = item.imgList.split(',')[0]
            } else {
              item.image = 'http://static.xch752.com/mine_background.jpg'
            }
          })
          this.newsList[index].data = res_blog
          this.loading = false
        })
      },
      // 下拉加载 分页
      loadMore(e) {
        this.loading = true
        const queryBlog = this.Bmob.Query('MicroBlog')
        queryBlog.include('creator')
        queryBlog.order("-createdAt")
        queryBlog.equalTo("content", "==", {
          "$regex": "" + this.keywords + ".*"
        })
        queryBlog.skip(this.pageSize * this.newsList[0].pageNum)
        queryBlog.limit(this.pageSize)
        queryBlog.find().then(res_blog => {
          if (res_blog.length == 0) {
            this.loading = false
            uni.showToast({
              title: '没有更多了',
              duration: 2000,
              icon: 'none'
            })
            this.newsList[this.tabIndex].loadingText = '没有更多了'
            return
          }

          res_blog.map(item => {
            if (item.imgList) {
              item.image = item.imgList.split(',')[0]
            } else {
              item.image = 'http://static.xch752.com/mine_background.jpg'
            }
          })
          this.newsList[this.tabIndex].pageNum++
          this.newsList[this.tabIndex].data = this.newsList[this.tabIndex].data.concat(res_blog)
          this.loading = false
        })
      },
      // 获取用户数据
      getListUser() {
        this.newsList[1].pageNum = 1
        uni.showLoading({
          title: '加载中'
        })
        this.getSysInfo()
        const query = this.Bmob.Query('_User')
        query.order("-createdAt")
        const query1 = query.equalTo("introduction", "==", {
          "$regex": "" + this.keywords + ".*"
        })
        const query2 = query.equalTo("nickname", "==", {
          "$regex": "" + this.keywords + ".*"
        })
        query.or(query1, query2)
        query.limit(this.pageSize * 2)
        query.find().then(res => {
          uni.hideLoading()
          this.userList = res
        })
      },
      // 用户分页
      loadMoreUser() {
        uni.showLoading({
          title: '加载中'
        })
        this.getSysInfo()
        const query = this.Bmob.Query('_User')
        query.order("-createdAt")
        const query1 = query.equalTo("introduction", "==", {
          "$regex": "" + this.keywords + ".*"
        })
        const query2 = query.equalTo("nickname", "==", {
          "$regex": "" + this.keywords + ".*"
        })
        query.or(query1, query2)
        query.skip(this.pageSize * 2 * this.newsList[1].pageNum)
        query.limit(this.pageSize * 2)
        query.find().then(res => {
          uni.hideLoading()
          if (res.length === 0) {
            uni.showToast({
              title: '没有更多了',
              duration: 2000,
              icon: 'none'
            })
            return
          }
          this.newsList[1].pageNum++
          this.userList = this.userList.concat(res)
        })
      },
      // 点击导航
      ontabtap(e) {
        let index = e.target.dataset.current || e.currentTarget.dataset.current;
        this.switchTab(index);
      },
      // 分区切换
      ontabchange(e) {
        let index = e.target.current || e.detail.current;
        this.switchTab(index);
      },
      // 切换
      switchTab(index) {
        if (this.newsList[index].data.length === 0) {
          switch (index) {
            case 0:
              this.getList(index)
              break
            case 1:
              this.getListUser()
              break
            default:
              break
          }
        }

        if (this.tabIndex === index) {
          return;
        }

        // 缓存 tabId
        if (this.newsList[this.tabIndex].data.length > MAX_CACHE_DATA) {
          let isExist = this.cacheTab.indexOf(this.tabIndex);
          if (isExist < 0) {
            this.cacheTab.push(this.tabIndex);
            //console.log("cache index:: " + this.tabIndex);
          }
        }

        this.tabIndex = index;
        this.scrollInto = this.tabBars[index].id;

        // 释放 tabId
        if (this.cacheTab.length > MAX_CACHE_PAGE) {
          let cacheIndex = this.cacheTab[0];
          this.clearTabData(cacheIndex);
          this.cacheTab.splice(0, 1);
          //console.log("remove cache index:: " + cacheIndex);
        }
      },
      clearTabData(e) {
        this.newsList[e].data.length = 0;
        this.newsList[e].loadingText = "加载更多...";
      },
      toMicroBlog(item) {
        uni.navigateTo({
          url: `../../MicroBlog/MicroBlog?microBlogId=${item.objectId}`
        })
      },
      toUser(objectId) {
        uni.navigateTo({
          url: `../../User/User?objectId=${objectId}`
        })
      },
      goTop: function (e) {
        this.newsList[this.tabIndex].scrollTop = this.newsList[this.tabIndex].oldScrollTop
        this.$nextTick(function () {
          this.newsList[this.tabIndex].scrollTop = 0
        })
        this.getList(this.tabIndex)
      },
      scroll: function (e) {
        this.newsList[this.tabIndex].oldScrollTop = e.detail.scrollTop
        if (e.detail.deltaY <= 0) {
          this.btnShow = false
        } else {
          this.btnShow = true
        }
        if (this.newsList[this.tabIndex].oldScrollTop === 0) {
          this.btnShow = false
        }
      }
    }
  }
</script>

<style scoped>
  /* #ifndef APP-PLUS */
  page {
    width: 100%;
    min-height: 100%;
    display: flex;
  }

  .blank {
    min-height: 40upx;
    background: #ffffff;
  }

  /* #endif */

  .tabs {
    flex: 1;
    flex-direction: column;
    overflow: hidden;
    background-color: #ffffff;
    /* #ifdef MP-ALIPAY || MP-BAIDU */
    height: 100vh;
    /* #endif */
  }

  .scroll-h {
    width: 750upx;
    height: 80upx;
    flex-direction: row;
    /* #ifndef APP-PLUS */
    white-space: nowrap;
    /* #endif */
    /* flex-wrap: nowrap; */
    /* border-color: #cccccc;
		border-bottom-style: solid;
		border-bottom-width: 1px; */
  }

  .line-h {
    height: 1upx;
    background-color: #cccccc;
  }

  .uni-tab-item {
    /* #ifndef APP-PLUS */
    display: inline-block;
    /* #endif */
    flex-wrap: nowrap;
    padding-left: 34upx;
    padding-right: 34upx;
  }

  .uni-tab-item-title {
    color: #555;
    font-size: 30upx;
    height: 80upx;
    line-height: 80upx;
    flex-wrap: nowrap;
    /* #ifndef APP-PLUS */
    white-space: nowrap;
    /* #endif */
  }

  .uni-tab-item-title-active {
    color: #000000;
    font-weight: bold;
  }

  .swiper-box {
    flex: 1;
  }

  .swiper-item {
    flex: 1;
  }

  .scroll-v {
    flex: 1;
    /* #ifndef MP-ALIPAY */
    flex-direction: column;
    /* #endif */
    width: 750upx;
  }

  .update-tips {
    position: absolute;
    left: 0;
    top: 41px;
    right: 0;
    padding-top: 5px;
    padding-bottom: 5px;
    background-color: #FDDD9B;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .update-tips-text {
    font-size: 14px;
    color: #ffffff;
  }

  .refresh {
    width: 750upx;
    height: 64px;
    justify-content: center;
  }

  .refresh-view {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
  }

  .refresh-icon {
    width: 32px;
    height: 32px;
    transition-duration: .5s;
    transition-property: transform;
    transform: rotate(0deg);
    transform-origin: 16px 16px;
  }

  .refresh-icon-active {
    transform: rotate(180deg);
  }

  .loading-icon {
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }

  .loading-icon-active {
    transform: rotate(21600deg);
  }

  .loading-text {
    margin-left: 2px;
    font-size: 16px;
    color: #999999;
  }

  .loading-more {
    align-items: center;
    justify-content: center;
    padding-top: 10px;
    padding-bottom: 10px;
    text-align: center;
  }

  .loading-more-text {
    font-size: 28upx;
    color: #999;
  }

  .fab {
    position: fixed;
    bottom: 50upx;
    right: 50upx;
    width: 100upx;
    height: 100upx;
    border-radius: 50%;
    background: url('../../../../static/img/fresh.png') no-repeat;
    background-size: 100% 100%;
    -moz-box-shadow: 1px 1px 3px #888888;
    -webkit-box-shadow: 1px 1px 3px #888888;
    box-shadow: 1px 1px 3px #888888;
  }

  .cu-list.menu-avatar>.cu-item .action {
    width: 200upx;
    text-align: center;
  }
</style>