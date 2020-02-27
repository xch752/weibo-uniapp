<template>
	<view class="full">
		<view class="header">
			<view class="flex margin-top-xl" style="margin-top: 60upx;">
				<view class="flex-twice"></view>
				<view class="flex-treble"><view class="text-white text-xl text-bold text-center">我的中心</view></view>
				<view class="flex-twice"></view>
			</view>
			<view class="flex margin-top-xl margin-left-xl align-center">
				<image class="avatar" :src="avatarUrl" mode="aspectFill" @click="modifyavatarUrl()"></image>
				<view class="margin-left-xl text-center text-white text-lg text-bold">{{nickname}}</view>
				<view class="margin-left-xl text-center text-white text-lg text-bold">ID:{{objectId}}</view>
			</view>
		</view>

		<view class="item flex padding justify-between align-center" @click="toMyMicroBlog()">
			<view class="flex justify-start">
				<image src="https://static.mianyangjuan.com//tripartite_Account@3x.png" mode="aspectFill" style="width: 46upx;height: 46upx;"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					我的微博
				</view>
			</view>
			<view><image src="https://static.mianyangjuan.com//right_arrow@3x.png" mode="aspectFit" style="width: 26upx;height: 26upx;"></image></view>
		</view>
		
		<!-- <view class="item flex padding justify-between align-center" @click="toEmail()">
			<view class="flex justify-start">
				<image src="https://static.mianyangjuan.com//feedback@3x.png" mode="aspectFill" style="width: 46upx;height: 46upx;"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					绑定邮箱
				</view>
			</view>
			<view><image src="https://static.mianyangjuan.com//right_arrow@3x.png" mode="aspectFit" style="width: 26upx;height: 26upx;"></image></view>
		</view> -->
		
		<!-- <view class="item flex padding justify-between align-center">
			<view class="flex justify-start">
				<image src="https://static.mianyangjuan.com//like@3x.png" mode="aspectFill" style="width: 46upx;height: 46upx;"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					我的收藏
				</view>
			</view>
			<view><image src="https://static.mianyangjuan.com//right_arrow@3x.png" mode="aspectFit" style="width: 26upx;height: 26upx;"></image></view>
		</view> -->
		
		<view class="item flex padding justify-between align-center" @click="toModifyNickname()">
			<view class="flex justify-start">
				<image src="https://static.mianyangjuan.com//personal_data@3x.png" mode="aspectFill" style="width: 46upx;height: 46upx;"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					修改昵称
				</view>
			</view>
			<view><image src="https://static.mianyangjuan.com//right_arrow@3x.png" mode="aspectFit" style="width: 26upx;height: 26upx;"></image></view>
		</view>
		
		<view class="item flex padding justify-between align-center" @click="logout()">
			<view class="flex justify-start">
				<image src="https://static.mianyangjuan.com//setting@3x.png" mode="aspectFill" style="width: 46upx;height: 46upx;"></image>
				<view class="text-black text-lg text-bold padding-left-lg">
					退出登陆
				</view>
			</view>
			<view><image src="https://static.mianyangjuan.com//right_arrow@3x.png" mode="aspectFit" style="width: 26upx;height: 26upx;"></image></view>
		</view>
		
		<view class="flex justify-center margin-top-xl" @click="toDownloadApp()">
			<image src="https://static.mianyangjuan.com//Promotion@3x.png" mode="aspectFit" style="width: 700upx;height: 178upx;"></image>
		</view>
	</view>
</template>

