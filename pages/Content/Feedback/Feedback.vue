<template>
	<view>
		<view class="back-oval">
			<view class="bg-img"></view>
			<view class="setting">
				<image style="width:40upx;height:40upx" src="../../../static/img/back.png" mode="aspectFill" @click="navBack"></image>
			</view>
		</view>
		<view class="content-box">
			<view>
				<textarea maxlength="150"
				placeholder="您的意见和建议，是对我们最大的支持"
				style="width: 100%;height:400upx;padding:40upx"
				v-model="bodyValue"></textarea>
			</view>
			<view class="uploadimgList">
				<view class="flex justify-end align-start addImg"
					v-for="(item,index) in imgList" :key="index"
					:style="{'background-image': 'url(' + item + ')'}">
					<text class="xl text-red cuIcon-roundclosefill" 
						@click="deleteImg(index)"></text>
				</view>
				<view class="addImg flex justify-center align-center" 
					v-if="imgList.length < 3 ? true : false"
					@click="chooseImg()">
					<image src="../../../static/img/add.png" mode="aspectFit"></image>
				</view>
			</view>
		</view>
		<button class="cu-btn round bg-mauve lg" @click="submitMSG">提交</button>
	</view>
</template>

<script>
	import Bmob from "hydrogen-js-sdk"	
	import {genUpToken} from '../../../util/qiniuToken.js'
	import qiniuUploader from '../../../util/qiniuUploader.js'
	export default {
		data() {
			return {
				objectId:'',
				// 图片
				imgList:[],
				// 图片链接
				imgListUrl:[],
				// 七牛token
				token:'',
				// 内容
				bodyValue:''
			}
		},
		onLoad:function(option){
			this.initQiniu()
			this.loadUserData()
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
			// 返回
			navBack(){
				uni.navigateBack({
					delta: 1
				})
			},
			// 七牛token初始化
			initQiniu(){
				var token;
				var policy = {};
				var bucketName = 'xch752'
				var AK ='T0c0qxTfHE07tX8QdKxtSaBAvaj6J5b_-HlQYTgf'
				var SK = 'bT-PoAdQusOcadeX3ELoFPRGDKJHr8d8kYBmBQ5X'
				var deadline = Math.round(new Date().getTime()/1000) + 3600
				policy.scope = bucketName
				policy.deadline = deadline
				token=genUpToken(AK,SK,policy)
				this.token=token;
			},
			// 选择图片
			chooseImg(){
				uni.chooseImage({
					count:3,
					sizeType:['original','compressed'],//原图&压缩
					sourceType:['album','camera'],//相册&相机
					success: (res) => {
						console.log(this.imgList.length + res.tempFilePaths.length)
						if(this.imgList.length + res.tempFilePaths.length <= 3){
							this.imgList = this.imgList.concat(res.tempFilePaths)
						}else{
							uni.showToast({
								title: '选择图片大于3张',
								duration: 2000,
								icon:'none'
							})
						}
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			// 删除图片
			deleteImg(index){
				this.imgList.splice(index,1)
			},
			// 发布
			submitMSG(){
				if(!this.bodyValue){
					uni.showToast({
						title: '请输入内容',
						duration: 2000,
						icon: 'none'
					})
					return
				}
				uni.showLoading({
					title: '上传中'
				})
				var p = new Array()
				for(let index in this.imgList){
					p[index] = new Promise(resolve =>{
						qiniuUploader.upload(this.imgList[index], (res) => {
							this.imgListUrl.push(res.fileUrl)
							console.log('file url is: ' + res.fileUrl)
							resolve(this.imgListUrl)
						}, (error) => {
							uni.showToast({
								title: error,
								duration: 2000
							})
						}, {
							region: 'SCN',
							domain: 'http://static.xch752.com', // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
							key: `Feedback/${this.objectId}/${this.randomWord(true,20,20)}`, // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
							// 以下方法三选一即可，优先级为：uptoken > uptokenURL > uptokenFunc
							uptoken: this.token, // 由其他程序生成七牛 uptoken
						}, (res) => {

						}, () => {
							// 取消上传
						}, () => {
							// `before` 上传前执行的操作
						}, (err) => {
							// `complete` 上传接受后执行的操作(无论成功还是失败都执行)
						})
					})
				}
				Promise.all(p).then(res=>{
					console.log('this.imgListUrl',this.imgListUrl)
					//	创建用户对象
					const pointer = Bmob.Pointer('_User')
					const poiID = pointer.set(this.objectId)

					const query = Bmob.Query('Feedback')
					query.set("imgList",this.imgListUrl.join())
					query.set("content",this.bodyValue)
					query.set("feedbackUser",poiID)
					query.save().then(res => {
						uni.hideLoading()
						uni.showModal({
							title:'成功',
							content:'感谢您的反馈~',
							showCancel:false,
							complete: () => {
								uni.navigateBack({
									delta: 1
								})
							}
						})
						console.log(res)
					}).catch(err => {
						console.log(err)
					})
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
	page{
		background:#eeeeee;
	}
	.back-oval{
		position: fixed;
		top: 0;
		background-image: linear-gradient(180deg,#2a6dfe,#33a9f8);
		background-position: center center;
		background-repeat: no-repeat;
		background-size: cover;
		width: 1000upx;
		height: 350upx;
		border-radius: 50% / 0 0 70% 70%;
		left: -125upx;
	}
	.bg-img{
		position: fixed;
		top: 50upx;
		left: 125upx;
		background-image:url('http://static.xch752.com/undraw_select_option_y75i.png');
		width: 500upx;
		height: 350upx;
	}
	.setting{
		position: fixed;
		top:50upx;
		left:50upx;
		width: 40upx;
		height: 40upx;
	}
	.content-box{
		position: absolute;
		top: 250upx;
		width: 660upx;
		height: 880upx;
		-moz-box-shadow:-4px 4px 8px #999999; -webkit-box-shadow:-4px 4px 8px #999999; box-shadow:-4px 4px 8px #999999;
		left: 50upx;
		border-radius: 20upx;
		background:#ffffff;
	}
	.uploadimgList{
		position: absolute;
		bottom: 0;
		display: flex;
		width: 660upx;
		/* margin: 20upx 20upx 20upx 20upx; */
		flex-flow:row wrap;
	}
	.uploadimgList .addImg{
		width: 180upx;
		height: 180upx;
		margin: 20upx;
		border: #EEEEEE solid 3upx;
		border-radius: 20upx;
		background-position: center center;
		background-repeat: no-repeat;
		background-size: cover;
	}
	.uploadimgList .addImg image{
		width: 50upx;
		height: 50upx;
		border: 0;
		border-radius: 20upx;
		background-position: center center;
		background-repeat: no-repeat;
		background-size: cover;
	}
	.uploadimgList image{
		width: 200upx;
		height: 200upx;
		margin: 15upx;
		border: #EEEEEE solid 3upx;
		border-radius: 20upx;
	}
	.cu-btn{
		position: fixed;
		width: 560upx;
		bottom:50upx;
		left:95upx;
		background-image: linear-gradient(105deg,#2a6dfe,#33a9f8);
		-moz-box-shadow:-4px 4px 8px #999999; -webkit-box-shadow:-4px 4px 8px #999999; box-shadow:-4px 4px 8px #999999;
	}
</style>
