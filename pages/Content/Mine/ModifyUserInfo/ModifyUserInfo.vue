<template>
	<view>
		<uni-nav-bar left-icon="back" @click-left="navBack" :status-bar="true" shadow="true" fixed="true" title="编辑资料"></uni-nav-bar>
		<view class="header">
			<view @click="previewImg" class="avatar" :style="{'background-image':'url('+userInfo.avatarUrl+')'}"></view>
			<uni-icon @click.stop="modifyavatarUrl" class="camera" type="camera" size="40" color="#ffffff"></uni-icon>
		</view>
		<view class="item solid-bottom flex padding justify-between align-center">
			<view class="flex justify-start">
				<text class="text-gray">昵称</text>
				<view v-if="userInfo.nickname" class="text-black text-lg padding-left-lg" @click="nicknameShow = true">
					{{userInfo.nickname}}
				</view>
				<view v-else @click="nicknameShow = true" class="text-gray text-lg padding-left-lg">
					未设置
				</view>
			</view>
			<view><image :src="arrowImage" mode="aspectFit" class="arrow"></image></view>
		</view>
		<hFormAlert v-if="nicknameShow" maxlength="10" name="nickname" placeholder="请输入昵称" @confirm="modifyNickName" @cancel="nicknameShow = false"></hFormAlert>
		<view class="item solid-bottom flex padding justify-between align-center">
			<view class="flex justify-start">
				<text class="text-gray">简介</text>
				<view v-if="userInfo.introduction" class="text-black text-lg padding-left-lg" @click="introductionShow = true">
					{{userInfo.introduction}}
				</view>
				<view v-else @click="introductionShow = true" class="text-gray text-lg padding-left-lg">
					未设置
				</view>
			</view>
			<view><image :src="arrowImage" mode="aspectFit" class="arrow"></image></view>
		</view>
		<hFormAlert v-if="introductionShow" maxlength="20" name="introduction" placeholder="请输入个人介绍" @confirm="modifyIntroduction" @cancel="introductionShow = false"></hFormAlert>
		<view class="item solid-bottom flex padding justify-between align-center">
			<view class="flex justify-start">
				<text class="text-gray">性别</text>
				<view class="text-black text-lg padding-left-lg">
					<picker mode='selector' @change="sexPick" :value="sexIndex" :range="sexOption" range-key="name">
						<view class="picker" :class="userInfo.sex==''?'text-gray':'text-black'">
							{{userInfo.sex=='m'?'男':userInfo.sex=='f'?'女':userInfo.sex=='o'?'保密':'未设置'}}
						</view>
					</picker>
				</view>
			</view>
			<view><image :src="arrowImage" mode="aspectFit" class="arrow"></image></view>
		</view>
		<view class="item solid-bottom flex padding justify-between align-center">
			<view class="flex justify-start">
				<text class="text-gray">生日</text>
				<view class="text-black text-lg padding-left-lg">
					<picker mode="date" :value="userInfo.birthday" start="1950-09-01" :end="edndate" @change="bindDateChange">
						<view class="picker" :class="userInfo.birthday==''?'text-gray':'text-black'">
							{{userInfo.birthday==''?'未设置':userInfo.birthday}}
						</view>
					</picker>
				</view>
			</view>
			<view><image :src="arrowImage" mode="aspectFit" class="arrow"></image></view>
		</view>
		<view class="item solid-bottom flex padding justify-between align-center">
			<view class="flex justify-start">
				<text class="text-gray">城市</text>
				<view class="text-black text-lg padding-left-lg">
					<picker mode="region" @change="RegionChange" :value="userInfo.city">
						<view class="picker" :class="userInfo.city==''?'text-gray':'text-black'">
							{{userInfo.city==''?'未设置':userInfo.city}}
						</view>
					</picker>
				</view>
			</view>
			<view><image :src="arrowImage" mode="aspectFit" class="arrow"></image></view>
		</view>
	</view>
</template>

