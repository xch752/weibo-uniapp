<template>
	<scroll-view :style="{'height':windowHeight+'px'}" scroll-y="true" :scroll-top="scrollTop"  @scroll="scroll" @scrolltolower="currentChange" lower-threshold="5">
		<view class="full">
			<view class="header">
				<view class="setting">
					<image style="width:48upx;height:48upx" src="../../../static/img/back.png" mode="aspectFill" @click.stop="navBack"></image>
				</view>
				<view class="avatar" :style="{'background-image':'url('+userInfo.avatarUrl+')'}"></view>
			</view>
			<view class="info solid-bottom" style="margin-bottom:20upx">
				<view v-if="!attentionShow && objectId!=myObjectId" @click="attention" class="attention-active text-white"><text class="cuIcon-add"></text> 关注</view>
				<view v-if="attentionShow && objectId!=myObjectId" @click="unAttention" class="attention text-gray">已关注</view>
				<view>
					<text class="text-xl text-bold">{{userInfo.nickname}}</text>
				</view>
				<view>
					<text class="text-df text-gray">id:{{userInfo.objectId}}</text>
				</view>
				<view v-if="userInfo.introduction">
					<text class="text-df text-black">{{userInfo.introduction}}</text>
				</view>
				<view class="flex justify-start" style="flex-flow:row wrap;padding-top: 10upx;padding-bottom:0upx;">
					<text class="bg-gray light radius text-sm" style="padding: 5upx 15upx;margin-right:15upx" v-if="userInfo.age">{{userInfo.age}}</text>
					<text class="bg-gray light radius text-sm" style="padding: 5upx 15upx;margin-right:15upx" v-if="userInfo.address">{{userInfo.address}}</text>
					<text class="bg-gray light radius text-sm" style="padding: 5upx 15upx;margin-right:15upx" v-if="userInfo.constellation">{{userInfo.constellation}}座</text>
				</view>
				<view class="flex justify-start" style="flex-flow:row wrap;padding-top: 35upx;padding-bottom:10upx;">
					<text class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.blogCount}}<text class="normal">微博</text></text>
					<text @click="toFans" class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.fansCount}}<text class="normal">粉丝</text></text>
					<text class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.attentionCount}}<text class="normal">关注</text></text>
					<text class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.collectCount}}<text class="normal">收藏</text></text>
					<text class="text-bold text-df" style="padding: 5upx 15upx;margin-right:15upx">{{data.likeCount}}<text class="normal">点赞</text></text>
				</view>	
			</view>
			<WaterfallFlow :list="list" :loading="loading" @click="toMicroBlog"></WaterfallFlow>
		</view>
		<!-- fab -->
		<button v-show="btnShow" class="fab" @click="goTop"></button>
	</scroll-view>
</template>

