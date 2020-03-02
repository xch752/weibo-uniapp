<template>
	<scroll-view :style="{'height':windowHeight+'px'}"  scroll-y="true" @scrolltolower="currentChange">
		<uni-nav-bar left-icon="back" @click-left="navBack" :status-bar="true" shadow="true" fixed="true" title="收藏"></uni-nav-bar>
		<view style="margin-top:20upx"></view>
		<WaterfallFlow :list="list" :loading="loading" @click="toMicroBlog"></WaterfallFlow>
		<view v-if="list.length === 0?true:false" class="flex justify-center align-center" :style="{'height':windowHeight+'px'}">
			<view style="text-align:center">
				<image src="http://static.xch752.com/undraw_Mobile_app_p3ts.png" mode="aspectFit" style="width: 200upx;height: 170upx;"></image>
				<view class="text-gray margin-top-sm">还没有收藏</view>
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
			initDataBlog(){
				this.pageNum = 1
				this.loading = true
				const queryCollect = this.Bmob.Query('Collect')
				queryCollect.equalTo('creator','===',this.objectId)
				// queryBlog.include('collected_blog','collected_creator')
				queryCollect.limit(this.pageSize)
				queryCollect.order('-createdAt')
				queryCollect.find().then(res_collect=>{
					console.log('res_collect',res_collect)
					const queryBlog = this.Bmob.Query('MicroBlog')
					queryBlog.include('creator')
					var query = new Array()
					res_collect.map((item,index)=>{
						query[index] = queryBlog.equalTo('objectId','===',item.collected_blog.objectId)
						console.log(query[index])
					})
					console.log('query',query)
					console.log('...query',...query)
					console.log('queryBlog',queryBlog)
					queryBlog.or(...query)
					queryBlog.find().then((res_blog)=>{
						console.log('res_blog',res_blog)
						res_blog.map(item=>{
							if(item.imgList){
								item.image = item.imgList.split(',')[0]
							}else{
								item.image = 'http://static.xch752.com/mine_background.jpg'
							}
						})						
						this.list = res_blog
						this.loading = false
						console.log(this.list)
					})
				})
			},
			// 获取Blog数据
			initData(){
				this.pageNum = 1
				this.loading = true
				const queryCollect = this.Bmob.Query('Collect')
				queryCollect.equalTo('creator','===',this.objectId)
				queryCollect.include('collected_blog','collected_creator')
				queryCollect.limit(this.pageSize)
				queryCollect.order('-createdAt')
				queryCollect.find().then(res_collect=>{
					console.log('res_collect',res_collect)
					let List = res_collect.map(item => {
						return Object.assign({}, {
							image: item.collected_blog.imgList?item.collected_blog.imgList.split(',')[0]:'http://static.xch752.com/mine_background.jpg',
							content: item.collected_blog.content,
							creator: item.collected_creator,
							objectId: item.collected_blog.objectId
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
				const queryCollect = this.Bmob.Query('Collect')
				queryCollect.equalTo('creator','===',this.objectId)
				queryCollect.include('collected_blog','collected_creator')
				queryCollect.limit(this.pageSize)
				queryCollect.order('-createdAt')
				queryCollect.skip(this.pageSize*this.pageNum)
				queryCollect.find().then(res_collect=>{
					this.loading = false
					console.log('res_collect',res_collect)
					if(res_collect.length == 0){
						uni.showToast({
							title: '没有更多了',
							duration: 2000,
							icon: 'none'
						})
						return
					}
					else{
						let List = res_collect.map(item => {
							return Object.assign({}, {
								image: item.collected_blog.imgList?item.collected_blog.imgList.split(',')[0]:'http://static.xch752.com/mine_background.jpg',
								content: item.collected_blog.content,
								creator: item.collected_creator,
								objectId: item.collected_blog.objectId
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
