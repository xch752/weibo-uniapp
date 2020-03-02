<template>
	<view class="full">
		<uni-nav-bar left-icon="plus" @click-left="toAdd" :status-bar="true" shadow="true" fixed="true" titleIcon="http://static.xch752.com/logo_whiteBG_256.png"></uni-nav-bar>
		<scroll-view :scroll-top="scrollTop" :style="{'height':windowHeight+'px'}" scroll-y="true" @scrolltolower="currentChange" @scroll="scroll" >
			<view class="cu-card dynamic solid-bottom margin-bottom-sm" :class="isCard?'no-card':''" v-for="(item,index) in blogList" :key="index" @click="toMicroBlog(item.objectId)">
				<view class="cu-item shadow">
					<!-- 头像部分 -->
					<view class="cu-list menu-avatar">
						<view class="cu-item">
							<image class="cu-avatar round" style="width:80upx;height:80upx" :src="item.creator.avatarUrl" mode="aspectFill" :lazy-load="isLazyLoad" @click.stop="toUser(item.creator.objectId)"></image>
							<view class="content flex-sub">
								<view class="flex justify-between">
									<text class="text-df text-bold">{{item.creator.nickname}}</text>
									<image v-if="item.creator.objectId!=objectId" style="width:48upx;height:48upx" src="../../../static/img/more.png" mode="aspectFill" @click.stop="moreActionSheetTap(item)"></image>
								</view>
								<view class="text-gray text-sm flex justify-between">
									<text class="text-sm">{{item.createdAt}}</text>
								</view>
							</view>
						</view>
					</view>
					<!-- 内容部分 -->
					<view class="text-content padding-lg" style="padding-bottom:0;padding-top:0;">
						{{item.content}}
					</view>
					<!-- 图片部分 -->
					<view class="grid flex-sub" style="padding:0" :class="item.imgList.length!=1?'col-3 grid-square':'col-1'" v-if="item.imgList[0]===''?false:true">
						<view class="bg-img" :class="imgItem.length!=1?'':'only-img'"
						 v-for="(imgItem,imgIndex) in item.imgList" :key="imgIndex">
							<image :src="imgItem" style="width:750upx" mode="widthFix" @click.stop="previewImg(item.imgList,imgIndex)" :lazy-load="isLazyLoad"></image>
						</view>
					</view>
					<!-- 按钮部分 -->
					<view class="flex solid-bottom padding justify-between" style="padding-top: 0;padding-bottom:0upx;">
						<view class="radius">
							<image v-if="!item.isLike" class="card-btn" src="../../../static/img/like.png" mode="aspectFill" @click.stop="like(item.objectId,index,item.creator.objectId)"></image>
							<image v-else class="card-btn" src="../../../static/img/islike.png" mode="aspectFill" @click.stop="unlike(item.objectId,index)"></image>
							<image class="card-btn" src="../../../static/img/comment.png" style="margin-left:20upx" mode="aspectFill" @click.stop="toComment(item.objectId)"></image>
							<image class="card-btn" src="../../../static/img/share.png" style="margin-left:20upx" mode="aspectFill"></image>
						</view>
						<view class="radius">
							<image v-if="!item.isCollect" class="card-btn" src="../../../static/img/collect.png" mode="aspectFill" @click.stop="collect(item.objectId,index,item.creator.objectId)"></image>
							<image v-else class="card-btn" src="../../../static/img/iscollect.png" mode="aspectFill" @click.stop="unCollect(item.objectId,index)"></image>
						</view>
					</view>
					<!-- 标签部分 -->
					<view v-if="item.tag" class="flex justify-start padding" style="flex-flow:row wrap;padding-top: 0;padding-bottom:0upx;">
						<text v-for="(tagItem,tagIndex) in item.tag" :key="tagIndex" class="bg-gray light round text-bold text-sm" style="padding: 5upx 30upx;margin-right:30upx">{{tagItem}}</text>
					</view>	
					<!-- 统计部分 -->
					<view class="flex solid-bottom padding-xl justify-between align-center" style="padding-top: 0;padding-bottom:0upx;">
						<view class="radius flex justify-center align-center" >
							<view style="line-height:70upx;margin-right:50upx" @click.stop="toLike(item.objectId)">{{item.likes.count}}点赞</view>
							<view style="line-height:70upx" class="text-gray" @click.stop="toComment(item.objectId)">{{item.comments.count}}评论</view>
						</view>
						<view v-if="item.Geolocation.name" class="radius flex justify-center align-center" @click.stop="openLocation(item.Geolocation)">
							<image class="card-btn" style="width:60upx;height:60upx" src="../../../static/img/address.png" mode="aspectFill" />
							<text class="bg-gray round text-bold text-sm" style="padding: 5upx 30upx">{{item.Geolocation.name}}</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<!-- fab -->
		<button v-show="btnShow" class="fab" @click="goTop"></button>
	</view>
