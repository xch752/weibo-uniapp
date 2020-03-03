<template>
    <view class="tabs">
		<view class="blank"></view>
        <scroll-view id="tab-bar" class="scroll-h" :scroll-x="true" :show-scrollbar="false" :scroll-into-view="scrollInto">
            <view v-for="(tab,index) in tabBars" :key="tab.partIndex" class="uni-tab-item" :id="tab.partIndex" :data-current="index" @click="ontabtap">
                <text class="uni-tab-item-title" :class="tabIndex==index ? 'uni-tab-item-title-active' : ''">{{tab.partName}}</text>
            </view>
        </scroll-view>
        <uni-search-bar :radius="100" @confirm="search" cancelButton="none"></uni-search-bar>
        <swiper :style="{'height':windowHeight+'px'}" :current="tabIndex" class="swiper-box" style="flex: 1;" :duration="300" @change="ontabchange">
            <swiper-item class="swiper-item" v-for="(tab,index1) in newsList" :key="index1">
                <scroll-view class="scroll-v list" :style="{'height':windowHeight+'px'}"  @scroll="scroll" scroll-y @scrolltolower="loadMore(index1)" :scroll-top="tab.scrollTop">
					<WaterfallFlow :list="tab.data" :loading="loading"  @click="toMicroBlog"></WaterfallFlow>
                    <view class="loading-more">
                        <text class="loading-more-text">{{tab.loadingText}}</text>
                    </view>
                </scroll-view>
            </swiper-item>
        </swiper>
		<!-- fab -->
		<button v-show="btnShow" class="fab" @click="goTop"></button>
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
				pageSize:10,
                newsList: [],
                cacheTab: [],
                tabIndex: 0,
                tabBars: [{}],
                scrollInto: "",
				windowHeight:'',
				loading:false,
				btnShow:false
            }
        },
        onLoad() {
			this.getSysInfo()
			this.getParts()
        },
        methods: {
			// 获取屏幕高度
			getSysInfo(){
				uni.getSystemInfo({
					success:(e)=>{
						console.log(e)
						this.windowHeight = e.windowHeight-(e.windowWidth/750)*(170)
					}
				})
			},
			search(e){
				console.log(e)
			},
			// 获取分区
			getParts(){
				uni.showLoading({
					title: '加载中'
				})
				const queryParts = this.Bmob.Query('Parts')
				queryParts.order('partIndex')
				queryParts.find().then(res=>{
					uni.hideLoading()
					this.tabBars = res
					this.tabBars.forEach((tabBar) => {
						this.newsList.push({
							data: [],
							scrollTop: 0,
							oldScrollTop: 0,
							loadingText: '加载更多...',
							pageNum:1
						})
					})
					console.log(this.newsList)
					this.getList(0)
				})
			},
			// 获取某分区数据
            getList(index) {
				this.loading = true
				// this.newList[index].pageNum = 1
				const queryBlog = this.Bmob.Query('MicroBlog')
				// queryBlog.equalTo('part','===',index)
				queryBlog.include('creator')
				queryBlog.order("-createdAt")
				queryBlog.limit(this.pageSize)
				queryBlog.find().then(res_blog =>{
					res_blog.map(item=>{
						if(item.imgList){
							item.image = item.imgList.split(',')[0]
						}else{
							item.image = 'http://static.xch752.com/mine_background.jpg'
						}
					})
					this.newsList[index].data = res_blog
					this.loading = false
					console.log(this.newsList)
				})
			},
			// 下拉加载 分页
            loadMore(e) {
				this.loading = true
				const queryBlog = this.Bmob.Query('MicroBlog')
				// queryBlog.equalTo('part','===',index)
				queryBlog.include('creator')
				queryBlog.order("-createdAt")
				queryBlog.skip(this.pageSize*this.newsList[this.tabIndex].pageNum)
				queryBlog.limit(this.pageSize)
				queryBlog.find().then(res_blog =>{
					if(res_blog.length == 0){
						this.loading = false
						uni.showToast({
							title: '没有更多了',
							duration: 2000
						})
						this.newsList[this.tabIndex].loadingText = '没有更多了'
						return
					}

					res_blog.map(item=>{
						if(item.imgList){
							item.image = item.imgList.split(',')[0]
						}else{
							item.image = 'http://static.xch752.com/mine_background.jpg'
						}
					})
					this.newsList[this.tabIndex].pageNum ++
					this.newsList[this.tabIndex].data = this.newsList[this.tabIndex].data.concat(res_blog)
					this.loading = false
					console.log(this.newsList[this.tabIndex])
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
                    this.getList(index);
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
			toMicroBlog(item){
				uni.navigateTo({
					url: `../MicroBlog/MicroBlog?microBlogId=${item.objectId}`
				})
			},
			goTop: function(e){
				this.newsList[this.tabIndex].scrollTop = this.newsList[this.tabIndex].oldScrollTop
            	this.$nextTick(function() {
					this.newsList[this.tabIndex].scrollTop = 0
				})
				this.getList(this.tabIndex)
			},
			scroll: function(e) {
				this.newsList[this.tabIndex].oldScrollTop = e.detail.scrollTop
				if(e.detail.deltaY<=0){
					this.btnShow = false
				}else{
					this.btnShow = true
				}
				if(this.newsList[this.tabIndex].oldScrollTop === 0){
					this.btnShow = false
				}
			}
        }
    }
</script>

<style>
    /* #ifndef APP-PLUS */
    page {
        width: 100%;
        min-height: 100%;
        display: flex;
    }
	.blank{
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
	.fab{
		position: fixed;
		bottom:50upx;
		right:50upx;
		width:100upx;
		height: 100upx;
		border-radius: 50%;
		background: url('../../../static/img/fresh.png') no-repeat;
		background-size: 100% 100%;
		-moz-box-shadow:1px 1px 3px #888888; -webkit-box-shadow:1px 1px 3px #888888; box-shadow:1px 1px 3px #888888;
	}
</style>
