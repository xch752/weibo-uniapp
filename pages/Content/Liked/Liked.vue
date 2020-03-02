<template>
	<scroll-view :style="{'height':windowHeight+'px'}"  scroll-y="true" @scrolltolower="currentChange">
		<uni-nav-bar left-icon="back" @click-left="navBack" :status-bar="true" shadow="true" fixed="true" title="点赞"></uni-nav-bar>
		<view style="margin-top:20upx"></view>
		<WaterfallFlow :list="list" :loading="loading" @click="toMicroBlog"></WaterfallFlow>
		<view v-if="list.length === 0?true:false" class="flex justify-center align-center" :style="{'height':windowHeight+'px'}">
			<view style="text-align:center">
				<image src="http://static.xch752.com/undraw_Mobile_app_p3ts.png" mode="aspectFit" style="width: 200upx;height: 170upx;"></image>
				<view class="text-gray margin-top-sm">还没有点赞</view>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue"
	import WaterfallFlow from '@/components/nairenk-waterfall-flow/nairenk-waterfall-flow.vue'
	export default {
		components: {uniNavBar,WaterfallFlow},
		data() {
			return {
				pageNum:1,
				pageSize:10,
				objectId:'',
				windowHeight:'',
				list:[],
				loading:false
			}
		},
		onLoad:function(option){
			this.getSysInfo()
			this.objectId = option.objectId
			// this.initDataBlog()
			this.initData()
		},
		methods: {
			// 获取屏幕高度
			getSysInfo(){
				uni.getSystemInfo({
					success:(e)=>{
						console.log(e)
						this.windowHeight = e.windowHeight
					}
				})
			},
			// 返回
			navBack(){
				uni.navigateBack({
					delta: 1
				})
			},
			toMicroBlog(item){
				uni.navigateTo({
					url: `../MicroBlog/MicroBlog?microBlogId=${item.objectId}`
				})
			},
			// 获取Blog数据
			initData(){
				this.pageNum = 1
				this.loading = true
				const queryLike = this.Bmob.Query('Like')
				queryLike.equalTo('creator','===',this.objectId)
				queryLike.include('liked_blog','liked_creator')
				queryLike.limit(this.pageSize)
				queryLike.order('-createdAt')
				queryLike.find().then(res_like=>{
					console.log('res_like',res_like)
					let List = res_like.map(item => {
						return Object.assign({}, {
							image: item.liked_blog.imgList?item.liked_blog.imgList.split(',')[0]:'http://static.xch752.com/mine_background.jpg',
							content: item.liked_blog.content,
							creator: item.liked_creator,
							objectId: item.liked_blog.objectId
						})
					})
					this.list = List
					this.loading = false
				}).catch(err=>{
					this.loading = false
					uni.showToast({
						title: err.error,
						duration: 2000
					})
				})
			},
			// 下拉加载
			currentChange(e){
				this.loading = true
				const queryLike = this.Bmob.Query('Collect')
				queryLike.equalTo('creator','===',this.objectId)
				queryLike.include('liked_blog','liked_creator')
				queryLike.limit(this.pageSize)
				queryLike.order('-createdAt')
				queryLike.skip(this.pageSize*this.pageNum)
				queryLike.find().then(res_like=>{
					this.loading = false
					console.log('res_like',res_like)
					if(res_like.length == 0){
						uni.showToast({
							title: '没有更多了',
							duration: 2000,
							icon: 'none'
						})
						return
					}
					else{
						let List = res_like.map(item => {
							return Object.assign({}, {
								image: item.liked_blog.imgList?item.liked_blog.imgList.split(',')[0]:'http://static.xch752.com/mine_background.jpg',
								content: item.liked_blog.content,
								creator: item.liked_creator,
								objectId: item.liked_blog.objectId
							})
						})
						this.list = this.list.concat(List)
					}		
				}).catch(err=>{
					this.loading = false
					uni.showToast({
						title: err.error,
						duration: 2000
					})
				})
			}
		}
	}
</script>

<style scoped>

</style>