<script>
	import WaterfallFlow from '@/components/nairenk-waterfall-flow/nairenk-waterfall-flow.vue';
	import Bmob from "hydrogen-js-sdk"
	export default{
		components: {WaterfallFlow},
		data(){
			return{
				pageSize:10,
				pageNum:1,
				// 登录用户的id
				myObjectId:'',
				// 查看的用户id
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
				oldScrollTop:0,
				attentionShow: false
			}
		},
		onLoad:function(option){
			this.objectId = option.objectId
			console.log('this.objectId',this.objectId)
			setTimeout(()=>{
				let queryObject = {
					userInfo: true
				}
				this.initDataCount(queryObject)
				this.initDataBlog()
			},100)
		},
		onShow() {
			this.getSysInfo()
			this.loadUserData()
			setTimeout(()=>{
				let queryObject = {
					blogCount: true,
					fansCount: true,
					attentionCount: true,
					collectCount: true,
					likeCount: true,
					isAttention: true,
					userInfo: false
				}
				this.initDataCount(queryObject)
			},100)
		},
		methods:{
			loadUserData(){//获取用户信息
				try {
					if(!this.myObjectId){
						this.myObjectId = uni.getStorageSync('bmob').objectId
						this.userInfo = uni.getStorageSync('bmob')
						console.log('this.myObjectId',this.myObjectId)
					}				
					if (!this.myObjectId) {
						console.log('this.objectId',this.myObjectId)
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
				} catch (e) {
					// error
					console.log(e)
					console.log('this.myObjectId',this.myObjectId)
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
						console.log(e)
						this.windowHeight = e.windowHeight
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
				if(this.oldScrollTop == 0){
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
			// 获取数据 blogCount,fansCount,attentionCount,collectCount,likeCount,isAttention,userInfo
			initDataCount(queryObject){
				if(queryObject.blogCount==true){
					const queryBlog = Bmob.Query('MicroBlog')
					queryBlog.equalTo('creator','===',this.objectId)
					queryBlog.count().then(res=>{
						this.data.blogCount = res
					})
				}
				if(queryObject.fansCount==true){
					const queryFans = Bmob.Query('Attention')
					queryFans.equalTo('bloger','===',this.objectId)
					queryFans.count().then(res=>{
						this.data.fansCount = res
					})
				}
				if(queryObject.attentionCount==true){
					const queryAttention = Bmob.Query('Attention')
					queryAttention.equalTo('fans','===',this.objectId)
					queryAttention.count().then(res=>{
						this.data.attentionCount = res
					})
				}
				if(queryObject.collectCount==true){
					const queryCollect = Bmob.Query('Collect')
					queryCollect.equalTo('creator','===',this.objectId)
					queryCollect.count().then(res=>{
						this.data.collectCount = res
					})
				}
				if(queryObject.likeCount==true){
					const queryLike = Bmob.Query('Like')
					queryLike.equalTo('creator','===',this.objectId)
					queryLike.count().then(res=>{
						this.data.likeCount = res
					})
				}
				if(queryObject.isAttention==true){
					const queryIsAttention = Bmob.Query('Attention')
					queryIsAttention.equalTo('bloger','===',this.objectId)
					queryIsAttention.equalTo('fans','===',this.myObjectId)
					queryIsAttention.count().then(res=>{
						// if(this.objectId!=this.myObjectId){
						// 	this.attentionShow = false
						// }
						if(res!=0){
							this.attentionShow = true
						}else{
							this.attentionShow = false
						}
					})
				}
				if(queryObject.userInfo==true){
					const query = Bmob.Query('_User')
					query.get(this.objectId).then(res => {
						Object.assign(this.userInfo,res)
						if(this.userInfo.birthday){
							this.userInfo.age = ( "00" + (parseInt(this.userInfo.birthday.slice(2,4))-parseInt(this.userInfo.birthday.slice(2,4))%5).toString() ).substr( -2 )+'后'
							this.userInfo.constellation = this.getAstro(this.userInfo.birthday.slice(5,7),this.userInfo.birthday.slice(8,10))
						}
						if(this.userInfo.city){
							this.userInfo.address=`${this.userInfo.city.split(',')[1]} ${this.userInfo.city.split(',')[2]}`
						}
						console.log(this.userInfo)
					}).catch(err => {
						console.log(err)
					})
				}
			},
			// 获取Blog数据
			initDataBlog(){
				this.loading = true
				const queryBlog = Bmob.Query('MicroBlog')
				queryBlog.equalTo('creator','===',this.objectId)
				queryBlog.include('creator')
				queryBlog.limit(this.pageSize)
				queryBlog.order('-createdAt')
				console.log('queryBlog',queryBlog)
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
					if(res.length == 0){
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
			// 返回
			navBack(){
				uni.navigateBack({
					delta: 1
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
			toMicroBlog(item){
				uni.navigateTo({
					url: `../MicroBlog/MicroBlog?microBlogId=${item.objectId}`
				})
			},
			getAstro(m,d){
				return "魔羯水瓶双鱼牡羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯".substr(m*2-(d<"102223444433".charAt(m-1)- -19)*2,2);
			},
			// 关注
			attention(){
				// 关联自己
				const pointer = this.Bmob.Pointer('_User')
				const poiID = pointer.set(this.myObjectId)
				// 关联被博主
				const pointer_bloger = this.Bmob.Pointer('_User')
				const poiID_bloger = pointer.set(this.objectId)
				// 写入数据库Attention表 写入收藏记录
				const query = Bmob.Query('Attention')
				query.set('fans',poiID)
				query.set('bloger',poiID_bloger)
				query.save().then(res => {
					console.log('res',res)
					let queryObject = {
						isAttention: true,
						fansCount: true
					}
					this.initDataCount(queryObject)
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
			},
			// 取消关注
			unAttention(){
				const query = Bmob.Query('Attention')
				query.equalTo("bloger", '===', this.objectId)
				query.equalTo("fans", '===', this.myObjectId)
				query.find().then(res => {
					console.log('res',res)
					const queryD = Bmob.Query('Attention')
					queryD.destroy(res[0].objectId).then(resD => {
						console.log('resD',resD)
						let queryObject = {
							isAttention: true,
							fansCount: true
						}
						this.initDataCount(queryObject)
					}).catch(errD => {
						console.log(errD)
					})
				})
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
	.attention{
		position: absolute;
		top:20upx;
		right:40upx;
		width: 120upx;
		height: 50upx;
		border-radius: 999upx;
		border:2upx solid gray;
		background-size: cover;
		background-position: center;
		line-height: 50upx;
		text-align: center
	}
	.attention-active{
		position: absolute;
		top:20upx;
		right:40upx;
		width: 120upx;
		height: 50upx;
		border-radius: 999upx;
		border:2upx solid white;
		line-height: 50upx;
		text-align: center;
		background: #9ed0ff;
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
