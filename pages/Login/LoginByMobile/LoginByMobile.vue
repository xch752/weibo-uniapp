<template>
	<view>
		<view class="content">
			<view>
				<image src="http://static.xch752.com/logo_whiteBG_256.png" mode="aspectFit" style="width: 200upx;height: 200upx;margin:-200upx 0 50upx 0"></image>
			</view>
			<view class="cu-form-group round" style="margin:0 0 0 0;">
				<view class="title text-mauve cuIcon-people text-xl"></view>
				<input placeholder="请输入手机号" name="input" v-model="logUserName" maxlength="11"></input>
			</view>
			<view class="cu-form-group round" style="margin: 30upx 0 0 0;">
				<view class="title text-mauve cuIcon-attention text-xl"></view>
				<input placeholder="请输入验证码" name="input" type="number" v-model="verificationCodeValue" maxlength="6"></input>
				<button class='cu-btn bg-mauve btn-radius text-sm' 
				style="width: 180upx;border-radius:999upx" 
				@click="verificationCode"  
				:disabled="btnDisable">{{cooldownTime}}{{second}}</button>
			</view>
			<button class="cu-btn round lg margin-xl bg-white cuIcon-right text-mauve" style="width: 80upx;height:80upx;padding: 20upx 0 20upx 0;" @click="LoginByMobile"></button>
			<view style="position:fixed;bottom:0;width:100%;height:400upx;background: url('http://static.xch752.com/undraw_snow_games_ohkc.png');background-repeat:no-repeat;background-size: 100% 100%;opacity: 0.90;"></view>
		</view>
		<!-- <view style="position:fixed;bottom:0;height:448upx;background: url('../../../static/img/undraw_donut_love_kau1.svg');background-repeat:no-repeat;background-size: 100% 100%;opacity: 0.90;"></view> -->
	</view>
</template>

<script>
	import Bmob from "hydrogen-js-sdk"
	export default {
		data() {
			return {
				cooldownTime:'获取验证码',
				btnDisable:false,
				second:'',
				logUserName:'',//用户名
				verificationCodeValue:''//验证码
			}
		},
		onLoad(){

		},
		methods: {
			// 发送验证码函数
			verificationCode(){
				var THAT = this
				// 手机号正则判断
				if((/^1[3456789]\d{9}$/.test(this.logUserName))){
					const query = Bmob.Query("_User")
					query.equalTo("username","==", this.logUserName)
					query.find().then(res => {
						// 发送验证码
						let params = {
							mobilePhoneNumber: this.logUserName
						}
						Bmob.requestSmsCode(params).then((response)=> {
							console.log(response)
							uni.showToast({
								title:`验证码已发送${response.smsId}`
							})
						})
						.catch((error) => {
							console.log(error)
							uni.showToast({
								title:error.error,
								icon:'none',
								complete:()=>{
									setTimeout(()=>{
									uni.hideToast()
									},2000)
								}
							})
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
			// 登录
			LoginByMobile(){
				var THAT = this
				if(!this.logUserName){
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
				else if(!this.verificationCodeValue){
					uni.showToast({
						title:"请输入验证码",
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
					uni.showLoading({
						title: '登录中'
					})
					let phone = parseInt(this.logUserName)
					let smsCode = parseInt(this.verificationCodeValue)
					Bmob.User.signOrLoginByMobilePhone(phone,smsCode).then(res => {
						console.log(res)
						// 跳转主页
						uni.reLaunch({
							 url: '../../Content/Home/Home'
						})
						uni.hideLoading()
						// 更新用户缓存
						// 更新用户缓存函数失效
						// console.log(res.objectId,typeof res.objectId)
						// Bmob.User.updateStorage(res.objectId).then(res_update => {
						// 	console.log('res_update',res_update)
						// }).catch(err_update => {
						// 	console.log('err_update',err_update)
						// })
						// 自定义用户缓存 同步
						try {
							uni.setStorageSync('bmob', res)
						} catch (e) {
							console.log(e)
						}
					}).catch(err => {
						uni.hideLoading()
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
			}
		}
	}
</script>

<style scoped>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: white;
		position: absolute;
		bottom: 0;
		top: 0;
		left: 0;
		right: 0;
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
