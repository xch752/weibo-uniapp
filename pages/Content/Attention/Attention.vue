<template>
	<view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				objectId:""	
			}
		},
		onLoad:function(option){
			this.objectId = option.objectId
			console.log(this.objectId)
			let k = 'O'
			const query = this.Bmob.Query('_User')
			query.equalTo("nickname","===", { "$regex": "" + k + ".*" });
			query.find().then(res=>{
				console.log(res)
			}).catch(err=>{
				console.log(err)
			})
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
