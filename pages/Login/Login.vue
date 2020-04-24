<template>
	<view class="full">
		<!-- 头部 -->
		<view class="text-center bg-mauve" 
		style="height:448upx;background: url('http://static.xch752.com/undraw_explore_7ofa.png');background-repeat:no-repeat;background-size: 100% 100%;">
			<view>
				<image src="http://static.xch752.com/logo_whiteBG_256.png" mode="aspectFit" style="width: 150upx;height: 150upx;margin-top: 165upx;"></image>
			</view>
			<view class="flex  p-xs mb-sm flex-sub">
				<view class="flex-twice padding-top-lg radius padding-left-xl text-bold" @click="chooseLogin"><text id="loginType" class="text-white bg-mauve round" style="padding: 24upx 55upx">登录</text></view>
				<view class="flex-treble radius"></view>
				<view class="flex-twice padding-top-lg radius padding-right-xl text-bold" @click="chooseLogin"><text id="registerType" class="text-white bg-mauve round"  style="padding: 24upx 55upx">注册</text></view>
			</view>
			<view class="flex  p-xs mb-sm flex-sub">
				<view class="flex-twice radius padding-left-xl"><text v-if="typeCheck===0" class="lg text-white cuIcon-usefullfill"></text></view>
				<view class="flex-treble radius"></view>
				<view class="flex-twice radius padding-right-xl"><text v-if="typeCheck===1"  class="lg text-white cuIcon-usefullfill"></text></view>
			</view>
		</view>
		<!-- 登录 -->
		<view class="content" v-if="typeCheck===false">
			<view class="cu-form-group round" style="margin:30upx 0 30upx 0;">
				<view class="title text-mauve cuIcon-people text-xl"></view>
				<input placeholder="请输入手机号" name="input" v-model="logUserName" maxlength="11"></input>
			</view>
			<view class="cu-form-group solid-bottom round" style="margin: 30upx 0 30upx 0;">
				<view class="title text-mauve cuIcon-lock text-xl"></view>
				<input placeholder="请输入密码" password="true" name="input" v-model="logPassword"></input>
			</view>
			<button class="cu-btn round bg-mauve lg padding-xl margin-top-xl" style="width: 560upx;padding: 20upx 0 20upx 0;" @click="toHome">登录</button>
			<view class="padding-top-xl padding-bottom-sm" @click="toLoginByMobile"><text class="text-center text-grey">手机验证码登录</text></view>
		</view>
		<!-- 注册 -->
		<view class="content"  v-else>
			<view class="cu-form-group round" style="margin:30upx 0 30upx 0;">
				<view class="title text-mauve cuIcon-people text-xl"></view>
				<input placeholder="请输入手机号" type="number" name="input" v-model="registerUserName" maxlength="11"></input>
			</view>
			<view class="cu-form-group round" style="margin: 30upx 0 30upx 0;">
				<view class="title text-mauve cuIcon-attention text-xl"></view>
				<input placeholder="请输入验证码" name="input" type="number" v-model="verificationCodeValue" maxlength="6"></input>
				<button class='cu-btn bg-mauve btn-radius text-sm' 
				style="width: 180upx;" 
				@click="verificationCode"  
				:disabled="btnDisable"
				>{{cooldownTime}}{{second}}</button>
			</view>
			<view class="cu-form-group round" style="margin: 30upx 0 30upx 0;">
				<view class="title text-mauve cuIcon-lock text-xl"></view>
				<input placeholder="请输入密码" password="true" name="input" v-model="registerPassword"></input>
			</view>
			<view class="cu-form-group solid-bottom round" style="margin: 30upx 0 30upx 0;">
				<view class="title text-mauve cuIcon-lock text-xl"></view>
				<input placeholder="请再次输入密码" password="true" name="input" v-model="registerPasswordSecond"></input>
			</view>
			<button class="cu-btn round bg-mauve lg padding-xl margin-top-xl" style="width: 560upx;padding: 20upx 0 20upx 0;" @click="Register">注册</button>
		</view>	
			<!-- <view style="z-index:-9999;position:fixed;bottom:0;width:750upx;height:446upx;background: url('../../static/img/undraw_donut_love_kau1.png');background-repeat:no-repeat;background-size: 100% 100%;opacity: 0.90;"></view> -->
	</view>
</template>

