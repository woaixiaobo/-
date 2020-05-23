<template>
  <el-form label-width="100px" v-show="visible" :model="spuInfo">
    <el-form-item label="SPU名称" >
      <el-input v-model="spuInfo.spuName" type="text" placeholder="SPU名称"></el-input>
    </el-form-item>
    <el-form-item label="品牌">
      <el-select placeholder="请选择品牌"  v-model="spuInfo.tmId">
        <el-option v-for="(tm) in trademarkList" :key="tm.id" :label="tm.tmName" :value="tm.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="SPU描述">
      <el-input type="textarea" placeholder="SPU描述" rows="4" v-model="spuInfo.description"></el-input>
    </el-form-item>


    <el-form-item label="SUP图片">
      <el-upload
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :file-list="spuImageList"
        :on-success="handleSuccess"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove">
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-select :placeholder="unUsedSaleAttrList.length>0?`还有${unUsedSaleAttrList.length}个未使用` : '没有啦!!!'"
        v-model="attrIdAttrName">
        <!-- 下拉选项的值都是过滤出来的，spuInfo.spuSaleAttrList当中未被使用的属性数据 -->
        <!-- 因为添加属性数据，要收集选中的数据，所以此处的value为动态的att.name和attr.id的组合
              这样选中的值发送变化时，select的value就会随之变化，然后在用v-modul来绑定数据，
              此时data当中便收集到了下拉选项的id和name组合的value值，在将其进行拆分即可
        -->
        <el-option v-for="attr in unUsedSaleAttrList"
        :key="attr.id"
        :label="attr.name"
        :value="attr.id + ':' + attr.name"></el-option>
      </el-select>
      <!-- 当选择框没有值时是不可以点击添加按钮的，用输入框的attrIdAttrName来做判断即可 -->
      <el-button :disabled="!attrIdAttrName"
      @click="addSpuSaleAttr"
      type="primary"
      icon="el-icon-plus">添加销售属性</el-button>
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
            <el-table-column label="属性值名称列表">
              <template slot-scope="{row}">
                <!-- row.spuSaleAttrValueList 就是spuInfo.spuSaleAttrList.spuSaleAttrValueList
                  是spu属性信息当中的属性值的数据数组
                  -->
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
              <!-- 输入框的显示及其属性 -->
                <el-input
                style="width:120px"
                placeholder="请输入"
                v-if="row.edit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag"
                size="small"
                @click="showInput(row)">+ 添加</el-button>
            </template>
            </el-table-column>
          <el-table-column prop="address" label="操作">
              <template slot-scope="{row,$index}">
                <el-popconfirm title="确定删除吗" @onConfirm="deleteAttr($index)">
                  <el-button el-button slot="reference" type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </el-popconfirm>
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
  props:{
    visible:Boolean,
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      spuId:'',//当前更新的spuinfo的id,因为好多地方都用到了
      spuInfo:{
        category3Id:'',//用父组件传过来的，添加spu时需要这个三级id
        spuName: '',
        description: '',
        tmId: '',
        spuSaleAttrList: [], // 必须有初始空数组
      },//保存spu详细信息的对象
      spuImageList:[],//spu的图片列表
      trademarkList:[],//品牌列表
      saleAttrList:[],//销售属性列表
      attrIdAttrName: '', // 用来收集输入的销售属性的id与name, 将其id和name合并为id:name的格式
    }
  },
  computed: {
    /*修改界面的销售属性选项框，是saleAttrList（是获取所有列表属性的请求）
      当中还没有被使用的属性的数组的数据*/
    //已使用的数据存在spuInfo.spuSaleAttrList 数组中，是获取spu的详细信息的请求
    unUsedSaleAttrList(){
      return this.saleAttrList.filter(
        attr => this.spuInfo.spuSaleAttrList.every(spuAttr=>spuAttr.saleAttrName!==attr.name)
      )
    }
  },
  methods: {
    /**
     * 点击删除按钮触发的回到
     * flie：被删除的图片的信息，并没有发送任何请求
     * fileList：删除完成后剩下的图片对象的数组
     */
      handleRemove(file, fileList) {
        console.log(file, fileList);
        this.spuImageList = fileList
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      /**图片上传成功后的回调函数
       * response:上传成功过后的响应体数据，对应的是axios当中的response.data，在结构当中
       *          存在action：url发送地址请求的结构
       * flie：新上传成功的图片对象
       * flieList:所有图片对象的数组
      */
      handleSuccess (response, file, fileList) {
        console.log('handleSuccess', response, file, fileList)
        // 将已上传图片对象的列表保存起来
        this.spuImageList = fileList
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
      //父组件调用的添加界面的初始化请求
      initLoadDate(category3Id){
        //保存三级id
        this.spuInfo.category3Id = category3Id;
        //获取品牌
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
        const spuImageList = result.data;
        //对数据进行处理，按照upload当中默认显示图片的数据格式来
        spuImageList.forEach(item=>{
          item.name=item.imgName;
          item.url=item.imgUrl;
        })
        this.spuImageList = spuImageList ;
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
      },
      //点击添加一个新的spu销售属性数据对象
      addSpuSaleAttr(){
        //取出选择的要添加的销售属性
        const [baseSaleAttrId,saleAttrName] = this.attrIdAttrName.split(':');
        //添加一个新的spu属性对象,先添加这个对象，才能再在这个对象当中添加具体的属性值
        /*因为下拉选项的值是经过计算的，所以此处添加完成后，spuInfo.spuSaleAttrList就存在
          这个值，而下拉选项只要不存在在spuInfo.spuSaleAttrList当中的属性值，所以添加一个
          下拉选项当中便会自动的减少一个(同时需要清除掉收集的才可以，不然虽然计算出来的值已经没有
            添加的数据， 但是收集的还在，再次点击添加就会再次添加数据)*/
        this.spuInfo.spuSaleAttrList.push({
          baseSaleAttrId, //spu详细信息（spuInfo.spuSaleAttrList）的id
          saleAttrName,//spu详细信息（spuInfo.spuSaleAttrList）的name
          spuSaleAttrValueList:[],
          //spu详细信息（spuInfo.spuSaleAttrList)的属性信息的数组（spuInfo.spuSaleAttrListspuSaleAttrValueList）
        })
        //添加成功后，便把收集到的数据清除掉，不然下拉框选择的值还是之前选中的，不会自动消失
        this.attrIdAttrName = '';
      },
      //点击添加按钮显示输入框
      showInput(spuSaleAttr){
        //传过来的就是属性值的数组当中的单个对象
        if(spuSaleAttr.hasOwnProperty('edit')){
          spuSaleAttr.edit = true
        }else{
          this.$set(spuSaleAttr,'edit',true)
        }
        //输入框自动获取焦点
        this.$nextTick(()=>this.$refs.saveTagInput.focus());
      },
      //实去焦点或者回车变为编辑模式变为查看模式
      handleInputConfirm(spuSaleAttr){
        //取出需要的数据， saleAttrValueName baseSaleAttrId，这俩数据已经添加到了spuInfo.spuSaleAttr
        const {saleAttrValueName,baseSaleAttrId} = spuSaleAttr;
        //限制1：属性值必须存在
        if(!saleAttrValueName){
          spuSaleAttr.edit = false;
          return
        }
        //限制2：不能输入重复的值
        const isRepeat = spuSaleAttr.spuSaleAttrValueList.some(value=>value.saleAttrValueName===saleAttrValueName);
        if(isRepeat){
          this.$message.warning('不能重复');
        }

        //向 spuSaleAttr.spuSaleAttrValueList中添加一个spu销售属性 值 对象
        spuSaleAttr.spuSaleAttrValueList.push({
          saleAttrValueName,
          baseSaleAttrId
        })
        //添加成功，转化为查看模式
        spuSaleAttr.edit = false;
        //清除收集到的属性值
        spuSaleAttr.saleAttrValueName='';
      },
      async save(){
          //取出spu信息 spuInfo 和图片信息 spuImageList
          const {spuInfo,spuImageList} = this;
          if(!spuInfo.spuName){
            this.$message.warning('必须添加SPU名称');
            return
          }
          /*
        已有图片对象
          {
              id:1224
              imgName:"O1CN01N5IsrF29zFm3vQZpT_!!1714128138.jpg"
              imgUrl:"http://182.92.128.115:8080/xxx.jpg"
              spuId:154,
              name: 'O1CN01N5IsrF29zFm3vQZpT_!!1714128138.jpg',
              url: 'http://182.92.128.115:8080/xxx.jpg'
          }
        新上传图片的结构:
            {
                name: 'fa6e854a56ff9b46.png',
                url: 'blob:http://localhost:9529/0b11fe66-1f6a-432d-b327-e48745825a8c',
                response: {
                    data: 'http://182.92.128.115:8080/xxx.png'
                }
            }
        提交请求需要的图片对象的结构:
            {
              "imgName": "下载 (1).jpg",
              "imgUrl": "http://47.93.148.192:8080/xxx.jpg"
            }
        */
        spuInfo.spuImageList = spuImageList.map(item=>({
          imgName:item.name,
          //图片可能是原本请求spu信息的时候请求回来的（结构没有response.data）
            //也可能是手动上传上去的(结构有response.data)
          imgUrl:item.response?item.response.data:item.url,
        }));
        //处理spuSaleAttrList属性
        /**
         * 1.删除不必要的参数数据：属性对象可能有2个不必要的数据。edit和saleAttrValueName
         * 2.可能有的没有添加属性值，这样的也要过滤掉
         * 注意：因为是修改数据，其他的数据都不需要修改，
         *    而且spuInfo也是请求回来的，数据比较全,所以发送保存请求，只需要对图片，
         *    和属性值（spuInfo.spuSaleAttrList）进行数据整理即可
         */
        spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter(attr=>{
          delete attr.edit;
          delete attr.saleAttrValueName
          return attr.spuSaleAttrValueList.length>0
        });
        //数据整理完成后，发送保存spu信息请求
        const result = await this.$API.spu.addUpdate(spuInfo);
        //如果成功
        if(result.code === 200){
          //提示成功
          this.$message.success('保存SPU成功');
          //清除数据
          this.spuInfo={
            spuName: '',
            description: '',
            tmId: '',
            spuSaleAttrList: [], // 必须有初始空数组
          };
          this.spuImageList=[]//spu的图片列表
          //重新获取三级列表数据
          this.$emit('getCategoryChange');
          //分发自定义事件,让当前dialog页面关闭
          this.$emit('update:visible',false);

        }else{
          this.$message.error('保存SPU失败');
        }
      },
      //删除属性
      deleteAttr(index){
        this.spuInfo.spuSaleAttrList.splice(index, 1)
      }
  },
}
</script>
<style scoped>

</style>
