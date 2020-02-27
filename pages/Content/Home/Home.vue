<template>
	<view class="full">
		<uni-nav-bar left-icon="plus" :status-bar="true" shadow="true" fixed="true" titleIcon="http://static.xch752.com/logo_whiteBG_256.png"></uni-nav-bar>
		<scroll-view scroll-y >
			<view class="cu-card dynamic solid-bottom margin-bottom-sm" :class="isCard?'no-card':''" v-for="(item,index) in blogList" :key="index">
				<view class="cu-item shadow">
					<!-- 头像部分 -->
					<view class="cu-list menu-avatar">
						<view class="cu-item">
							<image class="cu-avatar round lg" :src="item.creator.avatarUrl" mode="aspectFill" :lazy-load="isLazyLoad"></image>
							<view class="content flex-sub">
								<view class="text-sm flex justify-between">
									<view>{{item.creator.nickname}}</view>
									<image style="width:60upx;height:48upx" src="../../../static/img/more.png" mode="aspectFill" @click="this.$refs['more'].open()"></image>
								</view>
								<view class="text-gray text-sm flex justify-between">
									<view>{{item.createdAt}}</view>
								</view>
							</view>
						</view>
					</view>
					<!-- 内容部分 -->
					<view class="text-content margin-top-sm padding-lg" style="padding-bottom:0;padding-top:0;">
						{{item.content}}
					</view>
					<!-- 图片部分 -->
					<view class="grid flex-sub padding-lg" style="padding-top: 0;padding-bottom:20upx;" :class="item.imgList.length!=1?'col-3 grid-square':'col-1'" v-if="item.imgList[0]==''?false:true">
						<view class="bg-img" :class="imgItem.length!=1?'':'only-img'"
						 v-for="(imgItem,imgIndex) in item.imgList" :key="imgIndex">
							<image :src="imgItem" mode="widthFix" @click="previewImg(item.imgList,imgIndex)" :lazy-load="isLazyLoad"></image>
						</view>
					</view>
					<!-- 按钮部分 -->
					<view class="flex solid-bottom padding justify-between" style="padding-top: 0;padding-bottom:0upx;">
						<view class="radius">
							<image v-if="!item.isLike" class="card-btn" src="../../../static/img/like.png" mode="aspectFill" @click="like(item.objectId,index,item.creator.objectId)"></image>
							<image v-if="item.isLike" class="card-btn" src="../../../static/img/islike.png" mode="aspectFill" @click="unlike(item.objectId,index)"></image>
							<image class="card-btn" src="../../../static/img/comment.png" mode="aspectFill"></image>
						</view>
						<view class="radius">
							<image class="card-btn" src="../../../static/img/share.png" mode="aspectFill"></image>
						</view>
					</view>
					<!-- 标签部分 -->
					<view class="flex justify-start padding-xl" style="flex-flow:row wrap;padding-top: 0;padding-bottom:0upx;">
						<text class="bg-blue light round text-bold text-sm" style="padding: 5upx 30upx;margin-right:30upx">1</text>
						<text class="bg-blue light round text-bold text-sm" style="padding: 5upx 30upx;margin-right:30upx">2</text>
					</view>	
					<!-- 统计部分 -->
					<view class="flex solid-bottom padding-xl justify-between align-center" style="padding-top: 0;padding-bottom:0upx;">
						<view class="radius flex justify-center align-center" >
							<view style="line-height:90upx;margin-right:50upx">{{item.likes.count}}点赞</view>
							<view style="line-height:90upx">{{item.likes.count}}评论</view>
						</view>
						<view class="radius flex justify-center align-center" @click="chooseLocation">
							<image class="card-btn" src="../../../static/img/address.png" mode="aspectFill" />
							<text class="bg-gray round text-bold text-sm" style="padding: 5upx 30upx">位置</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<!-- 更多弹窗 -->
		<!-- 在非h5端不能使用ref -->
		<uni-popup ref="more" type="bottom" :custom="true">
			<view class="uni-more bg-gray text-center text-bold text-lg text-black">
				<view class="uni-more-content bg-white padding" >取消关注</view>
				<view class="uni-more-content bg-white padding" >举报</view>
				<view class="uni-more-btn bg-white padding" style="margin-top:15upx" @click="cancel('more')">取消</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue" 
	import Bmob from "hydrogen-js-sdk"
	export default {
		components: {uniNavBar,uniPopup},
		data() {
			return {
				isCard: true,
				blogList:[],
				isLazyLoad:true,
				objectId:''
			}
		},
		onLoad() {
			this.loadUserData()
			this.initBlogList()
		},
		onShow() {
			
		},
		methods: {
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
			// 初始化首页数据
			initBlogList(){
				var countNumberLike = 0 
				// 查表MicroBlog
				var query = Bmob.Query('MicroBlog')
				// 查询详细creator
				query.include('creator')
				// 按创建时间倒序
				query.order("-createdAt")
				// 一次加载20条
				query.limit(20)
				uni.showLoading({
					title: '加载中'
				})
				query.find().then(res_blog => {
					// 数据处理
					res_blog.map((item_blog,index_blog)=>{
						item_blog.isLike = false
						// 分割imgList
						if(res_blog.imgList!=''){
							item_blog.imgList=item_blog.imgList.split(",")
						}
						// 查询点赞的关联关系
						let queryLike = Bmob.Query('MicroBlog')
						queryLike.field('likes',item_blog.objectId)
						// 查询点赞的具体的用户信息
						queryLike.relation('Like').then(res_like => {
							item_blog.likes = res_like
							// 查询是否点赞这条帖子 方法一
							for(var i = 0; i < res_like.results.length; i++){
								if(res_like.results[i].creator.objectId == this.objectId){
									item_blog.isLike = true
									break
								}
							}
							// 查询是否点赞这条帖子 方法二
							//   if(result.results.length!=0){
							// 	result.results.map(cur => {
							// 		console.log(cur,_THAT.objectId)
							// 		if(cur.creator.objectId == _THAT.objectId){
							// 			currentValue.isLike = true
							// 		}
							// 	})
							//   }
							console.log('index',index_blog,'countNumber',countNumberLike,'result',res_like)
							countNumberLike = countNumberLike + 1
							if(countNumberLike == res_blog.length){
								this.blogList=res_blog
								uni.hideLoading()
								console.log('this.blogList',this.blogList)
							}
						})
					})
					// 数据赋值
					// setTimeout(()=>{
					// 	THAT.blogList=res;
					// 	console.log(THAT.blogList)
					// },0)
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
			// 更多popup 取消
			cancel(type) {
				this.$refs[type].close()
			},
			// 位置
			chooseLocation () {
				uni.chooseLocation({
					success: (res) => {
						console.log(res)
					}
				})
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
	.solid-bottom::after {
		border-bottom: 0;
	}
	/* 单行card的图片大小 */
	.col-1 .bg-img image{
		max-width: 70%;
	}
	.card-btn{
		width: 100upx;
		height: 100upx;
		padding: 20upx;
	}
	.uni-more-content{
		border-bottom: 1upx solid #f0f0f0;
	}
</style>
