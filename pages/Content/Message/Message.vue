<template>
	<view>
		<uni-nav-bar :status-bar="true" shadow="true" fixed="true" title="消息"></uni-nav-bar>
		<view class="item flex padding justify-between align-center" @click="toLike()">
			<view class="flex justify-start">
				<image class="like" mode="aspectFill"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					赞
				</view>
			</view>
			<view class="arrow"></view>
		</view>
		<view class="item flex padding justify-between align-center" @click="toComment()">
			<view class="flex justify-start">
				<image class="comment" mode="aspectFill"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					评论
				</view>
			</view>
			<view class="arrow"></view>
		</view>
		<view class="item flex padding justify-between align-center" @click="toFans()">
			<view class="flex justify-start">
				<image class="attention" mode="aspectFill"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					新关注
				</view>
			</view>
			<view class="arrow"></view>
		</view>
		<view class="item flex padding justify-between align-center" @click="toCollect()">
			<view class="flex justify-start">
				<image class="collect" mode="aspectFill"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					收藏
				</view>
			</view>
			<view class="arrow"></view>
		</view>
	</view>
</template>

<script>
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue" 
	export default {
		components: {uniNavBar},
		data() {
			return {
				
			}
		},
		onLoad:function(){
			this.getSysInfo()
			this.loadUserData()
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
			toFans(){
				uni.navigateTo({
					url: `Fans/Fans?objectId=${this.objectId}`
				})
			},
			toCollect(){
				uni.navigateTo({
					url: `Collect/Collect?objectId=${this.objectId}`
				})
			},
			toLike(){
				uni.navigateTo({
					url: `Like/Like?objectId=${this.objectId}`
				})
			},
			toComment(){
				uni.navigateTo({
					url: `Comment/Comment?objectId=${this.objectId}`
				})
			}
		}
	}
</script>

<style scoped>
	.item{
		padding-top: 40upx;
		padding-right: 50upx;
		padding-left: 50upx;
		height: 9%;/*百分比占高,为了适配Pad,若不适配Pad,可以使用单位upx,更加美观*/
		width: 100%;
	}
	.like{
		content:url('../../../static/img/message_like.png');
		width:60upx;
		height:60upx;
	}
	.comment{
		content:url('../../../static/img/message_comment.png');
		width:60upx;
		height:60upx;
	}
	.attention{
		content:url('../../../static/img/message_attention.png');
		width:60upx;
		height:60upx;
	}
	.collect{
		content:url('../../../static/img/message_collect.png');
		width:60upx;
		height:60upx;
	}
	.text-bold{
		line-height: 60upx;
	}
	.arrow{
		background-image: url('../../../static/img/arrow_right.png');
		width: 30upx;
		height: 30upx;
		background-position: center center;
		background-repeat: no-repeat;
		background-size: cover;
		transform: translateX(-180deg);
	}
</style>
