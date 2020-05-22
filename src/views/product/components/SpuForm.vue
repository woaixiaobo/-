<template>
  <el-form label-width="100px" v-show="visible" :model="spuInfo">
    <el-form-item label="SPU名称" >
      <el-input v-model="spuInfo.spuName" type="text" placeholder="SPU名称"></el-input>
    </el-form-item>
    <el-form-item label="品牌">
      <el-select placeholder="请选择品牌"  v-model="trademarkList1">
        <el-option v-for="(tm) in trademarkList" :key="tm.id" :label="tm.tmName" :value="tm.tmName"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SUP图片">
      <el-upload
        action="https://jsonplaceholder.typicode.com/posts/"
        list-type="picture-card"
        :file-list="dialogImageUrl"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove">
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-select placeholder="请选择" v-model="salAttrValue">
        <el-option v-for="(item, index) in saleAttrList" :key="index" :label="item.name" :value="item.name"></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>
      <el-table
        style="margin-top: 20px"
        border :data="spuInfo.spuSaleAttrList"
      >
        <!-- 序号列 -->
        <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center">
        </el-table-column>

        <el-table-column label="属性名" >
          <template slot-scope="{row}">
            <span>{{row.saleAttrName}}</span>
          </template>
          </el-table-column>
            <el-table-column label="属性值名称">
              <template slot-scope="{row}">
              <el-tag style="margin: 2px" type="info" v-for="(value) in row.spuSaleAttrValueList" :key="value.id">
                {{value.saleAttrValueName}}</el-tag>
            </template>
            </el-table-column>
          <el-table-column prop="address" label="操作">
              <template>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button @click="back">返回</el-button>
      </el-form-item>
  </el-form>
</template>

<script>
export default {
  props:{
    visible:Boolean,
  },
  data() {
    return {
      dialogImageUrl: [],
      dialogVisible: false,
      spuId:'',//当前更新的spuinfo的id,因为好多地方都用到了
      spuInfo:{},//保存spu详细信息的对象
      spuImageList:[],//spu的图片列表
      trademarkList:[],//品牌列表
      trademarkList1:'',
      saleAttrList:[],//销售属性列表
      salAttrValue:'',
    }
  },
  methods: {
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePictureCardPreview(file) {
        // this.dialogImageUrl.push(file);
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      back(){
        //分发自定义事件,让当前dialog页面关闭
        this.$emit('update:visible',false);
      },
      //由父组件调用的
      initLoadUpdateDate(spuId){
        //保存spuId
        this.spuId = spuId
        //根据spu的id获取spu的详细信息,不包括图片
        this.getSpuInfo();
        //根据id获取列表图片
        this.getSpuImageList();
        //获取所有品牌的列表
        this.getTrademarkList();
        //获取所有销售属性(id/name)列表
        this.getSaleAttrList()
      },
      //根据spu的id获取spu的详细信息,不包括图片\
      async getSpuInfo(){
        const result = await this.$API.spu.get(this.spuId);
        this.spuInfo = result.data;
      },
      //根据id获取列表图片,sku当中的api
      async getSpuImageList(){
        const result = await this.$API.sku.getSpuImageList(this.spuId);
        this.spuImageList = result.data
        result.data.forEach(item=>{
          const url = {
            url:item.imgUrl
          }
          this.dialogImageUrl.push(url);
          // this.handlePictureCardPreview(url)
        })
      },
      //获取所有品牌的列表
      async getTrademarkList(){
        const result = await this.$API.trademark.gitTrademarkList();
        this.trademarkList = result.data
      },
      //获取所有的销售属性列表
      async getSaleAttrList(){
        const result = await this.$API.spu.getSaleList();
        this.saleAttrList = result.data;
      }
  },
}
</script>
<style scoped>

</style>