<script>
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue" 
	import uniIcon from "@/components/uni-icons/uni-icons.vue"
	import hFormAlert from '@/components/h-form-alert/h-form-alert.vue'
	import {genUpToken} from '../../../../util/qiniuToken.js'
	import qiniuUploader from '../../../../util/qiniuUploader.js'
	export default {
		components: {uniNavBar,uniIcon,hFormAlert},
		data() {
			return {
				objectId:'',
				userInfo:{
					avatarUrl:'http://static.xch752.com/mine_background.jpg', // 初始值
					birthday:'',
					sex:'',
					city:''
				},
				arrowImage:'https://static.mianyangjuan.com//right_arrow@3x.png',
				token:'',
				nicknameShow:false,
				introductionShow:false,
				edndate:'',
				sexOption:[{
					name:'男',
					value:'m'
				},{
					name:'女',
					value:'f'
				},{
					name:'保密',
					value:'o'
				}]
			}
		},
		onLoad:function(option){
			this.objectId = option.objectId
			this.loadUserData()
			this.initQiniu()
			this.getToday()
		},
		methods: {
			loadUserData(){//获取用户信息
				try {
					this.objectId = uni.getStorageSync('bmob').objectId
					this.userInfo = uni.getStorageSync('bmob')
					if (!this.objectId) {
						console.log('this.objectId',this.objectId)
						uni.reLaunch({
							url:'../../../Login/Login',
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
						const query = this.Bmob.Query('_User');//查询登陆用户具体信息
						query.get(this.objectId).then(res => {
							Object.assign(this.userInfo,res)
							console.log(this.userInfo)
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
						url:'../../../Login/Login',
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
			// 获取今日
			getToday(){
				var day = new Date()
				day.setTime(day.getTime())
				this.edndate = day.getFullYear()+"-" + (day.getMonth()+1) + "-" + day.getDate()
			},
			// 返回
			navBack(){
				uni.navigateBack({
					delta: 1
				})
			},
			previewImg(){
				uni.previewImage({
					urls:this.userInfo.avatarUrl.split(',')
				})
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
							const query = _THAT.Bmob.Query('_User');
							query.set('id', _THAT.objectId) //需要修改的objectId
							query.set('avatarUrl', res.fileUrl)
							query.save().then(res => {
								console.log(res)
								const query = _THAT.Bmob.Query('_User')//查询登陆用户具体信息
								query.get(_THAT.objectId).then(res => {
									Object.assign(_THAT.userInfo,res)
									uni.showToast({
										title:`重新加载`,
										icon:'success'
									})
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
								uni.showLoading({
									title:`上传中，已上传${res.progress}`,
									icon:'loading'
								})
							}else if(res.progress===100){
								uni.hideLoading()
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
						})
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
			},
			// 修改昵称
			modifyNickName(e){
				if(e.nickname !== ''){
					const query = this.Bmob.Query('_User')
					query.set('id', this.objectId) //需要修改的objectId
					query.set('nickname', e.nickname)
					query.save().then(res => {
						this.userInfo.nickname = e.nickname
						this.nicknameShow = false
					})					
				}
			},
			// 修改个人介绍
			modifyIntroduction(e){
				if(e.introduction !== ''){
					const query = this.Bmob.Query('_User')
					query.set('id', this.objectId) //需要修改的objectId
					query.set('introduction', e.introduction)
					query.save().then(res => {
						this.userInfo.introduction = e.introduction
						this.introductionShow = false
					})					
				}
			},
			// 修改生日
			bindDateChange(e) {
				this.userInfo.birthday = e.target.value
				const query = this.Bmob.Query('_User')
				query.set('id', this.objectId) //需要修改的objectId
				query.set('birthday', this.userInfo.birthday)
				query.save().then(res => {
					const query = this.Bmob.Query('_User')//查询登陆用户具体信息
						query.get(this.objectId).then(res => {
							Object.assign(this.userInfo,res)
					})
				})
			},
			// 修改性别
			sexPick(e) {
				switch(e.target.value){
					case '0':
						this.userInfo.sex = 'm'
						break
					case '1':
						this.userInfo.sex = 'f'
						break
					case '2':
						this.userInfo.sex = 'o'
						break
				}
				const query = this.Bmob.Query('_User')
				query.set('id', this.objectId) //需要修改的objectId
				query.set('sex', this.userInfo.sex)
				query.save().then(res => {
					const query = this.Bmob.Query('_User')//查询登陆用户具体信息
						query.get(this.objectId).then(res => {
							Object.assign(this.userInfo,res)
					})
				})
			},
			// 修改城市
			RegionChange(e) {
				this.userInfo.city = e.target.value.join(',')
				const query = this.Bmob.Query('_User')
				query.set('id', this.objectId) //需要修改的objectId
				query.set('city', this.userInfo.city)
				query.save().then(res => {
					const query = this.Bmob.Query('_User')//查询登陆用户具体信息
						query.get(this.objectId).then(res => {
							Object.assign(this.userInfo,res)
					})
				})
			}
		}
	}
</script>

<style scoped>
	.header{
		height: 300upx;
		background-image: url('http://static.xch752.com/mine_background.jpg');
		background-size: cover;
		background-position: center;
	}
	.avatar{
		position: absolute;
		top:200upx;
		left:300upx;
		width: 150upx;
		height: 150upx;
		border-radius: 50%;
		border:2upx solid #FFFFFF;
		background-size: cover;
		background-position: center;
		-moz-box-shadow:1px 1px 3px #888888; -webkit-box-shadow:1px 1px 3px #888888; box-shadow:1px 1px 3px #888888;
	}
	.camera{
		position: absolute;
		top:300upx;
		right:280upx;
		border-radius: 50%;
		background-size: cover;
		background-position: center;
	}
	.item{
		padding-top: 40upx;
		padding-right: 50upx;
		padding-left: 50upx;
		height: 100upx;/*百分比占高,为了适配Pad,若不适配Pad,可以使用单位upx,更加美观*/
		width: 100%;
	}
	.arrow{
		width: 26upx;
		height: 26upx;
	}
</style>
