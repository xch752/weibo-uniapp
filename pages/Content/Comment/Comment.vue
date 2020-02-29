<template>
	<view>
		<uni-nav-bar left-icon="back" @click-left="navBack" :status-bar="true" shadow="true" fixed="true" title="评论"></uni-nav-bar>
		<scroll-view v-if="commentsList.length == 0?false:true" :style="{'height':windowHeight+'px'}"  @scrolltolower="currentChange" scroll-y="true">
			<view class="cu-list menu-avatar">
				<view class="cu-item" v-for="(item,index) in commentsList" :key="index" :style="{'background':item.background}"  @click="Reply(item,index)">
					<view class="cu-avatar round lg" :style="{'background-image':'url('+item.creator.avatarUrl+')'}"></view>
					<view class="content">
						<view class="text-black text-bold">{{item.creator.nickname}}</view>
						<view class="text-black text-sm flex">
							<view class="text-cut">
								<text v-if="item.replyUser">回复<text class="text-bold"> {{item.replyUser.nickname}}:</text></text>{{item.review}}
							</view>
						</view>
					</view>
					<view class="action">
						<view class="text-grey text-xs">{{item.createdAt}}</view>
						<!-- <view class="cu-tag round bg-grey sm"></view> -->
					</view>
				</view>
			</view>
		</scroll-view>
		<view v-if="commentsList.length == 0?true:false" class="flex justify-center align-center" :style="{'height':windowHeight+'px'}">
			<view style="text-align:center">
				<image src="http://static.xch752.com/undraw_sync_files_xb3r.png" mode="aspectFit" style="width: 200upx;height: 200upx;"></image>
				<view class="text-gray margin-top-sm">还没有评论</view>
			</view>
		</view>
		<!-- 输入框 -->
		<view class="cu-bar foot input" :style="[{'bottom':InputBottom+'px'}]">
			<input class="solid-bottom round" style="boder:1upx solid #000000" :adjust-position="false" :focus="inputFocus" maxlength="300" cursor-spacing="10"
			 :placeholder="placeholderValue" @focus="InputFocus" @blur="InputBlur" v-model="bodyValue" confirm-type="send" @confirm="postComment" :confirm-hold='true'></input>
			<!-- <view class="action">
				<image src="https://static.mianyangjuan.com//Emoticon@3x.png" mode="aspectFit" style="width: 60upx;height: 60upx;margin: 30upx 0 30upx 15upx;"></image>
			</view> -->
			<!-- <image ref="btn" @click="postComment" src="https://static.mianyangjuan.com//send@3x.png" mode="aspectFit" style="width: 60upx;height: 60upx;margin: 30upx 0 30upx 15upx;"></image> -->
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
				commentsList:[],
				// scrollview高度
				windowHeight:'',
				// 发送内容
				bodyValue:'',
				// 回复用户提示
				placeholderValue:'喜欢就评论告诉TA',
				// 回复用户
				replyUser:{},
				// 底部输入框定位高度
				InputBottom:0,
				// 输入框Focus状态
				inputFocus: false
			}
		},
		onLoad:function(option){
			this.loadUserData()
			this.getSysInfo()
			this.microBlogId = option.microBlogId
			this.initData()
			// this.btnInputBlur()
		},
		methods: {
			// 获取屏幕高度
			getSysInfo(){
				uni.getSystemInfo({
					success:(e)=>{
						console.log(e)
						this.windowHeight = e.windowHeight-(e.windowWidth/750)*(100+140)
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
				query.equalTo("objectId","==", this.microBlogId)
				uni.showLoading({
					title: '加载中'
				})
				query.find().then(res_blog => {
					// console.log(res_blog)
					// 查询评论的关联关系
					// console.log(res_blog)
					this.microBlogCreaotrId = res_blog[0].creator.objectId
					let queryComment = this.Bmob.Query('MicroBlog')
						queryComment.field('comments',res_blog[0].objectId)
						queryComment.order("-createdAt")
						queryComment.limit(this.pageSize)
						queryComment.include('creator','replyUser')
						// 查询评论的具体用户信息
						queryComment.relation('Comment').then(res_comment => {
							res_comment.results.map(res_comment_item=>{
								res_comment_item.createdAt = this.getDateDiff(res_comment_item.createdAt)
								res_comment_item.background = '#ffffff'
							})
							this.commentsList = res_comment.results
							console.log('this.commentsList',this.commentsList)
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
				query.equalTo("objectId","==", this.microBlogId)
				query.find().then(res_blog => {
					// console.log(res_blog)
					// 查询评论的关联关系
					let queryComment = this.Bmob.Query('MicroBlog')
					queryComment.field('comments',res_blog[0].objectId)
					queryComment.order("-createdAt")
					queryComment.limit(this.pageSize)
					queryComment.skip(this.pageSize*(this.pageNum))
					queryComment.include('creator','replyUser')
					// 查询评论的具体用户信息
					queryComment.relation('Comment').then(res_comment => {
						if(res_comment.results.length==0){
							uni.showToast({
								title: '没有更多了',
								duration: 2000,
								icon:'none'
							})
						}else{
							this.pageNum = this.pageNum+1
							res_comment.results.map(res_comment_item=>{
								res_comment_item.createdAt = this.getDateDiff(res_comment_item.createdAt)
								res_comment_item.background = '#ffffff'
							})
							this.commentsList = this.commentsList.concat(res_comment.results)
							console.log('this.commentsList',this.commentsList)
						}					
					}).catch((err)=>{
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
			// 发送评论
			postComment(e){
				if(this.bodyValue == '')
				return
				console.log(e)
				// 关联评论者
				const pointer = this.Bmob.Pointer('_User')
				const poiID = pointer.set(this.objectId)
				// 关联被评论帖子
				const pointer_blog = this.Bmob.Pointer('MicroBlog')
				const poiID_blog = pointer.set(this.microBlogId)
				// 关联被评论者
				const pointer_creator = this.Bmob.Pointer('_User')
				const poiID_creator = pointer.set(this.microBlogCreaotrId)
				// 关联被回复者
				console.log('this.replyUser.objectId',this.replyUser.objectId)
				if(this.replyUser.objectId){
					var pointer_reply = this.Bmob.Pointer('_User')
					var poiID_reply = pointer_reply.set(this.replyUser.objectId)
					console.log('pointer_reply',pointer_reply)
					console.log('poiID_reply',poiID_reply)
				}
				// 写入数据库Comment表 写入评论记录
				const query = this.Bmob.Query('Comment')
				query.set('creator',poiID)
				query.set('commented_blog',poiID_blog)
				query.set('commented_creator',poiID_creator)
				query.set('review',this.bodyValue)
				console.log('this.replyUser.objectId',this.replyUser.objectId)
				if(this.replyUser.objectId){
					query.set('replyUser',poiID_reply)
					console.log('poiID_reply',poiID_reply)
				}
				// 写入数据库Comment表 写入评论记录
				console.log('query',query)
				query.save().then(res => {
					console.log(res)
					const relation = this.Bmob.Relation('Comment') // 需要关联的表
					const relID = relation.add([res.objectId]) //关联表中需要关联的objectId, 返回一个Relation对象, add方法接受string和array的类型参数
					const query1 = this.Bmob.Query('MicroBlog')
					query1.get(this.microBlogId).then(result => {
						result.set('comments',relID) // 将Relation对象保存到comments字段中，即实现了一对多的关联
						result.save()
						console.log(result)
						this.bodyValue = ''
						this.initData()
						uni.showToast({
							title: '评论成功',
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
			// 点击回复
			Reply(item,index){
				this.commentsList[index].background = '#eeeeee'
				setTimeout(()=>{
					this.commentsList[index].background = '#ffffff'
				},300)
				if(this.inputFocus == false){
					this.inputFocus = true
				}		
				this.placeholderValue = `回复 ${item.creator.nickname}`
				this.replyUser = item.creator
				console.log('replyUser_Reply',this.replyUser)
			},
			// 获取input焦点
			InputFocus(e) {
				console.log('InputFocus',this.inputFocus)
				this.InputBottom = e.detail.height
				this.inputFocus = true
			},
			// 失去input焦点
			InputBlur(e) {
				console.log('InputBlur',this.inputFocus)
				this.inputFocus = false
				this.InputBottom = 0
				this.placeholderValue = '喜欢就评论告诉TA'
				this.replyUser = {}
				console.log('replyUser_InputBlur',this.replyUser)
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

<style>

</style>