<script>
	import Bmob from "hydrogen-js-sdk"
	export default {
		data() {
			return {
				typeCheck:false,//0登录 1注册
				cooldownTime:'获取验证码',
				btnDisable:false,
				second:'',
				logUserName:'',//登陆用户名
				logPassword:'',//登陆密码
				registerUserName:'',//注册用户名
				registerPassword:'',//注册密码
				registerPasswordSecond:'',//注册密码重复
				verificationCodeValue:''//验证码
			}
		},
		onLoad() {
			//取本地账号密码
			this.getLoginStorage()
			// let geolocation = {
			// 	address: '丽水',
			// 	longitude: '111.1',
			// 	latitude: '222.2'
			// }
			// const query = Bmob.Query('MicroBlog');
			// query.get('674341e16c').then(res => {
			// 	console.log(res)
			// 	res.set('Geolocation', geolocation)
			// 	res.save()
			// }).catch(err => {
			// 	console.log(err)
			// })
		},
		onShow() {

		},
		methods: {
			// 登录注册切换
			chooseLogin(){
				this.typeCheck = !this.typeCheck
			},
			// 取本地缓存的登陆账号密码
			getLoginStorage(){
				try {
					this.logUserName = uni.getStorageSync('UserName')
					this.logPassword = uni.getStorageSync('Password')
					if(this.logUserName && this.logPassword) {
						this.toHome()
					}else{
						console.log('no')
					}
				} catch (e) {
					// error
					console.log(e)
				}
			},
			// 账号密码登录
			toHome(){
				var THAT = this
				if(!THAT.logUserName || !THAT.logPassword){
					uni.showToast({
						title:'请输入账号密码',
						icon:'none',
						complete:()=>{
							setTimeout(()=>{
							uni.hideToast()
							},2000)
						}
					})
				}else{
					uni.showLoading({
						title: '登录中'
					})
					Bmob.User.login(THAT.logUserName,THAT.logPassword).then(res => {
						uni.hideLoading()
						console.log(res)
						
						if(res.status === 'freeze'){
							uni.showModal({
								title:'提示',
								content:'该账号已被冻结'
							})
							return
						}
						// 跳转主页
						uni.setStorage({
							key: 'bmob',
							data: res,
							success: function () {
								uni.reLaunch({
									url:'../Content/Home/Home'
								})
							}
						})
						try {
							uni.setStorageSync('UserName', THAT.logUserName)
							uni.setStorageSync('Password', THAT.logPassword)
							uni.setStorageSync('bmob', res)

						} catch (e) {
							console.log(e)
						}
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
				}			
			},
			// 手机验证码登录
			toLoginByMobile(){
				uni.navigateTo({
					url: 'LoginByMobile/LoginByMobile'
				})
			},
			// 发送验证码函数
			verificationCode(){
				var THAT = this
				// 手机号正则判断
				if((/^1[3456789]\d{9}$/.test(this.registerUserName))){
					const query = Bmob.Query("_User")
					query.equalTo("username","===", this.registerUserName)
					query.find().then(res => {
						// 手机号已注册
						if (res.length >= 1) {
							uni.showToast({
								title:'手机号已注册',
								icon:'none',
								complete:()=>{
									setTimeout(()=>{
									uni.hideToast()
									},2000)
								}
							})
						}
						// 手机号未注册
						else { 
							// 发送验证码
							let params = {
								mobilePhoneNumber: this.registerUserName
							}
							Bmob.requestSmsCode(params).then(function (response) {
								console.log(response)
								uni.showToast({
									title:"验证码已发送"
								})
							})
							.catch(function (error) {
								console.log(error)
							})
							//倒计时函数
							this.second = 's'
							this.cooldownTime = 60
							this.btnDisable = true
							var verTime = setInterval(function(){
								THAT.cooldownTime = THAT.cooldownTime - 1
								if(THAT.cooldownTime === -1){
									THAT.btnDisable = false
									THAT.cooldownTime='获取验证码'
									THAT.second=''
									clearInterval(verTime)
								}
							},1000)
						}
					})
				}
				// 手机号正则判断失败
				else{
					uni.showToast({
						title:"请输入正确的手机号",
						icon:"none"
					})
				}
			},
			// 注册
			Register(){
				var THAT = this
				if(!this.registerUserName){
					uni.showToast({
						title:"请输入手机号",
						icon:"none",
						complete:()=>{
							setTimeout(()=>{
							uni.hideToast()
							},2000)
						}
					})
				}
				else if(!(this.registerPassword===this.registerPasswordSecond)){
					uni.showToast({
						title:"两次输入密码不一致",
						icon:"none",
						complete:()=>{
							setTimeout(()=>{
							uni.hideToast()
							},2000)
						}
					})
				}
				// 验证码验证
				else{
					// 需要number类型
					let smsCode = this.verificationCodeValue
					let data = {
						mobilePhoneNumber: this.registerUserName
					}
					this.Bmob.verifySmsCode(smsCode,data).then(res => {
						// 验证成功
						// 注册
						let params = {
							username: this.registerUserName,
							password: this.registerPassword,
							mobilePhoneNumber: this.registerUserName,
							nickname: '用户'+this.randomWord(true,5,10),
							// 默认头像
							avatarUrl: 'https://static.mianyangjuan.com/defaultAvatar.jpg'
						}
						Bmob.User.register(params).then(res => {
							// 注册成功
							uni.showToast({
								title:'注册成功',
								icon:'success',
								complete:()=>{
									setTimeout(()=>{
									uni.hideToast()
									},2000)
								}
							})
							this.logUserName = this.registerUserName
							this.logPassword = this.registerPassword
							this.toHome()
						}).catch(err => {
							// 注册失败
							uni.showToast({
								title:err,
								icon:'none',
								complete:()=>{
									setTimeout(()=>{
									uni.hideToast()
									},2000)
								}
							})
						})
					}).catch(err => {
						// 验证失败
						uni.showToast({
							title: err.error,
							icon: 'none',
							complete:()=>{
								setTimeout(()=>{
								uni.hideToast()
								},2000)
							}
						})
					})
				}
			},
			// 随机姓名
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
	.btn-radius{
		border-radius: 50upx;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.bg-mauve{
		background-image: linear-gradient(105deg,#2a6dfe,#33a9f8);
	}
	.round{
		-moz-box-shadow:1px 1px 3px #888888; -webkit-box-shadow:1px 1px 3px #888888; box-shadow:1px 1px 3px #888888;
	}
	.text-mauve{
		font-weight: bold;
	}
</style>
