<template>
  <div>
    <el-form :model="formInline" label-width="120px" class="demo-form-inline">
      <el-form-item label="SPU 名称">
        <template>
          <span>xiaobozai</span>
        </template>
      </el-form-item>
      <el-form-item label="SKU 名称">
        <el-input v-model="formInline.user" placeholder="SKU 名称"></el-input>
      </el-form-item>
      <el-form-item label="价格">
        <el-input v-model="formInline.user" placeholder="SKU 价格"></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input v-model="formInline.user" placeholder="SKU 重量"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input type="textarea" placeholder="SKU 规格描述" rows="4"></el-input>
      </el-form-item>
      <!-- 嵌套form -->
      <el-form-item label="平台属性">
        <el-form inline label-width="80px">
          <el-form-item  v-for="(attr) in attrList" :key="attr.id"
              :label="attr.attrName">
            <el-select v-model="attr.attrValueName">
              <el-option v-for="(attrValue) in attr.attrValueList"
                :label="attrValue.valueName"
                :value="attrValue.id"
                :key="attrValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <!-- 嵌套销售form -->
      <el-form-item label="销售属性">
        <el-form inline label-width="80px">
          <el-form-item  v-for="(attrSale) in saleAttrList" :key="attrSale.id"
              :label="attrSale.saleAttrName">
            <el-select v-model="attrSale.saleAttrValueName">
              <el-option v-for="(value) in attrSale.spuSaleAttrValueList"
                :label="value.saleAttrValueName"
                :value="value.id"
                :key="value.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <!-- 图片表格 -->
      <el-form-item label="图片列表">
        <el-table border ref="multipleTable" :data="saleImageList" tooltip-effect="dark" style="width: 100%"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55">
          </el-table-column>
          <el-table-column label="图片" >
            <template slot-scope="{row}">
              <img :src="row.imgUrl" alt="" style="width:150px;height:150px:">
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称" >
          </el-table-column>
          <el-table-column label="操作" show-overflow-tooltip>
            <el-button type="primary">设为默认</el-button>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="save">保存</el-button>
        <el-button size="small" @click="back">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        category1Id:'',
        category2Id:'',
        category3Id:'',

        attrList:[], //保存属性的数组
        saleAttrList:[],//所有的销售属性
        saleImageList:[],//销售图片列表
        formInline: {
          user: '',
          region: '',
        },
      }
    },
    methods: {
      onSubmit() {
        console.log('submit!');
      },
      //由父组件调用的更新初始界面的请求
      initSkuDate(skuId,spuId){
        //  //保存三级Id,是用来请求属性接口使用的参数
        const {category1Id,category2Id,category3Id}=skuId;
        this.category1Id = category1Id;
        this.category2Id = category2Id;
        this.category3Id = category3Id;
        //根据三级id获取属性数据
        this.getAttrs();
        //根据spuId获取对应的sku的销售属性
        this.getSaleAttrList(spuId);
        //根据spuId获取对应的sku的销售图片
        this.getSaleImageList(spuId);
      },
      //获取平台属性
      async getAttrs(){
        const result = await this.$API.attr.getList(this.category1Id,this.category2Id,this.category3Id);
        this.attrList = result.data;
      },
      //获取所有的销售属性列表
      async getSaleAttrList(spuId){
        const result = await this.$API.sku.getSpuSaleAttrList(spuId);
        this.saleAttrList = result.data;
      },
      //获取所有的销售图片列表
      async getSaleImageList(spuId){
        const result = await this.$API.sku.getSpuImageList(spuId);
        this.saleImageList = result.data;
      },
      //点击返回退出此界面
      back(){
        //通知父组件隐藏次组件
        this.$emit('closeSku')
      },
      //保存修改的sku
      save(){
        
      },
      handleSelectionChange(){

      }
    }
  }

</script>
<style scoped>

</style>
