<template>
	<scroll-view :style="{'height':windowHeight+'px'}" scroll-y="true" :scroll-top="scrollTop"  @scroll="scroll" @scrolltolower="currentChange" lower-threshold="5">
		<view class="full">
			<view class="header">
				<view class="setting">
					<image style="width:48upx;height:48upx" src="../../../static/img/more.png" mode="aspectFill" @click.stop="moreActionSheetTap()"></image>
				</view>
				<view class="avatar" :style="{'background-image':'url('+userInfo.avatarUrl+')'}"></view>
			</view>
			<view class="info solid-bottom" style="margin-bottom:20upx">
				<view>
					<text class="text-xl text-bold">{{userInfo.nickname}}</text>
				</view>
				<view>
					<text class="text-df text-gray">id:{{userInfo.objectId}}</text>
				</view>
				<view v-if="userInfo.introduction">
					<text class="text-df text-gray">{{userInfo.introduction}}</text>
				</view>
				<view class="flex justify-start" style="flex-flow:row wrap;padding-top: 10upx;padding-bottom:0upx;">
					<text class="bg-gray light radius text-sm" style="padding: 5upx 15upx;margin-right:15upx" v-if="userInfo.age">{{userInfo.age}}</text>
					<text class="bg-gray light radius text-sm" style="padding: 5upx 15upx;margin-right:15upx" v-if="userInfo.address">{{userInfo.address}}</text>
					<text class="bg-gray light radius text-sm" style="padding: 5upx 15upx;margin-right:15upx" v-if="userInfo.constellation">{{userInfo.constellation}}座</text>
					<text class="bg-gray light radius text-sm" style="padding: 5upx 15upx;margin-right:15upx" @click="toModifyUserInfo"><text class="cuIcon-write"></text> 编辑资料</text>
				</view>
				<view class="flex justify-start" style="flex-flow:row wrap;padding-top: 35upx;padding-bottom:10upx;">
					<text class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.blogCount}}<text class="normal">微博</text></text>
					<text @click="toFans" class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.fansCount}}<text class="normal">粉丝</text></text>
					<text @click="toAttention" class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.attentionCount}}<text class="normal">关注</text></text>
					<text @click="toCollect" class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.collectCount}}<text class="normal">收藏</text></text>
					<text @click="toLiked" class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.likeCount}}<text class="normal">点赞</text></text>
				</view>	
			</view>
			<WaterfallFlow :list="list" :loading="loading" @click="toMicroBlog"></WaterfallFlow>
		</view>
		<!-- fab -->
		<button class="fab" @click="goTop"></button>
	</scroll-view>
</template>

