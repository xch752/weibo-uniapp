<template>
	<view class="full">
		<!-- <view class="header">
			<view class="flex">
				<view class="flex-twice flex justify-center align-center">
					<view class="text-black text-center text-df clear"
					@click="clearAll()"
					style="line-height: 50upx;">清空</view>
				</view>
				<view class="flex-treble">
					<view class="text-black text-lg text-bold text-center" 
					style="line-height: 80upx;">发微博</view>
				</view>
				<view class="flex-twice flex justify-center align-center">
					<view class="text-white text-center text-df submit" 
					@click="submitMSG()"
					style="line-height: 50upx;">发布</view>
				</view>
			</view>
		</view> -->
		<view class="flex justify-start" style="margin: 20upx 20upx 0 20upx;">
			<textarea maxlength="150"  
			class="text-lg padding"
			style="width: 100%;height: 350upx;background-color: #F4F5F9;"
			v-model="bodyValue"></textarea>
		</view>
		<view class="flex justify-end"><text class="tip">{{bodyValue.length}}/150</text></view>
		<view class="uploadimgList">
			<view class="flex justify-end align-start addImg"
			v-for="(item,index) in imgList" :key="index"
			:style="{'background':'#FFFFFF', 'background-image': 'url(' + item + ')','background-repeat':'no-repeat','background-size':'cover' }">
				<text class="xl text-red cuIcon-roundclosefill" 
				@click="deleteImg(index)"></text>
			</view>
			<view class="addImg flex justify-center align-center" 
			v-if="isAddTrue"
			@click="chooseImg()">
				<image src="../../static/img/tabbar_add.png" mode="aspectFit"></image>
			</view>
		</view>
		<view class="flex justify-center">
			<button class="cu-btn round bg-mauve lg" 
			style="width: 560upx;padding: 20upx 0 20upx 0;"
			@click="submitMSG()">发布</button>
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
				bodyValue:'',//body
				imgList:[],
				isAddTrue:true,
				objectId:'',
				token:'',
				imgListUrl:[]
			}
		},
		onLoad:function(){
			this.loadUserData();
			this.initQiniu();
		},
		onShow:function(){
			this.loadUserData()
		},
		methods:{
			loadUserData(){//获取用户信息
				var THAT = this;
				let current = Bmob.User.current();//获取登陆用户信息
				if(!current){
					uni.reLaunch({
						url:'../login/login'
					})
				}
				else{
					THAT.objectId = current.objectId;
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
			clearAll(){
				this.bodyValue='';
				this.imgList=[];
				this.isAddTrue=true;
				this.imgListUrl=[];
			},
			submitMSG(){
				var THAT = this;
				if((!this.bodyValue)&&(this.imgList.length==0)){
					uni.showModal({
						title:'提示',
						content:'发送内容不能为空',
						showCancel:false
					})
				}else{
					console.log(THAT.imgListUrl.join())
					const pointer = Bmob.Pointer('_User')
					const poiID = pointer.set(THAT.objectId)

					const query = Bmob.Query('MicroBlog');
					query.set("imgList",THAT.imgListUrl.join())
					query.set("content",THAT.bodyValue)
					query.set("creator",poiID)
					query.save().then(res => {
						uni.showModal({
							title:'提示',
							content:'发布成功',
							showCancel:false,
							complete: () => {
								THAT.clearAll();
							}
						})
						console.log(res)
					}).catch(err => {
						console.log(err)
					});
				}
			},
			chooseImg(){
				var THAT = this;
				uni.chooseImage({
					count:1,
					sizeType:['original','compressed'],//原图&压缩
					sourceType:['album','camera'],//相册&相机
					success: (res) => {
						if(THAT.imgList.length<9){
							THAT.imgList.push(res.tempFilePaths[0]);
							var filePath = res.tempFilePaths[0]
							qiniuUploader.upload(filePath, (res) => {
								THAT.imgListUrl.push(res.fileUrl);
								console.log('file url is: ' + res.fileUrl);
							}, (error) => {
								console.log('error: ' + error);
							}, {
							  region: 'SCN',
							  domain: 'http://pxcfst1g4.bkt.clouddn.com', // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
							  key: '', // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
							  // 以下方法三选一即可，优先级为：uptoken > uptokenURL > uptokenFunc
							  uptoken: THAT.token, // 由其他程序生成七牛 uptoken
							}, (res) => {
								// console.log(res);
								// if(res.progress!==100){
								// 	uni.showToast({
								// 		title:`上传中，已上传${res.progress}`,
								// 		icon:'loading'
								// 	})
								// }else if(res.progress===100){
								// 	uni.showToast({
								// 		title:`上传完成`,
								// 		icon:'success'
								// 	})
								// }
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
						if(THAT.imgList.length>=9){
							THAT.isAddTrue=false;
						}
						console.log(THAT.imgList)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			deleteImg(index){
				this.imgList.splice(index,1);
				this.imgListUrl.splice(index,1);
				if(this.imgList.length<9){
					this.isAddTrue=true;
				}else{
					this.isAddTrue=false;
				}
			}
		}
	}
</script>

<style scoped>
	.tip{
		float: right;
		padding: 20upx 20upx 0 0;
	}
	.header{
		height: 80upx;
		background: #FFFFFF;
		box-shadow:0px 2px 3px 0px rgba(10,0,32,0.1);
	}
	.clear{
		width: 150upx;
		height: 50upx;
		border-radius: 999upx;
		border: #EEEEEE solid 3upx;
	}
	.submit{
		background: linear-gradient(90deg, #6A2BF8 33%, #C90CFF 100%);
		width: 150upx;
		height: 50upx;
		border-radius: 999upx;
	}
	.uploadimgList{
		display: flex;
		width: 600upx;
		margin: 20upx 75upx 20upx 75upx;
		flex-flow:row wrap;
	}
	.uploadimgList .addImg{
		width: 170upx;
		height: 170upx;
		margin: 15upx;
		border: #EEEEEE solid 3upx;
	}
	.uploadimgList .addImg image{
		width: 50upx;
		height: 50upx;
		border: 0;
	}
	.uploadimgList image{
		width: 170upx;
		height: 170upx;
		margin: 15upx;
		border: #EEEEEE solid 3upx;
	}
	/*  #ifdef H5  */
	.cu-btn{
		position: fixed;
		bottom: 150upx;
		height: 80upx;
		width: 546upx;
	}
	/*  #endif  */
	
	/*  #ifdef MP-WEIXIN  */
	.cu-btn{
		position: fixed;
		bottom: 20upx;
		height: 80upx;
		width: 546upx;
	}
	/*  #endif  */
</style>
