<template>
	<view class="full">
		<view class="flex justify-center" style="margin: 85upx 0 65upx 0;">
			<text class="text-gray text-df">请输入您的新邮箱</text>
		</view>
		<view class="flex justify-center text-center">
			<input class="solid-bottom" type="text" :placeholder="email" v-model="newEmail" maxlength="20" />
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
				email:'',
				newEmail:'',
				objectId:''
			}
		},
		onLoad: function (option) {
			this.email = option.email;
			this.objectId = option.objectId;
		},
		methods:{
			modifyNickname(){
				var THAT = this;
				let current = Bmob.User.current()
				if(!THAT.newEmail){
					uni.showToast({
						title:'请输入邮箱'
					})
				}else{
					
					Bmob.User.requestEmailVerify(THAT.newEmail).then(res => {
					  console.log(res)
					}).catch(err => {
					 console.log(err)
					});
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
