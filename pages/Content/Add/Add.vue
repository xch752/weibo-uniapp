<template>
	<view class="full">
		<uni-nav-bar left-icon="back" @click-left="navBack" :status-bar="true" shadow="true" fixed="true" title="发微博"></uni-nav-bar>
		<!-- 内容 -->
		<view class="flex justify-start" style="margin: 20upx 30upx 0 30upx;">
			<textarea maxlength="150"
				placeholder="分享新鲜事~"
				class="text-xl"
				style="width: 100%;height:150upx;padding:0"
				v-model="bodyValue"></textarea>
		</view>
		<!-- 位置 -->
		<view class="flex padding-xl justify-between align-center" style="padding-top: 0;padding-bottom:0upx;">
			<view class="radius flex justify-center align-center" @click="chooseLocation">
				<text class="cuIcon-location" style="margin-right:30upx;font-size:50upx"></text>
				<text v-if="!geolocation.address" class="bg-gray round text-bold" style="padding: 5upx 30upx">你在哪里?</text>
				<text v-else class="bg-gray round text-bold" style="padding: 5upx 30upx">{{geolocation.name}}</text>
			</view>
			<view class="radius flex justify-center align-center" >
				<view style="line-height:90upx;margin-right:30upx">{{bodyValue.length}}/150</view>
			</view>
		</view>
		<!-- 标签 -->
		<view class="flex justify-start padding-xl" style="flex-flow:row wrap;padding-top: 5upx;padding-bottom:10upx;">
			<text class="cuIcon-tag" style="margin-right:30upx;font-size:50upx"></text>
			<text 
				v-for="(item,index) in tag" :key="index" 
				@click="deleteTag(index)"
				class="bg-gray light round text-bold" style="padding: 5upx 30upx;margin:10upx 30upx 0 0">{{item}}</text>
			<text
				v-if="tag.length < 5 ? true : false"
				@click="tagAddShow = true"
			  	class="bg-gray light round text-bold cuIcon-roundadd" style="line-height:50upx;padding: 5upx 30upx;margin:10upx 30upx 0 0"></text>
		</view>	
		<hFormAlert v-if="tagAddShow" maxlength="7" name="tagName" placeholder="请输入标签" @confirm="addTag" @cancel="tagAddShow = false"></hFormAlert>
		<!-- 分区 -->
		<view class="flex justify-start padding-xl" style="padding-top: 10upx;padding-bottom:10upx;">
			<text class="cuIcon-discover" style="margin-right:30upx;line-height:28upx;font-size:50upx"></text>
			<picker @change="bindPickerChange" :value="index" :range="partArray" range-key="partName">
				<view class="uni-input text-bold">{{partArray[index].partName}}</view>
			</picker>
		</view>
		<!-- 图片 -->
		<view class="uploadimgList">
			<view class="flex justify-end align-start addImg"
				v-for="(item,index) in imgList" :key="index"
				:style="{'background':'#FFFFFF', 'background-image': 'url(' + item + ')','background-repeat':'no-repeat','background-size':'cover' }">
				<text class="xl text-red cuIcon-roundclosefill" 
					@click="deleteImg(index)"></text>
			</view>
			<view class="addImg flex justify-center align-center" 
				v-if="imgList.length < 9 ? true : false"
				@click="chooseImg()">
				<image src="../../../static/img/add.png" mode="aspectFit"></image>
			</view>
		</view>
		<!-- 发布 -->
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
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue" 
	import hFormAlert from '@/components/h-form-alert/h-form-alert.vue'
	export default{
		components: {uniNavBar,hFormAlert},
		data(){
			return{
				// 用户ID
				objectId:'',
				// 七牛token
				token:'',
				// 内容
				bodyValue:'',//body
				// 图片
				imgList:[],
				// 图片链接
				imgListUrl:[],
				// 地理位置
				geolocation: {},
				// 视频
				videoSrc:'',
				// 视频链接
				videoSrcUrl:'',
				// 标签
				tag:[],
				// tagAdd弹窗
				tagAddShow: false,
				// 分区
				partArray: [],
				index: 0
			}
		},
		onLoad:function(){
			this.loadUserData()
			this.initQiniu()
			this.initPartArray()
		},
		methods:{
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
			// 获取分区信息
			initPartArray(){
				const query = Bmob.Query("Parts");
				query.find().then(res => {
					console.log(res)
					this.partArray = res
				})
			},
			// 新增标签
			addTag(res){
				console.log(res)
				if(res.tagName !== ''){
					this.tag.push(res.tagName)
					this.tagAddShow = false
				}
			},
			// picker
			bindPickerChange(e) {
				this.index = e.target.value
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
			// 发布
			submitMSG(){
				if(this.imgList.length==0){
					uni.showModal({
						title:'提示',
						content:'请至少选择一张图片',
						showCancel:false
					})
				}else{
					// 创建用户对象
					const pointer = Bmob.Pointer('_User')
					const poiID = pointer.set(this.objectId)
					const query = Bmob.Query('MicroBlog')
					query.set("imgList",this.imgListUrl.join())
					query.set("content",this.bodyValue)
					query.set("creator",poiID)
					query.set("Geolocation",this.geolocation)
					query.set("tag",this.tag.join())
					query.set("part",this.partArray[this.index].partIndex)
					query.save().then(res => {
						uni.showModal({
							title:'提示',
							content:'发布成功',
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
				}
			},
			// 选择图片
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
							  domain: 'http://static.xch752.com', // // bucket 域名，下载资源时用到。如果设置，会在 success callback 的 res 参数加上可以直接使用的 ImageURL 字段。否则需要自己拼接
							  key: `MicroBlog/${THAT.objectId}/${THAT.randomWord(true,20,20)}`, // [非必须]自定义文件 key。如果不设置，默认为使用微信小程序 API 的临时文件名
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
						console.log(THAT.imgList)
					},
					fail: (err) => {
						console.log(err)
					}
				})
			},
			// 删除图片
			deleteImg(index){
				this.imgList.splice(index,1)
				this.imgListUrl.splice(index,1)
			},
			// 删除TAG
			deleteTag(index){
				this.tag.splice(index,1)
			},
			// 选择位置
			chooseLocation () {
				uni.chooseLocation({
					success: (res) => {
						this.geolocation = res
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
		width: 710upx;
		margin: 20upx 30upx 20upx 30upx;
		flex-flow:row wrap;
	}
	.uploadimgList .addImg{
		width: 200upx;
		height: 200upx;
		margin: 15upx;
		border: #EEEEEE solid 3upx;
	}
	.uploadimgList .addImg image{
		width: 50upx;
		height: 50upx;
		border: 0;
	}
	.uploadimgList image{
		width: 200upx;
		height: 200upx;
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
	.bg-mauve{
		background-image: linear-gradient(105deg,#2a6dfe,#33a9f8);
		-moz-box-shadow:1px 1px 3px #888888; -webkit-box-shadow:1px 1px 3px #888888; box-shadow:1px 1px 3px #888888;
	}
</style>