</template>

<script>
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue" 
	import Bmob from "hydrogen-js-sdk"
	import hFormAlert from '@/components/h-form-alert/h-form-alert.vue'
	export default {
		components: {uniNavBar,hFormAlert},
		data() {
			return {
				scrollTop:0,
				oldScrollTop:0,
				isCard: true,
				blogList:[],
				isLazyLoad:true,
				objectId:'',
				pageNum:1,
				pageSize:10,
				windowHeight:0,
				btnShow:true
			}
		},
		onLoad() {
			this.getSysInfo()
			this.loadUserData()
			this.initBlogList()
		},
		onShow() {
			
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
			loadUserData(){//获取用户信息
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
			toAdd(){
				uni.navigateTo({
					url: '../Add/Add'
				})
			},
			toMicroBlog(objectId){
				uni.navigateTo({
					url: `../MicroBlog/MicroBlog?microBlogId=${objectId}`
				})
			},
			toComment(objectId){
				uni.navigateTo({
					url: `../Comment/Comment?microBlogId=${objectId}`
				})
			},
			toLike(objectId){
				uni.navigateTo({
					url: `../Like/Like?microBlogId=${objectId}`
				})
			},
			toReport(objectId){
				uni.navigateTo({
					url: `../Report/Report?microBlogId=${objectId}`
				})
			},
			toUser(objectId){
				uni.navigateTo({
					url: `../User/User?objectId=${objectId}`
				})
			},
			// 大图预览 + 保存到相册
			previewImg(list,index){
				uni.previewImage({
					urls:list,
					current:index,
					longPressActions:{
						itemList:['保存到相册'],
						success: function(data) {
							console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片')
						},
						fail: function(err) {
							console.log(err.errMsg)
						}
					}
				})
			},
			scroll: function(e) {
				this.oldScrollTop = e.detail.scrollTop
				if(e.detail.deltaY<=0){
					this.btnShow = false
				}else{
					this.btnShow = true
				}
				if(this.oldScrollTop === 0){
					this.btnShow = false
				}
			},
			goTop: function(e){
				this.scrollTop = this.oldScrollTop
            	this.$nextTick(function() {
					this.scrollTop = 0
				})
				this.initBlogList()
			},
			// 初始化首页数据
			initBlogList(){
				this.pageNum = 1
				var countNumberLike = 0 
				var countNumberComment = 0 
				var countNumberCollect = 0 
				// 查表MicroBlog
				var query = Bmob.Query('MicroBlog')
				// 查询详细creator
				query.include('creator')
				// 按创建时间倒序
				query.order("-createdAt")
				// 一次加载pageSize条
				query.limit(this.pageSize)
				uni.showLoading({
					title: '加载中'
				})
				query.find().then(res_blog => {
					// 数据处理
					res_blog.map((item_blog,index_blog)=>{
						item_blog.isLike = false
						item_blog.isCollect = false
						item_blog.createdAt = this.getDateDiff(item_blog.createdAt)
						// 分割imgList
						if(item_blog.imgList){
							item_blog.imgList=item_blog.imgList.split(",")
						}
						// 分割tag
						if(item_blog.tag){
							item_blog.tag=item_blog.tag.split(",")
						}
						// 查询点赞的关联关系
						let queryLike = Bmob.Query('MicroBlog')
						queryLike.field('likes',item_blog.objectId)
						// 查询点赞的具体的用户信息
						queryLike.relation('Like').then(res_like => {
							item_blog.likes = res_like
							// 查询是否点赞这条帖子 方法一
							for(var i = 0; i < res_like.results.length; i++){
								if(res_like.results[i].creator.objectId === this.objectId){
									item_blog.isLike = true
									break
								}
							}
							countNumberLike = countNumberLike + 1
							if(countNumberLike === res_blog.length && countNumberComment === res_blog.length && countNumberCollect === res_blog.length){
								this.blogList=res_blog
								uni.hideLoading()
								console.log('this.blogList',this.blogList)
							}
						})
						// 查询评论的关联关系
						let queryComment = Bmob.Query('MicroBlog')
						queryComment.field('comments',item_blog.objectId)
						// 查询评论的具体用户信息
						queryComment.relation('Comment').then(res_comment => {
							item_blog.comments = res_comment
							countNumberComment = countNumberComment + 1
							if(countNumberLike === res_blog.length && countNumberComment === res_blog.length && countNumberCollect === res_blog.length){

								this.blogList=res_blog
								uni.hideLoading()
								console.log('this.blogList',this.blogList)
							}
						})
						// 查询收藏的关联关系
						let queryCollect = Bmob.Query('MicroBlog')
						queryCollect.field('collects',item_blog.objectId)
						// 查询收藏的具体的用户信息
						queryCollect.relation('Collect').then(res_collect => {
							item_blog.collects = res_collect
							// 查询是否收藏这条帖子 方法一
							for(var i = 0; i < res_collect.results.length; i++){
								if(res_collect.results[i].creator.objectId === this.objectId){
									item_blog.isCollect = true
									break
								}
							}
							countNumberCollect = countNumberCollect + 1
							if(countNumberLike === res_blog.length && countNumberComment === res_blog.length && countNumberCollect === res_blog.length){
								this.blogList=res_blog
								uni.hideLoading()
								console.log('this.blogList',this.blogList)
							}
						})
					})
				}).catch(err => {
					console.log(err)
				})
			},
			// 下拉加载
			currentChange(e){
				var countNumberLike = 0 
				var countNumberComment = 0 
				var countNumberCollect = 0 
				// 查表MicroBlog
				var query = Bmob.Query('MicroBlog')
				// 查询详细creator
				query.include('creator')
				// 按创建时间倒序
				query.order("-createdAt")
				// 一次加载pageSize条
				query.limit(this.pageSize)
				// 跳过
				query.skip(this.pageSize*(this.pageNum))
				uni.showLoading({
					title: '加载中'
				})
				query.find().then(res_blog => {
					if(res_blog.length===0){
						uni.showToast({
							title: '没有更多了',
							duration: 2000,
							icon:'none'
						})
					}else{
						this.pageNum = this.pageNum+1
						// 数据处理
						res_blog.map((item_blog,index_blog)=>{
							item_blog.isLike = false
							item_blog.isCollect = false
							item_blog.createdAt = this.getDateDiff(item_blog.createdAt)
							// 分割imgList
							if(item_blog.imgList){
								item_blog.imgList=item_blog.imgList.split(",")
							}
							// 分割tag
							if(item_blog.tag){
								item_blog.tag=item_blog.tag.split(",")
							}
							// 查询点赞的关联关系
							let queryLike = Bmob.Query('MicroBlog')
							queryLike.field('likes',item_blog.objectId)
							// 查询点赞的具体的用户信息
							queryLike.relation('Like').then(res_like => {
								item_blog.likes = res_like
								// 查询是否点赞这条帖子 方法一
								for(var i = 0; i < res_like.results.length; i++){
									if(res_like.results[i].creator.objectId === this.objectId){
										item_blog.isLike = true
										break
									}
								}
								// console.log('index',index_blog,'countNumber',countNumberLike,'result',res_like)
								countNumberLike = countNumberLike + 1
								if(countNumberLike === res_blog.length && countNumberComment === res_blog.length && countNumberCollect === res_blog.length){
									this.blogList=this.blogList.concat(res_blog)
									uni.hideLoading()
									console.log('this.blogList',this.blogList)
								}
							})
							// 查询评论的关联关系
							let queryComment = Bmob.Query('MicroBlog')
							queryComment.field('comments',item_blog.objectId)
							// 查询评论的具体用户信息
							queryComment.relation('Comment').then(res_comment => {
								item_blog.comments = res_comment
								countNumberComment = countNumberComment + 1
								if(countNumberLike === res_blog.length && countNumberComment === res_blog.length && countNumberCollect === res_blog.length){
									this.blogList=this.blogList.concat(res_blog)
									uni.hideLoading()
									console.log('this.blogList',this.blogList)
								}
							})
							// 查询收藏的关联关系
							let queryCollect = Bmob.Query('MicroBlog')
							queryCollect.field('collects',item_blog.objectId)
							// 查询收藏的具体的用户信息
							queryCollect.relation('Collect').then(res_collect => {
								item_blog.collects = res_collect
								// 查询是否收藏这条帖子 方法一
								for(var i = 0; i < res_collect.results.length; i++){
									if(res_collect.results[i].creator.objectId === this.objectId){
										item_blog.isCollect = true
										break
									}
								}
								countNumberCollect = countNumberCollect + 1
								if(countNumberLike === res_blog.length && countNumberComment === res_blog.length && countNumberCollect === res_blog.length){
									this.blogList=this.blogList.concat(res_blog)
									uni.hideLoading()
									console.log('this.blogList',this.blogList)
								}
							})
						})
					}
				}).catch(err => {
					console.log(err)
				})
			},
			// 点赞
			like(itemid,index,creatorid){
				// 关联点赞者
				const pointer = Bmob.Pointer('_User')
				const poiID = pointer.set(this.objectId)
				// 关联被点赞帖子
				const pointer_blog = Bmob.Pointer('MicroBlog')
				const poiID_blog = pointer.set(itemid)
				// 关联被点赞者
				const pointer_creator = Bmob.Pointer('_User')
				const poiID_creator = pointer.set(creatorid)
				// 写入数据库Like表 写入点赞记录
				const query = Bmob.Query('Like')
				query.set('creator',poiID)
				query.set('liked_blog',poiID_blog)
				query.set('liked_creator',poiID_creator)
				query.save().then(res => {
					console.log(res)
					const relation = Bmob.Relation('Like') // 需要关联的表
					const relID = relation.add([res.objectId]) //关联表中需要关联的objectId, 返回一个Relation对象, add方法接受string和array的类型参数
					const query1 = Bmob.Query('MicroBlog')
					query1.get(itemid).then(result => {
						result.set('likes',relID) // 将Relation对象保存到likes字段中，即实现了一对多的关联
						result.save()
						console.log(result)
						this.blogList[index].isLike = true
						this.blogList[index].likes.count++
						uni.showToast({
							title: '点赞成功',
							duration: 2000
						})
					})
				}).catch(err => {
					console.log(err)
					uni.showToast({
						title:err.error,
						icon:'none',
						complete:()=>{
							setTimeout(()=>{
							uni.hideToast()
							},2000)
						}
					})
				})
			},
			// 取消点赞
			unlike(itemid,index){
				// 查询符合条件的点赞表的记录
				const query = Bmob.Query('Like')
				query.equalTo("creator", '===', this.objectId)
				query.equalTo("liked_blog", '===', itemid)
				query.find().then(res => {
					console.log(res)
					const query = Bmob.Query('Like')
					query.destroy(res[0].objectId).then(result => {
						console.log(result)
						this.blogList[index].isLike = false
						this.blogList[index].likes.count--
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
			collect(itemid,index,creatorid){
				// 关联收藏者
				const pointer = Bmob.Pointer('_User')
				const poiID = pointer.set(this.objectId)
				// 关联被收藏帖子
				const pointer_blog = Bmob.Pointer('MicroBlog')
				const poiID_blog = pointer.set(itemid)
				// 关联被收藏者
				const pointer_creator = Bmob.Pointer('_User')
				const poiID_creator = pointer.set(creatorid)
				// 写入数据库Collect表 写入收藏记录
				const query = Bmob.Query('Collect')
				query.set('creator',poiID)
				query.set('collected_blog',poiID_blog)
				query.set('collected_creator',poiID_creator)
				query.save().then(res => {
					console.log(res)
					const relation = Bmob.Relation('Collect') // 需要关联的表
					const relID = relation.add([res.objectId]) //关联表中需要关联的objectId, 返回一个Relation对象, add方法接受string和array的类型参数
					const query1 = Bmob.Query('MicroBlog')
					query1.get(itemid).then(result => {
						result.set('collects',relID) // 将Relation对象保存到likes字段中，即实现了一对多的关联
						result.save()
						console.log(result)
						this.blogList[index].isCollect = true
						uni.showToast({
							title: '收藏成功',
							duration: 2000
						})
					})
				}).catch(err => {
					console.log(err)
					uni.showToast({
						title:err.error,
						icon:'none',
						complete:()=>{
							setTimeout(()=>{
							uni.hideToast()
							},2000)
						}
					})
				})
			},
			// 取消点赞
			unCollect(itemid,index){
				// 查询符合条件的点赞表的记录
				const query = Bmob.Query('Collect')
				query.equalTo("creator", '===', this.objectId)
				query.equalTo("collected_blog", '===', itemid)
				query.find().then(res => {
					console.log(res)
					const query = Bmob.Query('Collect')
					query.destroy(res[0].objectId).then(result => {
						console.log(result)
						this.blogList[index].isCollect = false
						uni.showToast({
							title: '取消收藏',
							duration: 2000
						})
					}).catch(err => {
						console.log(err)
						uni.showToast({
							title: '取消收藏失败',
							duration: 2000,
							icon:'none'
						})
					})
				})
			},
			// 更多弹窗
			moreActionSheetTap(item) {
				const query = Bmob.Query('Attention')
				query.equalTo("bloger", '===', item.creator.objectId)
				query.equalTo("fans", '===', this.objectId)
				query.find().then(res => {
					// 已关注
					if(res.length!=0){
						uni.showActionSheet({
							itemList: ['取消关注', '举报'],
							success: (e) => {
								switch(e.tapIndex){
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
												icon:'none'
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
					else{
						uni.showActionSheet({
							itemList: ['关注', '举报'],
							success: (e) => {
								switch(e.tapIndex){
									case 0:
										// 关联自己
										const pointer = Bmob.Pointer('_User')
										const poiID = pointer.set(this.objectId)
										// 关联被博主
										const pointer_bloger = Bmob.Pointer('_User')
										const poiID_bloger = pointer.set(item.creator.objectId)
										// 写入数据库Attention表 写入收藏记录
										const query = Bmob.Query('Attention')
										query.set('fans',poiID)
										query.set('bloger',poiID_bloger)
										query.save().then(res => {
											uni.showToast({
												title: '关注成功',
												duration: 2000
											})
										}).catch(err =>{
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
			openLocation (Geolocation) {
				uni.openLocation({
					latitude: Geolocation.latitude,
					longitude: Geolocation.longitude
				})
			},
			// 时间格式化
			getDateDiff(dateTimeStamp) {
				// 时间字符串转时间戳
				var timestamp = new Date(dateTimeStamp).getTime()
				
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
	.full{
		background-color: #EEEEEE;
	}
	.cu-list.menu-avatar>.cu-item:after, .cu-list.menu>.cu-item:after {	
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
	.col-1 .bg-img image{
		max-width: 100%;
	}
	.cu-list.menu-avatar>.cu-item {
		height: 120upx;
	}
	.cu-card .grid.grid-square{
		margin: 20upx;
	}
	.card-btn{
		width: 70upx;
		height: 70upx;
		padding: 10upx;
		padding-bottom: 0;
	}
	.uni-more-content{
		border-bottom: 1upx solid #f0f0f0;
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