<script>
	import Bmob from "hydrogen-js-sdk"
	import {genUpToken} from '../../../util/qiniuToken.js'
	import qiniuUploader from '../../../util/qiniuUploader.js'
	export default{
		data(){
			return{
				avatarUrl:'',
				nickname:'',
				objectId:'',
				token:''
			}
		},
		onLoad(){
			this.loadUserData();
			this.initQiniu();
		},
		onShow() {
			this.loadUserData();
			this.initQiniu();
		},
		methods:{
			loadUserData(){//获取用户信息
				try {
					this.objectId = uni.getStorageSync('bmob').objectId
					if (!this.objectId) {
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
					else{
						const query = Bmob.Query('_User');//查询登陆用户具体信息
						query.get(this.objectId).then(res => {
							this.avatarUrl = res.avatarUrl;
							this.nickname = res.nickname;
							this.objectId = res.objectId;
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
			initQiniu(){
				var token;
				var policy = {};
				var bucketName = 'xch752';
				var AK ='T0c0qxTfHE07tX8QdKxtSaBAvaj6J5b_-HlQYTgf';
				var SK = 'bT-PoAdQusOcadeX3ELoFPRGDKJHr8d8kYBmBQ5X';
				var deadline = Math.round(new Date().getTime()/1000) + 3600;
				policy.scope = bucketName;
				policy.deadline = deadline;
				token=genUpToken(AK,SK,policy);
				this.token=token;
			},
			modifyavatarUrl(){//修改头像
				var THAT = this;
				uni.chooseImage({
				    count: 1, 
				    sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				    sourceType: ['album'], //从相册选择
				    success: function (res) {
						var _THAT = THAT;
				        console.log(JSON.stringify(res.tempFilePaths));
						var filePath = res.tempFilePaths[0]
						qiniuUploader.upload(filePath, (res) => {
							const query = Bmob.Query('_User');
							query.set('id', _THAT.objectId) //需要修改的objectId
							query.set('avatarUrl', res.fileUrl)
							query.save().then(res => {
								console.log(res)
								const query = Bmob.Query('_User')//查询登陆用户具体信息
								query.get(_THAT.objectId).then(res => {
									_THAT.avatarUrl = res.avatarUrl;
									_THAT.nickname = res.nickname;
									_THAT.objectId = res.objectId;
									try {
										uni.setStorageSync('bmob', res)
									} catch (e) {
										console.log(e)
									}
								}).catch(err => {
									console.log(err)
								})
							}).catch(err => {
								console.log(err)
							})
							console.log('file url is: ' + res.fileUrl);
						}, (error) => {
							console.log('error: ' + error);
						}, {
						  region: 'SCN',
						  domain: 'http://static.xch752.com', // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
						  key: `avatarUrl/${_THAT.objectId}/${_THAT.randomWord(true,20,20)}`, // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
						  // 以下方法三选一即可，优先级为：uptoken > uptokenURL > uptokenFunc
						  uptoken: THAT.token, // 由其他程序生成七牛 uptoken
						}, (res) => {
							// console.log(res);
							if(res.progress!==100){
								uni.showToast({
									title:`上传中，已上传${res.progress}`,
									icon:'loading'
								})
							}else if(res.progress===100){
								uni.showToast({
									title:`上传完成`,
									icon:'success'
								})
							}
							// console.log('上传进度', res.progress)
							// console.log('已经上传的数据长度', res.totalBytesSent)
							// console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
						}, () => {
						  // 取消上传
						}, () => {
						  // `before` 上传前执行的操作
						}, (err) => {
						  // `complete` 上传接受后执行的操作(无论成功还是失败都执行)
						});
				    }
				});
			},
			toMyMicroBlog(){
				var THAT = this;
				uni.navigateTo({
					url:`MyMicroBlog/MyMicroBlog?objectId=${THAT.objectId}`,
					success: (res) => {
						console.log(res)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			toEmail(){
				uni.navigateTo({
					url:'../Email/Email',
					success: (res) => {
						console.log(res)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			toModifyNickname(){//跳转修改用户昵称
				uni.navigateTo({
					url:`ModifyNickname/ModifyNickname?nickname=${this.nickname}&objectId=${this.objectId}`,
					success: (res) => {
						console.log(res)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			toDownloadApp(){//APP推广
				uni.showModal({
					title:'提示',
					content:'暂未开发',
					showCancel:false
				})
			},
			logout(){//登出
				uni.showModal({
					title:'提示',
					content:'确认退出',
					success: (res) => {
						if(res.confirm==true){
							Bmob.User.logout();
							uni.reLaunch({
								url:'../../Login/Login'
							})
							// 清空用户缓存
							try {
								uni.setStorageSync('bmob', '')
							} catch (e) {
								console.log(e)
							}
						}
					}
				})
			},
			// 随机KEY
			randomWord(randomFlag, min, max){
				var str = "",
					range = min,
					arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
			
				// 随机产生
				if(randomFlag){
					range = Math.round(Math.random() * (max-min)) + min;
				}
				for(var i=0; i<range; i++){
					var pos = Math.round(Math.random() * (arr.length-1));
					str += arr[pos];
				}
				return str;
			}
		}
	}
</script>

<style scoped>
	.full{
		position: fixed;
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		background-color: #FFFFFF; 
	}
	.suggestion{
		margin-left: 50upx;
		letter-spacing:2upx;
	}
	.header{
		height: 395upx;
		background: #6A2BF8;
	}
	.avatar{
		width: 162upx;
		height: 162upx;
		border-radius: 50%;
		border:4upx solid #FFFFFF;
	}
	.vipStatus{
		width:30upx;
		height: 30upx;
	}
	.cerStatus{
		width:30upx;
		height: 30upx;
	}
	.item{
		padding-top: 40upx;
		padding-right: 50upx;
		padding-left: 50upx;
		height: 9%;/*百分比占高,为了适配Pad,若不适配Pad,可以使用单位upx,更加美观*/
		width: 100%;
	}
</style>
