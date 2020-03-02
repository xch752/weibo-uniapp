<template>
	<view>
		<uni-nav-bar left-icon="back" @click-left="navBack" :status-bar="true" shadow="true" fixed="true" title="点赞"></uni-nav-bar>
		<scroll-view v-if="likesList.length === 0?false:true" :style="{'height':windowHeight+'px'}"  @scrolltolower="currentChange" scroll-y="true">
			<view class="cu-list menu-avatar">
				<view class="cu-item" v-for="(item,index) in likesList" :key="index">
					<view class="cu-avatar round lg" :style="{'background-image':'url('+item.creator.avatarUrl+')'}"></view>
					<view class="content">
						<view class="text-black text-bold">{{item.creator.nickname}}</view>
					</view>
					<view class="action">
						<view class="text-grey text-xs">{{item.createdAt}}</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<view v-if="likesList.length === 0?true:false" class="flex justify-center align-center" :style="{'height':windowHeight+'px'}">
			<view style="text-align:center">
				<image src="http://static.xch752.com/undraw_Mobile_app_p3ts.png" mode="aspectFit" style="width: 200upx;height: 170upx;"></image>
				<view class="text-gray margin-top-sm">还没有点赞</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue" 
	export default {
		components: {uniNavBar},
		data() {
			return {
				// 评论分页
				pageNum:1,
				pageSize:30,
				// 登录者ID
				objectId:'',
				// 博客ID
				microBlogId:'',
				// 创造博客者ID
				microBlogCreaotrId:'',
				// 评论列表
				likesList:[],
				// scrollview高度
				windowHeight:''
			}
		},
		onLoad:function(option){
			this.loadUserData()
			this.getSysInfo()
			this.microBlogId = option.microBlogId
			this.initData()
		},
		methods: {
			// 获取屏幕高度
			getSysInfo(){
				uni.getSystemInfo({
					success:(e)=>{
						console.log(e)
						this.windowHeight = e.windowHeight-(e.windowWidth/750)*(140)
					}
				})
			},
			//获取用户信息
			loadUserData(){
				try {
					this.objectId = uni.getStorageSync('bmob').objectId
					if (!this.objectId) {
						uni.reLaunch({
							url:'../../Login/Login',
							success:()=>{
								uni.showToast({
									title: '登录过期',
									duration: 2000,
									icon: 'none'
								})
							}
						})
					}
				} catch (e) {
					// error
					console.log(e)
					uni.reLaunch({
						url:'../../Login/Login',
						success:()=>{
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
			navBack(){
				uni.navigateBack({
					delta: 1
				})
			},
			// 初始化数据
			initData(){
				const query = this.Bmob.Query("MicroBlog")
				query.equalTo("objectId","===", this.microBlogId)
				uni.showLoading({
					title: '加载中'
				})
				query.find().then(res_blog => {
					// 查询评论的关联关系
					this.microBlogCreaotrId = res_blog[0].creator.objectId
					let queryLike = this.Bmob.Query('MicroBlog')
						queryLike.field('likes',res_blog[0].objectId)
						queryLike.order("-createdAt")
						queryLike.limit(this.pageSize)
						queryLike.include('creator')
						// 查询点赞的具体用户信息
						queryLike.relation('Like').then(res_like => {
							res_like.results.map(res_like_item=>{
								res_like_item.createdAt = this.getDateDiff(res_like_item.createdAt)
							})
							this.likesList = res_like.results
							console.log('this.likesList',this.likesList)
							uni.hideLoading()
						}).catch((err)=>{
							uni.hideLoading()
							uni.showToast({
								title: `加载失败${err}`,
								duration: 2000,
								icon: 'none'
							})
						})
				}).catch(err => {
					uni.hideLoading()
					uni.showToast({
						title: `加载失败${err}`,
						duration: 2000,
						icon: 'none'
					})
				})
			},
			// 下拉加载
			currentChange(){
				const query = this.Bmob.Query("MicroBlog")
				query.equalTo("objectId","===", this.microBlogId)
				uni.showLoading({
					title: '加载中'
				})
				query.find().then(res_blog => {
					this.microBlogCreaotrId = res_blog[0].creator.objectId
					let queryLike = this.Bmob.Query('MicroBlog')
					queryLike.field('likes',res_blog[0].objectId)
					queryLike.order("-createdAt")
					queryLike.limit(this.pageSize)
					queryComment.skip(this.pageSize*(this.pageNum))
					queryLike.include('creator')
					// 查询点赞的具体用户信息
					queryLike.relation('Like').then(res_like => {
						if(res_comment.results.length===0){
							uni.showToast({
								title: '没有更多了',
								duration: 2000,
								icon:'none'
							})
						}else{
							res_like.results.map(res_like_item=>{
								res_like_item.createdAt = this.getDateDiff(res_like_item.createdAt)
							})
							this.likesList = this.likesList.concat(res_like.results)
							console.log('this.likesList',this.likesList)
						}
					}).catch((err)=>{
						uni.hideLoading()
						uni.showToast({
							title: `加载失败${err}`,
							duration: 2000,
							icon: 'none'
						})
					})
				}).catch(err => {
					uni.hideLoading()
					uni.showToast({
						title: `加载失败${err}`,
						duration: 2000,
						icon: 'none'
					})
				})
			},
			// 时间格式化几分钟前、几小时前
			// 时间戳转多少分钟之前
			getDateDiff(dateTimeStamp) {
				// 时间字符串转时间戳
				var timestamp = new Date(dateTimeStamp).getTime();
				
				var minute = 1000 * 60;
				var hour = minute * 60;
				var day = hour * 24;
				var halfamonth = day * 15;
				var month = day * 30;
				var year = day * 365;
				var now = new Date().getTime();
				var diffValue = now - timestamp;
				var result;
				if (diffValue < 0) {
					return;
				}
				var yearC = diffValue / year;
				var monthC = diffValue / month;
				var weekC = diffValue / (7 * day);
				var dayC = diffValue / day;
				var hourC = diffValue / hour;
				var minC = diffValue / minute;
				if (yearC >= 1) {
					result = "" + parseInt(yearC) + "年前";
				} else if (monthC >= 1) {
					result = "" + parseInt(monthC) + "月前";
				} else if (weekC >= 1) {
					result = "" + parseInt(weekC) + "周前";
				} else if (dayC >= 1) {
					result = "" + parseInt(dayC) + "天前";
				} else if (hourC >= 1) {
					result = "" + parseInt(hourC) + "小时前";
				} else if (minC >= 1) {
					result = "" + parseInt(minC) + "分钟前";
				} else
					result = "刚刚";
				return result;
			}
		}
	}
</script>

<style scoped>
	.cu-list.menu-avatar>.cu-item .action {
		width: 200upx;
		text-align: center;
	}
	
</style>
