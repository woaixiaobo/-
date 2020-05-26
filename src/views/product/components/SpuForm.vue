<template>
  <el-form label-width="100px" v-show="visible" class="demo-form-inline">
    <el-form-item label="SPU名称">
      <el-input v-model="spuInfo.spuName" placeholder="SPU名称"></el-input>
    </el-form-item>
    <el-form-item label="品牌">
      <el-select v-model="tradeMarkList.region" placeholder="请选择品牌">
        <el-option
          v-for="(attr) in tradeMarkList" :key="attr.id"
          :label="attr.tmName" :value="attr.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述">
      <el-input v-model="spuInfo.description" type="textarea" rows="4" placeholder="SPU描述"></el-input>
    </el-form-item>
    <el-form-item label="SPU图片">
      <el-upload
      :file-list="spuImageList"
      action="/dev-api/admin/product/fileUpload"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-success="handleSuccess"
      :on-remove="handleRemove">
      <i class="el-icon-plus"></i>
    </el-upload>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-select v-model="saleAttrName" :placeholder="SaleAttrList.length?`还剩${SaleAttrList.length}个可选`:'没有啦'">
        <!-- 返回的是所有销售属性当中的某个属性的id和名称 -->
        <el-option
          v-for="(saleAttr) in SaleAttrList" :key="saleAttr.id"
          :label="saleAttr.name" :value="saleAttr.id + '-' + saleAttr.name"></el-option>
      </el-select>
      <el-button type="primary" :disabled="!SaleAttrList.length" icon="el-icon-plus" @click="addSaleAttr">添加销售属性</el-button>
    </el-form-item>
    <el-form-item>
      <el-table :data="spuInfo.spuSaleAttrList" border style="width: 100%">
        <el-table-column type="index" width="80" label="序号">
        </el-table-column>
        <el-table-column prop="saleAttrName" label="属性名" >
        </el-table-column>
        <el-table-column label="属性值名称列表" >
          <template slot-scope="{row}">
            <el-tag
              style="margin-right: 5px"
              v-for=" (value,index) in row.spuSaleAttrValueList"
              :key="value.id"
              closable
              :disable-transitions="false"
              @close="row.spuSaleAttrValueList.splice(index,1)"
              >
              {{value.saleAttrValueName}}
            </el-tag>
            <!-- 收集输入的属性添加到 row 当中，名称为 saleAttrValueName-->
              <el-input
                v-model="row.saleAttrValueName"
                style="width:80px;height:50px"
                v-if="row.edit"
                ref="inp"
                @blur="handelBlur(row)"
                @keyup.enter.native="handelBlur(row)"
                ></el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ 添加</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作">
          <template slot-scope="{row,$index}">
            <el-button type="danger" icon="el-icon-delete" size="mini"
            @click="spuInfo.spuSaleAttrList.splice($index,1)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="back">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  export default {
    props: {
      visible: Boolean,
    },
    data() {
      return {
        tradeMarkList:[],//品牌列表
        spuId:null, //supid
        spuInfo:{
          spuName:'',//spu名称
          description:'',//spu描述
          spuSaleAttrList:[],//以添加的销售属性
        },//spu详细信息
        spuImageList:[],//spu图片
        spuSaleAttrList:[],//销售属性列表、
        saleAttrName:'',//收集销售属性
        dialogImageUrl: '',
        dialogVisible: false,
        tableData: []
      }
    },
    methods: {
      initLoadUpdateDate(spuId){
        //保存spuId
        this.spuId = spuId;
        //获取spu详细信息
        this.getSpuInfo();
        //获取spu图片信息（请求再sku当中）
        this.getSpuImageList();
        //获取所有品牌的数据
        this.gettradeMark();
        //获取销售属性
        this.getSaleAttrList();
      },
      initLoadDate(category3Id){
        // 将category3Id保存到spuInfo中，因为保存的时候要使用
        this.spuInfo.category3Id = category3Id
        // 获取品牌列表
        this.gettradeMark()
        // 获取销售属性
        this.getSaleAttrList()
      },
      //获取spu详细信息
      async getSpuInfo(){
        const result = await this.$API.spu.get(this.spuId);
        this.spuInfo = result.data;
      },
      //获取图片
      async getSpuImageList(){
        const result = await this.$API.sku.getSpuImageList(this.spuId);
        const spuImageList = result.data;
        //要使用upload的默认图片显示就要按照upload的数据结构要求来，下面之间再数组当中添加它所需要的
        spuImageList.forEach(item=>{
          item.name=item.imgName;
          item.url=item.imgUrl;
        })
        this.spuImageList = spuImageList;
      },
      //获取所有品牌的数据
      async gettradeMark(){
        const result = await this.$API.trademark.gitTrademarkList();
        this.tradeMarkList = result.data;
      },
      //获取所有的销售属性
      async getSaleAttrList(){
        const result = await this.$API.spu.getSaleList();
        this.spuSaleAttrList = result.data;
      },
      //点击返回显示spu页面
      back(){
        //分发事件，通知父组件关闭修改界面
        this.$emit('update:visible',false);
      },
      //编辑模式
      showInput(value){
        if(value.hasOwnProperty('edit')){
          value.edit = true;
        }else{
          this.$set(value,'edit',true);
        };
        //输入框获取焦点
        this.$nextTick(()=>this.$refs.inp.focus());
      },
      //查看模式
      handelBlur(value){
        // value.edit = false;
        //取出添加的数据
        const {baseSaleAttrId,saleAttrValueName} = value;
        //不能为空
        if (!saleAttrValueName) {
          value.edit = false
          return
        }
        //不能重复，否则会添加两个相同的
        const isRepat = value.spuSaleAttrValueList.find(item=>{
          return saleAttrValueName===item.saleAttrValueName;
        })
        console.log(isRepat);
        if(isRepat) return
        //添加到数组当中
        value.spuSaleAttrValueList.push({
          saleAttrValueName,
          baseSaleAttrId
        })
        //变为查看模式
        value.edit = false
        //清空数据
        value.saleAttrValueName='';
      },
      //添加销售属性
      addSaleAttr(){
        //取出收集的数据
        const [baseSaleAttrId,saleAttrName] = this.saleAttrName.split('-');
        //添加到spuInfo.spuSaleAttrList当中，显示到界面的同时，收集了数据
        this.spuInfo.spuSaleAttrList.push({
          baseSaleAttrId,
          saleAttrName,
          spuSaleAttrValueList:[], //属性值数组最原始为空的，方便以后添加属性值
        })
        //清空收集的数据
        this.saleAttrName='';
      },
      async save() {
        //收集数据
        const spuInfo = this.spuInfo;
        spuInfo.spuImageList = this.spuImageList.map(itme=>({
          id:itme.id,
          spuID:itme.spuId,
          imgName:itme.name,
          imgUrl:itme.response?itme.response.data:itme.url
        }))
        //发送请求
        const result = await this.$API.spu.addUpdate(spuInfo);
        if(result.code===200){
          this.$message.success('保存SPU成功')
          //清除属性
          this.spuInfo={
            spuName:'',//spu名称
            description:'',//spu描述
              spuSaleAttrList:[],//以添加的销售属性
            }//spu详细信息
            this.spuImageList=[]//spu图片
            this.spuSaleAttrList=[]//销售属性列表、
            this.saleAttrName=''//收集销售属性
          //返回到spu页面，
          this.$emit('update:visible', false)
          }
          else{
            this.$message.error('保存SPU失败')
          }
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      handleSuccess (response, file, fileList) {
        this.spuImageList = fileList
      },
      handleRemove(file, fileList) {
        this.spuImageList = fileList
      },
    },
    computed: {
      SaleAttrList(){
        return this.spuSaleAttrList.filter(
          item=>{
            return this.spuInfo.spuSaleAttrList.every(attr=>{
              return  attr.saleAttrName!==item.name
            })
          }
          )

      }
    },
  }

</script>
<style scoped>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
