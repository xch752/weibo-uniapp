<template>
	<view class="full">
		<view class="flex justify-center" style="margin: 85upx 0 65upx 0;">
			<text class="text-gray text-df">请输入您的新昵称</text>
		</view>
		<view class="flex justify-center text-center">
			<input class="solid-bottom" type="text" :placeholder="nickname" v-model="newNickname" maxlength="10" />
		</view>
		<view class="flex justify-center">
			<button class="cu-btn round bg-mauve lg padding-xl margin-top-xl" style="width: 560upx;padding: 20upx 0 20upx 0;" 
			@click="modifyNickname()">确定</button>
		</view>
	</view>
</template>

<script>
	import Bmob from "hydrogen-js-sdk"
	export default{
		data(){
			return {
				nickname:'',
				newNickname:'',
				objectId:''
			}
		},
		onLoad: function (option) {
			this.nickname = option.nickname;
			this.objectId = option.objectId;
		},
		methods:{
			modifyNickname(){
				var THAT = this;
				if(!THAT.newNickname){
					uni.showToast({
						title:'请输入新昵称'
					})
				}else{
					const query = Bmob.Query('_User');
					query.get(this.objectId).then(res => {
					  res.set('nickname',THAT.newNickname);
					  res.save();
					  uni.showModal({
					  	title:'提示',
						content:'修改成功',
						showCancel:false,
						success: (res) => {
							if(res.confirm==true){
								uni.navigateBack({
									delta:1
								})
							}
						}
					  })
					}).catch(err => {
					  console.log(err)
					})
				}
			}
		}
	}
</script>

<style scoped>
	input{
		font-size: 29upx;
	}
</style>
