<template>
	<view>
		<uni-nav-bar left-icon="back" @click-left="navBack" :status-bar="true" shadow="true" fixed="true" title="举报"></uni-nav-bar>
		
	</view>
</template>

<script>
	import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue" 
	export default {
		components: {uniNavBar},
		data() {
			return {
				microBlogId:''
				
			}
		},
		onLoad:function(option){
			this.microBlogId = option.microBlogId
			console.log(this.microBlogId)
		},
		methods: {
			// 返回
			navBack(){
				uni.navigateBack({
					delta: 1
				})
			},		
		}
	}
</script>

<style>

</style>