<script>
	import WaterfallFlow from '@/components/nairenk-waterfall-flow/nairenk-waterfall-flow.vue';
	import Bmob from "hydrogen-js-sdk"
	export default{
		components: {WaterfallFlow},
		data(){
			return{
				pageSize:6,
				pageNum:1,
				objectId:'',
				userInfo:{
					avatarUrl:'http://static.xch752.com/mine_background.jpg', // 初始值
					birthday:'',
					sex:'',
					city:''
				},
				token:'',
				windowHeight:'',
				data:{
					fansCount:0,
					attentionCount:0,
					blogCount:0,
					collectCount:0,
					likeCount:0
				},
				loading:false,
				list:[],
				btnShow: false,
				scrollTop:0,
				oldScrollTop:0
			}
		},
		onLoad(){
			setTimeout(()=>{
				this.initDataBlog()
			},100)
		},
		onShow() {
			this.getSysInfo()
			this.loadUserData()
			setTimeout(()=>{
				this.initDataCount()
			},100)
		},
		methods:{
			loadUserData(){//获取用户信息
				try {
					if(!this.objectId){
						this.objectId = uni.getStorageSync('bmob').objectId
						this.userInfo = uni.getStorageSync('bmob')
					}				
					if (!this.objectId) {
						console.log('this.objectId',this.objectId)
						console.log(uni.getStorageSync('bmob').objectId)
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
					if(this.objectId){
						const query = Bmob.Query('_User');//查询登陆用户具体信息
						query.get(this.objectId).then(res => {
							Object.assign(this.userInfo,res)
							if(this.userInfo.birthday){
								this.userInfo.age = ( "00" + (parseInt(this.userInfo.birthday.slice(2,4))-parseInt(this.userInfo.birthday.slice(2,4))%5).toString() ).substr( -2 )+'后'
								this.userInfo.constellation = this.getAstro(this.userInfo.birthday.slice(5,7),this.userInfo.birthday.slice(8,10))
							}
							if(this.userInfo.city){
								this.userInfo.address=`${this.userInfo.city.split(',')[1]} ${this.userInfo.city.split(',')[2]}`
							}
							try {
								uni.setStorageSync('bmob', res)
							} catch (e) {
								console.log(e)
							}
						}).catch(err => {
							console.log(err)
						})
					}
				} catch (e) {
					// error
					console.log(e)
					console.log('this.objectId',this.objectId)
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
			// 获取屏幕高度
			getSysInfo(){
				uni.getSystemInfo({
					success:(e)=>{
						this.windowHeight = e.windowHeight
					}
				})
			},
			moreActionSheetTap(){
				uni.showActionSheet({
					itemList: ['退出登录', '反馈'],
					success: (e) => {
						switch(e.tapIndex){
							case 0:
								uni.showModal({
									title: '提示',
									content: '确认退出',
									success: (res) => {
										if (res.confirm) {
											Bmob.User.logout()
											uni.reLaunch({
												 url: '../../Login/Login'
											})
										} else if (res.cancel) {
											console.log('用户点击取消');
										}
									}
								});
								break
							case 1:
								this.toFeedback()
								break
							default:
								break
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
				this.initDataBlog()
			},
			// 获取数据
			initDataCount(){
				const queryFans = Bmob.Query('Attention')
				queryFans.equalTo('bloger','===',this.objectId)
				queryFans.count().then(res=>{
					this.data.fansCount = res
				})
				const queryAttention = Bmob.Query('Attention')
				queryAttention.equalTo('fans','===',this.objectId)
				queryAttention.count().then(res=>{
					this.data.attentionCount = res
				})
				const queryCollect = Bmob.Query('Collect')
				queryCollect.equalTo('creator','===',this.objectId)
				queryCollect.count().then(res=>{
					this.data.collectCount = res
				})
				const queryLike = Bmob.Query('Like')
				queryLike.equalTo('creator','===',this.objectId)
				queryLike.count().then(res=>{
					this.data.likeCount = res
				})
				const queryBlog = Bmob.Query('MicroBlog')
				queryBlog.equalTo('creator','===',this.objectId)
				queryBlog.count().then(res=>{
					this.data.blogCount = res
				})
			},
			// 获取Blog数据
			initDataBlog(){
				this.pageNum = 1
				this.loading = true
				this.list = []
				this.getSysInfo()
				const queryBlog = Bmob.Query('MicroBlog')
				queryBlog.equalTo('creator','===',this.objectId)
				queryBlog.include('creator')
				queryBlog.limit(this.pageSize)
				queryBlog.order('-createdAt')
				queryBlog.find().then(res=>{
					console.log(res)
					res.map(item=>{
						if(item.imgList){
							item.image = item.imgList.split(',')[0]
						}else{
							item.image = 'http://static.xch752.com/mine_background.jpg'
						}
					})
					this.list = res
					console.log(this.list)
					this.loading = false
				})
			},
			// 下拉加载
			currentChange(e){
				this.loading = true
				const queryBlog = Bmob.Query('MicroBlog')
				queryBlog.equalTo('creator','===',this.objectId)
				queryBlog.include('creator')
				queryBlog.limit(this.pageSize)
				queryBlog.skip(this.pageNum*this.pageSize)
				queryBlog.order('-createdAt')
				queryBlog.find().then(res=>{
					if(res.length === 0){
						uni.showToast({
							title: '没有更多了',
							duration: 2000,
							icon: 'none'
						})
					}else{
						this.pageNum = this.pageNum + 1
						res.map(item=>{
							if(item.imgList){
								item.image = item.imgList.split(',')[0]
							}else{
								item.image = 'http://static.xch752.com/mine_background.jpg'
							}
						})
						this.list = this.list.concat(res)
					}				
					console.log(this.list)
					this.loading = false
				})
			},
			toModifyUserInfo(){
				uni.navigateTo({
					url:`ModifyUserInfo/ModifyUserInfo?objectId=${this.objectId}`,
					success: (res) => {
						console.log(res)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			toFans(){
				uni.navigateTo({
					url:`../Fans/Fans?objectId=${this.objectId}`,
					success: (res) => {
						console.log(res)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			toAttention(){
				uni.navigateTo({
					url:`../Attention/Attention?objectId=${this.objectId}`,
					success: (res) => {
						console.log(res)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			toCollect(){
				uni.navigateTo({
					url:`../Collect/Collect?objectId=${this.objectId}`,
					success: (res) => {
						console.log(res)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			toLiked(){
				uni.navigateTo({
					url:`../Liked/Liked?objectId=${this.objectId}`,
					success: (res) => {
						console.log(res)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			toMicroBlog(item){
				uni.navigateTo({
					url: `../MicroBlog/MicroBlog?microBlogId=${item.objectId}`
				})
			},
			toFeedback(){
				uni.navigateTo({
					url: `../Feedback/Feedback`
				})
			},
			getAstro(m,d){
				return "魔羯水瓶双鱼牡羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯".substr(m*2-(d<"102223444433".charAt(m-1)- -19)*2,2);
			}
		}
	}
</script>

<style scoped>
	/* .full{
		position: fixed;
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		background-color: #FFFFFF; 
	} */
	.suggestion{
		margin-left: 50upx;
		letter-spacing:2upx;
	}
	.header{
		height: 250upx;
		background-image: url('http://static.xch752.com/mine_background.jpg');
		background-size: cover;
		background-position: center;
	}
	.setting{
		position: absolute;
		top:50upx;
		left:50upx;
		width: 48upx;
		height: 48upx;
	}
	.avatar{
		position: absolute;
		top:175upx;
		left:75upx;
		width: 150upx;
		height: 150upx;
		border-radius: 50%;
		border:2upx solid #FFFFFF;
		background-size: cover;
		background-position: center;
		-moz-box-shadow:1px 1px 3px #888888; -webkit-box-shadow:1px 1px 3px #888888; box-shadow:1px 1px 3px #888888;
	}
	.info{
		padding: 80upx 0 0 75upx;
	}
	.normal{
		font-weight:normal
	}
	.item{
		padding-top: 40upx;
		padding-right: 50upx;
		padding-left: 50upx;
		height: 100upx;/*百分比占高,为了适配Pad,若不适配Pad,可以使用单位upx,更加美观*/
		width: 100%;
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
