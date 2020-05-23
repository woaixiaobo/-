<template>
  <div>
    <el-card class="box-card">
        <CategorySelector @categoryChange="handleCategoryChange"/>
    </el-card>
    <el-card>
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button :disabled="category3Id?false:true" @click="showAddSpu" type="primary"  icon="el-icon-plus" style="margin-bottom: 20px">添加SPU</el-button>
        <el-table v-loading = "loading"
          :data="spuList" border stripe>
          <el-table-column label="序号"
          type="index" width="80"
          align="center">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述">

          </el-table-column>
          <el-table-column label="操作" >
              <template slot-scope="{row}">
                <Hint-button @click="showSkuForm" title="添加SKU" type="primary" icon="el-icon-plus" size="mini"></Hint-button>
                <Hint-button title="修改SKU" type="primary"
                icon="el-icon-edit" size="mini"
                @click="showUpdateSpu(row)"
                ></Hint-button>
                <Hint-button @click="findSale(row)" title="查看所有SKU" type="info" icon="el-icon-info" size="mini"></Hint-button>
                <el-popconfirm title="确定删除吗" @onConfirm="deleteSpu(row.id)">
                  <Hint-button slot="reference" title="删除SKU"
                    type="danger"
                    icon="el-icon-delete" size="mini"></Hint-button>
                </el-popconfirm>
              </template>
            </el-table-column>
        </el-table>
        <el-pagination
          background
          style="text-align:center;margin-top:20px"
          :current-page="page"
          :page-sizes="[3, 6, 9, 12]"
          :page-size="limit"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total"
          @current-change="getSpuList"
          @size-change="handleSizeChange">
        </el-pagination>
      </div>
      <!-- @update:visible="isShowSpuForm=$event" -->
      <!--
        一旦使用.sync, 必须是一个动态的变量属性值, 且属性名必须使用:
        但如果不加:, 传递给子组件的总是false值
      -->
      <SpuForm ref="SpuForm" :visible.sync="isShowSpuForm" @getCategoryChange="SaveSuccess"></SpuForm>
    </el-card>
    <el-dialog :title="spuName+'-->SKU列表'" :visible.sync="dialogTableVisible">
      <el-table :data="skuList">
        <el-table-column property="skuName" label="名称" width="150"></el-table-column>
        <el-table-column property="price"  label="价格(元)" width="200"></el-table-column>
        <el-table-column property="weight" label="重量(KG)"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{row}">
            <img :src="row.skuDefaultImg" alt="" width="100px" height="100px">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { c } from '../../../test/es-module/test1';
import SpuForm from '../components/SpuForm'
import SkuForm from '../components/SkuForm'
export default {
  name: 'SpuList',
  data() {
    return {
      category1Id:'',
      category2Id:'',
      category3Id:'',

      dialogTableVisible:false,//查看sku的dialog弹框
      skuList:[],//查看sku
      spuName:'', //用来保存spu的名字,然后当中sku的dialog弹框的名字
      spuList:[],
      page:1,//当前页码
      limit:3,//每页的数量
      total:0,//总数量
      loading:false, //是否开启缓存

      isShowSpuForm: false, // 是否显示spuForm界面
      isShowSkuForm: false, // 是否显示skuForm界面
    }
  },
  methods: {
    //三个分类列表发生改变时的回调函数
      async handleCategoryChange({categoryId,level}) {
        //判断是几级列表返回来的数据,并保存对应的id
        if (level === 1) {
          this.category1Id = categoryId;
          //此时应该清除下边列表的数据,把id清除即可
          this.category2Id = ''
          this.category3Id = ''
          this.spuList = []
        } else if (level === 2) {
          this.category2Id = categoryId;
          this.category3Id = ''
          this.spuList = []
        } else {
          this.category3Id = categoryId;
          //如果三级列表也传递了值过来,那么代表三级别表的id数值已经全部收集完毕
          this.getSpuList();

        }
      },
      //获取指定页码的列表数据
      async getSpuList(page=1){
        this.page = page;
        const {limit,category3Id} = this;
        const reslut = await this.$API.spu.getList(page,limit,category3Id);
        if(reslut.code ===200){
          const {records,total} = reslut.data;
          this.spuList = records;
          this.total = total;
        }
      },
      //每页数量发生变化时的回调函数
      handleSizeChange(pageSize){
        this.limit = pageSize;
        this.getSpuList();
      },
      //显示SPU的修改界面
      showUpdateSpu(spu){
        //保存跟新的标识
        this.spuId = spu.id;
        //显示修改界面
        this.isShowSpuForm = true;
        //通知spuForm根据传入的ID请求获取初始显示需要的数据
        //注意:因为是使用的v-show,dom元素只是被隐藏了,还是存在的,所以可以refs获取到
        // this.$refs.SpuForm.dialogImageUrl=[];
        this.$refs.SpuForm.initLoadUpdateDate(spu.id);
      },
      //显示sku添加界面
      showSkuForm(){
        this.isShowSkuForm = true;
      },
      //点击添加显示spu添加界面
      showAddSpu(){
        //清空数据
        // this.$refs.SpuForm.spuInfo={};
         //显示修改界面
        this.isShowSpuForm = true;
        //通知子组件spuform请求添加界面的初始化数据,需要传递3Id因为添加保存spu时需要
        this.$refs.SpuForm.initLoadDate(this.category3Id);
      },
      //当SPU保存成功是的回调，子组件通过自定义事件触发
      SaveSuccess(){
        //如果spuId有值，说明是跟新
        if(this.spuId){
          this.getSpuList(this.page)
          //重置spuId
          this.spuId = '';
        }else{
          //否则到第一页
          this.getSpuList();
        }
      },
      //点击删除，删除spu
      async deleteSpu(skuId){
        //发送删除请求
        try {
          const result = await this.$API.spu.remove(skuId);
        } catch (error) {
          console.log(error);
        }

      },
      //查看所有的sku
      async findSale(spu){
        this.spuName = spu.spuName;
        const result =  await this.$API.sku.getListBySpuId(spu.id);
        console.log(result);
        this.skuList = result.data;
        this.dialogTableVisible = true
      }
  },
  components:{
    SpuForm,
    SkuForm
  }
}
</script>
