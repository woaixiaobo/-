<template>
  <div>
    <el-card>
      <el-table :data="skuList" stripe style="width: 100%" border>
        <el-table-column type="index" width="80" label="序号" align="center">
        </el-table-column>
        <el-table-column prop="skuName" label="名称">
        </el-table-column>
        <el-table-column prop="skuDesc" label="描述">
        </el-table-column>
        <el-table-column label="默认图片" width="150" align="center">
          <template slot-scope="{row}">
            <img :src="row.skuDefaultImg" alt="" width="80px">
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(KG)">
        </el-table-column>
        <el-table-column prop="price" label="价格(元)" width="80">
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template slot-scope="{row}">
            <Hint-button @click="cancelSale(row)" :title="row.isSale?'下架':'上架'" :type="row.isSale?'warning':'success'"
              :icon="row.isSale?'el-icon-bottom':'el-icon-top'" size="mini"></Hint-button>
            <Hint-button title="修改" type="primary" icon="el-icon-edit" size="mini"></Hint-button>
            <Hint-button title="查看详情" @click="showSkuInfo(row)" type="primary" icon="el-icon-info" size="mini">
            </Hint-button>
            <el-popconfirm
              title="这是一段内容确定删除吗？"
              @onConfirm="deleteSkuInfo(row)"
            >
              <Hint-button slot="reference" title="删除"  type="danger" icon="el-icon-delete" size="mini"></Hint-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="changeSize" @current-change="getSkuList" style="padding: 30px 0; text-align: center;"
        :current-page="page" :page-sizes="[5, 10, 15, 20]" :page-size="100"
        layout="prev, pager, next, jumper,->,sizes, total" :total="total">
      </el-pagination>
      <!-- 点击详情信息 (是个抽屉显示) -->
      <el-drawer title="我是标题" size="50%" :visible.sync="drawer" :with-header="false">
        <el-row>
          <el-col :span="5">名称</el-col>
          <el-col :span="15">{{skuInfo.skuName}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">描述</el-col>
          <el-col :span="15">{{skuInfo.skuDesc}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">价格</el-col>
          <el-col :span="15">{{skuInfo.price}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">平台属性</el-col>
          <el-col :span="15">
            <el-tag type="success" style="margin-right: 5px" v-for="value in skuInfo.skuAttrValueList" :key="value.id">
                {{value.attrId + '-' + value.valueId}}
            </el-tag>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">销售属性</el-col>
          <el-col :span="15">
            <el-tag type="success" style="margin-right: 5px" v-for="value in skuInfo.skuSaleAttrValueList" :key="value.id">
                {{value.id + '-' + value.saleAttrValueId}}
            </el-tag>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="5">商品图片</el-col>
          <el-col :span="15">
            <el-carousel :interval="5000" arrow="always" :autoplay="false" trigger="click" height="400" style="width:400px">
              <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id" >
                  <img :src="item.imgUrl" alt="" style="width:100%;height:100%">
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'SkuList',
    data() {
      return {
        page: 1, //当前页码
        limit: 5, //每页的数量
        total: 0, //总数量
        skuList: [], //sku列表
        drawer: false, //抽屉
        skuInfo: {}, //根据sku的id获取的sku的详细信息的对象
      }
    },
    //声明周期函数
    mounted() {
      //获取列表信息
      this.getSkuList();
    },
    methods: {
      async getSkuList(page = 1) {
        this.page = page;
        //发送列表请求
        const result = await this.$API.sku.getSkuList(page, this.limit);
        this.skuList = result.data.records;
        this.total = result.data.total;
      },
      //改变每页的数量
      changeSize(pageSize) {
        //更新每页的数量
        this.limit = pageSize;
        //重新请求第一页
        this.getSkuList();
      },
      //下架
      async cancelSale(value) {
        //判断是否上架还是下架
        if (value.isSale) { //如果isSale为1那么就是上架状态,发送下架请求
          //发送下架请求
          const result = await this.$API.sku.cancelSale(value.id);
          if (result.code === 200) {
            this.$message.success('下架成功')
          } else {
            this.$message.error('下架失败')
          }
        } else { //否则就是下架状态,发送上架请求
          const result = await this.$API.sku.onSale(value.id);
          if (result.code === 200) {
            this.$message.success('上架成功')
          } else {
            this.$message.error('上架失败')
          }
        }
        console.log(value);
        //重新请求sku列表
        this.getSkuList(this.page);
      },
      //点击查看详细信息
      async showSkuInfo(value) {
        //显示抽屉
        this.drawer = true
        //请求商品的详细信息
        const result = await this.$API.sku.getSkuInfo(value.id)
        this.skuInfo = result.data;
      },
      //删除sku信息
      async deleteSkuInfo(value){
        const result = await this.$API.sku.remove(value.id)
          //重新获取分页列表
          this.getSkuList();
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        // this.$confirm('是否删除SKU?', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // }).then(async () => {
        //   const result = await this.$API.sku.remove(value.id)
        //   //重新获取分页列表
        //   this.getSkuList();
        //   this.$message({
        //     type: 'success',
        //     message: '删除成功!'
        //   });
        // }).catch(() => {
        //   // this.$message({
        //   //   type: 'info',
        //   //   message: '已取消删除'
        //   // });
        // });
      },
      handleSizeChange(val) {
        console.log(`每页 ${val} 条`);
      },
      handleCurrentChange(val) {
        console.log(`当前页: ${val}`);
      }
    },
  }

</script>

<style lang="scss" scoped>
/* 深度选择器 */
  /deep/ .el-carousel__container {
    height: 400px;
  }

  /deep/ .el-carousel__indicator.is-active {
    button {
      background-color: green;
    }
  }
  .el-row {
    margin: 10px 5px;
      .el-col-5 {
        font-size: 16px;
        font-weight: bold;
        text-align: right;
        padding-right: 10px;
      }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
