<template>
  <div>
    <el-form  label-width="120px" class="demo-form-inline">
      <el-form-item label="SPU 名称">
        <template>
          <span>xiaobozai</span>
        </template>
      </el-form-item>
      <el-form-item label="SKU 名称">
        <el-input  placeholder="SKU 名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格">
        <el-input  placeholder="SKU 价格" v-model="skuInfo.price"></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input  placeholder="SKU 重量" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input type="textarea" v-model="skuInfo.skuDesc" placeholder="SKU 规格描述" rows="4"></el-input>
      </el-form-item>
      <!-- 嵌套form -->
      <el-form-item label="平台属性">
        <el-form inline label-width="80px">
          <el-form-item  v-for="(attr) in attrList" :key="attr.id"
              :label="attr.attrName">
              <!-- 收集属性的id和属性值的id，保存到attr当中，然后点击保存时当中请求的参数 -->
            <el-select v-model="attr.attId$attrValueId">
              <el-option v-for="(attrValue) in attr.attrValueList"
                :label="attrValue.valueName"
                :value="attr.id + '$' + attrValue.id"
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
            <el-select v-model="attrSale.saleAttrValueId">
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
            <template slot-scope="{row}">
              <!-- 设为默认时显示默认的小标签 -->
              <el-tag type="success" v-if="row.isDefault==='1'">默认</el-tag>
              <el-button v-else type="primary" @click="setDefault(row)">设为默认</el-button>
            </template>
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
        skuImageList: [],//图片保存
        skuInfo: {
          //从请求当前获取到的（不是收集的）
          category3Id: '', //第三级的id
          spuId: '',
          tmId: '',
          //表单数据收集，输入框v-module绑定了
          skuName: '',
          skuDesc: '',
          price: '',
          weight: '',
          //点击选中的默认图片
          skuDefaultImg: '',
          // 未绑定modle的数据，需要手动（点击保存按钮）收集
          skuAttrValueList: [], //平台属性数据保存
          skuSaleAttrValueList: [],//销售属性数据保存
          checkImgList:[],//选中的图片的数组
        },
      }
    },
    methods: {
      onSubmit() {
        console.log('submit!');
      },
      //由父组件调用的更新初始界面的请求
      initSkuDate(skuId,spu){
        //  //保存三级Id,是用来请求属性接口使用的参数
        const {category1Id,category2Id,category3Id}=skuId;
        this.category1Id = category1Id;
        this.category2Id = category2Id;
        this.category3Id = category3Id;
        //用来发送请求
        this.skuInfo.spuId = spu.id
        this.skuInfo.tmId = spu.tmId
        //根据三级id获取属性数据
        this.getAttrs();
        //根据spuId获取对应的sku的销售属性
        this.getSaleAttrList(spu.id);
        //根据spuId获取对应的sku的销售图片
        this.getSaleImageList(spu.id);
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
        // 保存的同时给每个图片对象添加一个isDefault为0的属性，这样这个属性就是响应式的
        //后期改动时就会实时变化
        const saleImageList = result.data
        saleImageList.forEach(item=>item.isDefault='0')
        this.saleImageList = result.data;
      },
      //点击返回退出此界面
      back(){
        //通知父组件隐藏次组件
        this.$emit('closeSku')
      },
      //保存修改的sku
      async save(){
        const skuInfo = this.skuInfo; //收集skuInfo信息，因为要进行操作
                                //所以重新赋值，而不是直接对原数组进行操作，不然会影响已有的数据
        skuInfo.skuAttrValueList = this.attrList.reduce((pre,attr)=>{
          //如果数据被选中了，那么在结构当中回自动添加一个attId$attrValueId的属性
          //attId$attrValueId属性包含发送请求参数需要的属性id和属性值的id
          if(attr.attId$attrValueId){//只有包含了此属性的才被收集起来，因为属性列表当中有好多属性
          //例如 屏幕尺寸，运行内存等，此时收集的就是这些属性的属性值
            const [attrId,valueId] = attr.attId$attrValueId.split('$');
            //pre是数组类型的，向数组当中添加对象类型的数据
            pre.push({
              attrId,
              valueId
            })
          }
          return pre;
        },[])
        //收集销售属性及其属性值
        skuInfo.skuSaleAttrValueList = this.saleAttrList.reduce((pre,attr)=>{
          if(attr.saleAttrValueId){  //根基接口需要将选择的id赋值给
          //skuSaleAttrValueList当中的saleAttrValueId（后添加的数据，
          //请求回来的没有此参数，此参数用作发送参数）即可
          const saleAttrValueId = attr.saleAttrValueId;
            pre.push({
              saleAttrValueId
            })
          }
          return pre
        },[])
        //收集skuimageList数据,选中的图片的数组
        if(this.checkImgList){
          skuInfo.skuImageList = this.checkImgList.map(item=>({
            imgName: item.imgName,
            imgUrl: item.imgUrl,
            spuImgId: item.id,//请求参数的id必须携带，而且名字变为了spuImgId
            isDefault: item.isDefault//是否是默认选中的图片。只能有一张
          }))
        }
        //发送添加sku的请求
        const result = await this.$API.sku.addUpdate(skuInfo);
        if(result.code===200){
          this.$message.success('保存sku成功！')
          //清空输入框的数据
          this.skuInfo={
            //从请求当前获取到的（不是收集的）
            category3Id: '', //第三级的id
            spuId: '',
            tmId: '',
            //表单数据收集，输入框v-module绑定了
            skuName: '',
            skuDesc: '',
            price: '',
            weight: '',
            //点击选中的默认图片
            skuDefaultImg: '',
            // 未绑定modle的数据，需要手动（点击保存按钮）收集
            skuAttrValueList: [], //平台属性数据保存
            skuSaleAttrValueList: [],//销售属性数据保存
            checkImgList:[],//选中的图片的数组
          },
          //通知父组件隐藏次组件
          this.$emit('closeSku')
        }else{
          this.$message.error('保存失败');
        }
      },
      //设置默认图片
      setDefault(spu){
        //需要先清除之前的默认图片
        this.saleImageList.forEach(item=>item.isDefault='0')
        //将点击的设为默认图片
        spu.isDefault = '1',//字符串类型
        //将这个图片保存到skuInfo当中,当点击查看当前spu的sku列表时，就会显示这个默认的图片
        this.skuInfo.skuDefaultImg = spu.imgUrl;
      },
      handleSelectionChange(checkImg){
        this.checkImgList = checkImg;
      }
    }
  }

</script>
<style scoped>

</style>
