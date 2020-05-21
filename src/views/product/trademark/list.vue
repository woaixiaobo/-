<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAdd">添加</el-button>
    <el-table :data="trademarks" border stripe>
      <el-table-column label="序号" type="index" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称">
      </el-table-column>
      <el-table-column label="姓名">
        <!-- 如果列表项的内容是指定的结构,那么需要用作用域插槽 -->
        <template slot-scope="{row}">
          <img :src="row.logoUrl" style="width:100px;height:60px;">
        </template>
      </el-table-column>
      <el-table-column prop="address" label="操作">
        <template slot-scope="{row}">
          <el-button type="warning" icon="el-icon-edit" @click="showUpdate(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteTrademark(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background style="text-align:center;margin-top:20px" :current-page="page" :page-sizes="[3, 6, 9, 12]"
      :page-size="limit" layout="prev, pager, next, jumper,->,sizes,total" :total="total"
      @current-change="getTrademarks" @size-change="handleSizeChange">
    </el-pagination>

    <!-- :visible.syncd绑定了自定义事件,
    内部点击对应的元素时出触发 $emit('update:visible', false) 自动关闭-->
    <el-dialog :title="form.id?'跟新':'添加'" :visible.sync="isShowDialog">
      <el-form :model="form" style="width:80%" :rules="rules"  ref="tmform" >
        <el-form-item label="品牌名称" :label-width="formLabelWidth" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off" placeholder="请输入品牌名称"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="formLabelWidth" prop="logoUrl">
          <!-- action:指定上传图片的接口地址
              1.组件内部发送上传文件的ajax(http://182.92.128.115/admin/product/fileUpload)请求,
                但是存在跨域,所以我们用请求代理 /dev-api/admin/product/fileUpload
                并且加上dev-api标识
              2.:on-success是上传成功的回调函数
              3.:before-upload是准备发送上传图片请求前的回调函数,如果返回值是true则发送请求,失败则不发送
          -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload">
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    c
  } from '../../../test/es-module/test1';
  export default {
    name: 'TrademarkList',
    data() {
      return {
        trademarks: [], //当前页的列表数据
        page: 1, //初始页码为1
        limit: 3, //每页的数量
        total: 0, //总数量

        isShowDialog:false,//是否显示添加的dialog界面
        //要添加的信息的对象
        form:{
          tmName:'',
          logoUrl:''
        },
        formLabelWidth: '100px',
        imageUrl: '',
        rules: {
          tmName: [
            { required: true, message: '请输入品牌名称', trigger: 'change' }, //值发生改变时
            // { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' } //失去焦点是触发
            //用自定义的方式来写  validator校验器,要指定一个校验函数 trigger触发条件
            { validator: this.validataTmName, trigger: 'blur' }
          ],
          logoUrl: [
            { required: true, message: '请指定LOGO图片'}
          ],
        }
      };

    },
    mounted() {
      // 测试新定义的接口请求函数
      // const result = this.$API.trademark.gitTrademarkList();

      //调用写好的请求函数
      this.getTrademarks();
    },
    methods: {
      //校验品牌名称的自定义回调函数
      /**
       * value:输入的最新值
       * callback:指定是否通过验证的函数
       * 长度必须在2-10个之间
       */
      validataTmName (rule, value, callback){
        if (value.length<2||vlaue.length>10) {
          //如果调用callback传入error就代表不通过,并且提示错误信息
          callback(new Error('长度在 2 到 10 个字符'));
        } else {
          //callback不传入任何参数,就代表通过
          callback();
        }
      },
      //异步获取指定页码列表的数据
      async getTrademarks(page = 1) { //page的默认值为1
        this.page = page;
        //发送分页列表数据请求
        const result = await this.$API.trademark.gitTrademarkList(page, this.limit);
        //请求成功时,更新列表数据
        if (result.code === 200) {
          const {
            records,
            total
          } = result.data; //records 为商品数据列表
          this.trademarks = records; //赋值给trademarks
          this.total = total; //商品数量总数
        } else { //失败提示
          this.$message.error('获取商品列表失败')
        }
      },
      //改变每页的数量
      handleSizeChange(pageSize) {
        //更新每页的数量个数 limit
        this.limit = pageSize;
        //重新发送请求函数,因为是改变了每页的数量,所以修改完成后,默认回到第一页
        this.getTrademarks();
      },
      //点击添加按钮显示dialog添加组件页面
      showAdd(){
        this.isShowDialog = true;
        //一旦点开就清除掉之前存的数据(可能存在可能不存在)
        this.form={
          tmName:'',
          logoUrl:'',
        }
      },
      //显示修改页面,调用的也是添加的dialog页面,所以数据操作和添加的合并为一个
      showUpdate(trademark){
        //将当前品牌对象保存到form ,为了在dialog页面中显示
        //这样写的是对地址进行操作,会影响页面
        // this.form = trademark;
        //所以解构
        this.form ={...trademark};
        //显示
        this.isShowDialog = true;

      },
      handleLogoSuccess(res, file) {
        // this.imageUrl = URL.createObjectURL(file.raw);
        // console.log(res,file);
        //res就是上传图片成功的响应体
        //得到返回图片的url
        const logoUrl = res.data;
        //保存图片到data数据,此时dialog页面上的数据也是读取的data,
        //所以dialog页面上也随之显示图片
        this.form.logoUrl = logoUrl;
      },
      //图片上传前 限制图片的格式和大小  此处要求格式为jpg/png,且不超过500kb
      beforeLogoUpload(file) {
        // const isJPG = file.type === 'image/jpeg';
        //判断格式
        console.log(file);
        const isJPGOrPNG = ['image/jpeg','image/png'].indexOf(file.type)>=0;
        // const isLt2M = file.size / 1024 / 1024 < 2;
        const idLt500kb = file.size / 1024 <500;

        if (!isJPGOrPNG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!idLt500kb) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPGOrPNG && idLt500kb;
      },
      //添加或者更新品牌,因为不管是添加还是更新,都需要trademark数据(就是用户的信息data当中的form)
      addOrUpdateTrademark(){
        //先进行统一的表单验证,如果没通过,不提交,只是显示错误提示
        this.$refs.tmform.validate(async (valid) => {//当前校验完成后调用
          if (valid) {//通过
            //取出请求的数据 form
            const trademark = this.form;
            //定义请求获得的数据
            let result;
            //判断点击的是添加还是修改 用品牌当中的id来判断即可
            if(trademark.id){//更新数据的trademark是需要id的,但是传递过来的row当中已经包含了id,所以无需担心id问题
              result = await this.$API.trademark.update(trademark);
            }else{//如果没有数据,则点击的是添加,发送添加请求
              result = await this.$API.trademark.add(trademark);
            }

            //成功后,提示成功添加/更新成功,并且隐藏当前dialog,重新显示新的品牌列表
            if(result.code===200){
              this.$message.success(`${trademark.id?'更新':'添加'}品牌成功`);
              this.isShowDialog = false;
              //添加成功后跳转到第一页,更新后就在当前页面
              this.getTrademarks(trademark.id ? this.page:1);
            }else{
              //失败的提示
              this.$message.error(`添加品牌失败`)
            }
            } else {
              //不需要做任何事情,因为上边已经完成了提示
            }
          });
      },
      //删除品牌
      async deleteTrademark(trademark){
        this.$confirm(`确定删除${trademark.tmName}吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {//点击确定,发送删除请求
        const result = await this.$API.trademark.remove(trademark.id);
          if(result.code===200){//如果成功了
          console.log(11);
            // this.$message({
            //   type: 'success',
            //   message: '删除品牌成功!'
            // });
            this.$message.success('删除品牌成功');
            //刷新界面
            //方式1:去固定的第一页
            // this.getTrademarks();
            //方式2:还是显示当前界面,但是删除完毕后,当前界面就不存在了
            //因为数据是上次请求保存下来的,所以未更新页面前,数据还是存在的
            const page = this.trademarks.length===1? this.page-1:this.page;
            console.log(page);
            this.getTrademarks(page);
          }else{
            this.$message.error('删除品牌失败!');
          }
        }).catch(() => {//点击取消
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      }
    },
  }

</script>

<style>
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
