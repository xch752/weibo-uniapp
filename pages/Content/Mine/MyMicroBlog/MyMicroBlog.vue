<template>
	<view class="full">
		<scroll-view scroll-y>
			<view class="cu-card dynamic solid-bottom margin-bottom-sm" :class="isCard?'no-card':''" v-for="(item,index) in blogList" :key="index">
				<view class="cu-item shadow">
					<view class="cu-list menu-avatar">
						<view class="cu-item">
							<image class="cu-avatar round lg" :src="item.creator.avatarUrl" mode="aspectFill" :lazy-load="isLazyLoad"></image>
							<view class="content flex-sub">
								<view>{{item.creator.nickname}}</view>
								<view class="text-gray text-sm flex justify-between">
									<view>{{item.updatedAt}}</view>
									<view>
										<text class="text-yellow cuIcon-writefill" 
										style="font-size: 40upx;margin-right: 20upx;" 
										@click="toModifyBlog(item.objectId)"></text>
										<text class="text-red cuIcon-deletefill " 
										style="font-size: 40upx;" 
										@click="deleteBlog(item.objectId)"></text>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view class="text-content margin-top-sm">
						{{item.content}}
					</view>
					<view class="grid flex-sub padding-lg" style="padding-top: 0;" :class="item.imgList.length!=1?'col-3 grid-square':'col-1'" v-if="item.imgList[0]==''?false:true">
						<view class="bg-img" :class="imgItem.length!=1?'':'only-img'"
						 v-for="(imgItem,imgIndex) in item.imgList" :key="imgIndex">
							<image :src="imgItem" mode="aspectFill" @click="previewImg(item.imgList,imgIndex)" :lazy-load="isLazyLoad"></image>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import Bmob from "hydrogen-js-sdk"
	export default {
		data() {
			return {
				isCard: true,
				blogList:[],
				objectId:'',
				isLazyLoad:true
			}
		},
		onLoad:function(option){
			this.objectId = option.objectId;
			this.initBlogList();
		},
		onShow() {
			this.initBlogList();
		},
		methods: {
			previewImg(list,index){
				uni.previewImage({
					urls:list,
					current:index,
					longPressActions:{
						itemList:['保存到相册'],
						success: function(data) {
						},
						fail: function(err) {
							console.log(err.errMsg);
						}
					}
				})
			},
			initBlogList(){
				var THAT = this;
				let query = Bmob.Query("MicroBlog");
				query.order("-updatedAt");
				query.equalTo("creator", '===', this.objectId);
				query.include('creator')
				query.find().then(res => {
					console.log(res);
					res.map((currentValue,index,arr)=>{
						if(res.imgList!=''){
							currentValue.imgList=currentValue.imgList.split(",");//分割imgList
						}
						let queryLike = Bmob.Query('MicroBlog')
						queryLike.field('like',currentValue.objectId)
						queryLike.relation('_User').then(result => {
						  console.log(index,result);
						  currentValue.likes = result;
						})
					})
					setTimeout(()=>{
						THAT.blogList=res;
					},0)	
				}).catch(err=>{
					console.log(err)
				})
			},
			deleteBlog(objectId){
				var THAT = this;
				uni.showModal({
					title:'提示',
					content:'确认删除?',
					success: (res) => {
						if(res.confirm==true){
							const query = Bmob.Query('MicroBlog');
							query.destroy(objectId).then(res => {
							  console.log(res)
							  THAT.initBlogList()
							}).catch(err => {
							  console.log(err)
							})
						}
					}
				})
			},
			toModifyBlog(objectId){
				uni.navigateTo({
					url:`ModifyBlog/ModifyBlog?objectId=${objectId}`,
					success:function(res){
						console.log(res);
					},
					fail:function(err){
						console.log(err);
					}
				})
			}
		}
	}
</script>

<style scoped>
	.full{
		background-color: #EEEEEE;
	}
</style>
