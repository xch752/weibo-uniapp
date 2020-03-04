<template>
	<view>
		Message
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		onLoad:function(){
			// var i = 0
			// setInterval(()=>{
			// 	console.log(this.PrefixInteger(i,11))
			// 	let params = {
			// 		username: this.PrefixInteger(i++,11),
			// 		password: '123456',
			// 		nickname: '用户'+this.randomWord(true,5,10),
			// 		// 默认头像
			// 		avatarUrl: 'https://static.mianyangjuan.com/defaultAvatar.jpg'
			// 	}
			// 	this.Bmob.User.register(params).then(res => {
			// 		console.log(res)	
			// 	})
			// },5000)
		},
		methods: {
			PrefixInteger(num, n) {
				return (Array(n).join(0) + num).slice(-n);
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

<style>

</style>
