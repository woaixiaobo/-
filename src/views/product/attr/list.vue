<template>
  <div>
    <el-card class="box-card">
      <CategorySelector @categoryChange="handleCategoryChange" />
    </el-card>
    <el-card>
      <div v-show="isShowList">
        <el-button @click="showAdd" type="primary" icon="el-icon-plus" style="margin-bottom: 20px">添加属性</el-button>
        <el-table :data="attrs" border style="width: 100%">
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="180">
          </el-table-column>
          <el-table-column label="属性值列表">
            <template slot-scope="{row}">
              <el-tag style="margin: 2px" type="info" v-for="(value) in row.attrValueList" :key="value.id">
                {{value.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row}">
              <el-button @click="showUpdate(row)" type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button @click="deleteAttr(row)" type="danger" icon="el-icon-delete" size="mini"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attr" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input v-model="attr.attrName" placeholder="请输入属性名称"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus"
          :disabled="!attr.attrName" @click="addAttrValue" >添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>

        <el-table :data="attr.attrValueList" border style="margin:20px 0">
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{row}">
              <el-input v-if="row.edit" v-model="row.valueName"
              @blur="toShow(row)" @keydown.enter.native="toShow(row)"
              size="mini" placeholder="请输入属性值名称"></el-input>
              <span  style="display: inline-block; width: 100%" v-else @click="toEdit(row)">{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,index}">
              <HintButton @click="attr.attrValueList.splice(index, 1)" title="删除" type="danger" icon="el-icon-delete" size="mini"></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="saveDate">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { c } from '../../../test/es-module/test1';
//深拷贝的包,loadsh是vue脚手架本来就携带好的,无需重新下载
import cloneDeep from 'lodash/cloneDeep'
  export default {
    name: 'AttrList',
    data() {
      return {
        category1Id: '', // 用来保存CategorySelector子组件传来的一级分类ID
        category2Id: '', // 用来保存CategorySelector子组件传来的二级分类ID
        category3Id: '', // 用来保存CategorySelector子组件传来的三级分类ID
        attrs: [], // 请求得来的所有属性的列表数据
        isShowList: true, //是否显示属性列表

        attr: {
          attrName: '', //属性名
          attrValueList: [], //属性值的列表
          categoryId: '', // 3级的分类ID,因为属性都是在第三分类列表当中的
          categoryLevel: 3, // 只能是3级,因为属性都是在第三分类列表当中的
        },
      }
    },
    methods: {
      //三个分类列表发生改变时的回调函数
      async handleCategoryChange({
          categoryId,
          level
        }) {
        //判断是几级列表返回来的数据,并保存对应的id
        if (level === 1) {
          this.category1Id = categoryId;
        } else if (level === 2) {
          this.category2Id = categoryId;
        } else {
          this.category3Id = categoryId;
          //如果三级列表也传递了值过来,那么代表三级别表的id数值已经全部收集完毕
          //可以发生三级列表属性的请求函数了
          const reslut = await this.$API.attr.getList(this.category1Id, this.category2Id, this.category3Id)
          //保存列表的属性数据
          this.attrs = reslut.data;
        }
      },
      //显示添加属性页面,同时把上次的数据清除掉
      showAdd(){
        //数据都是attr对象当中的,所以清除掉它的数据即可
        this.attr = {
          aattrName: '', //属性名
          attrValueList: [], //属性值的列表
          categoryId: this.category3Id,//在当前三级分类属性当中添加属性
          categoryLevel: 3,
        },
        //显示添加页面
        this.isShowList = false;
      },
      //添加或者更新一个新的属性值
      addAttrValue(){
        //把要添加的属性值保存到data当中的attr当中
        this.attr.attrValueList.push({
          attrId:this.attr.id, //只有修改属性时才有值,否则就是undefined
          valueName:'',
          edit:true,//添加的新属性值是编辑模式的,输入数据后才会变为浏览模式
        })
      },
      //显示修改属性的界面
      showUpdate(attr){
        //保存要修改的属性对象,一旦保存给atte页面也会有对应的数据显示
        // this.attr = {...attr}  //浅拷贝(克隆),知道吧attr对象里边的第一层的值克隆了出来,
                    //对象里边包含的对象的值并未拷贝,而是拷贝的它的地址,所以修改属性值时还是会出现问题
        //所以用深拷贝解决
        this.attr = cloneDeep(attr);
        //显示更新的界面
        this.isShowList = false;
      },
      //将编辑模式改为查看模式
      toShow(value){
        //只有输入了属性值名称才能变为查看模式
        if(value.valueName){
          //而且不在已有的属性名中,就是不能重名

          const isRepeat = this.attr.attrValueList.some((item,index)=>{
             //因为是在attrValueList这个数组当中查找.而添加的数据已经添加到这个数组的最后一位.
          //所以肯定会查找到,但是这样是不对的,它应该和除了它本身的其他数据进行判断
          if(item!==value){//直接判断是否是当前对象即可
            return item.valueName===value.valueName  //此时不是一句话的箭头函数,所以需要返回值
          }
          })
          if(!isRepeat){//如果不重复
            value.edit = false;
          }else{
            value.valueName='';//清除输入的重复数据
            this.$message.warning('输入的名称已经存在')
          }
        }
      },
      //点击文本改为编辑模式
      toEdit(value){
        //点击会发现有的没效果,那是因为之前的value对象,没有edit这个属性
        //所以进行判断,有edit的直接改为true,没有的则通过$set添加
        if(value.hasOwnProperty('edit')){
          value.edit = true;
        }else{
          this.$set(value,'edit',true);
        }
      },
      //点击保存提交数据,跟新界面
      async saveDate(){
          //收集数据
          const {attrName,attrValueList,categoryId,categoryLevel} = this.attr;
          const attrInfo={
            attrName,
            attrValueList,
            categoryId,
            categoryLevel
          };
          //发送保存/跟新函数
          const result = await this.$API.attr.addOrUpdate(attrInfo);
          //如果成功,重新发送列表请求,跟新页面
          const reslut2 = await this.$API.attr.getList(this.category1Id, this.category2Id, this.category3Id)
          //保存列表的属性数据
          this.attrs = reslut2.data;
          //并且退出添加页面,显示属性列表页面
          this.isShowList = true;
      },
      //点击删除按钮,根据id删除属性
      async deleteAttr(value){
        // console.log(value);
        //发送删除请求
        const reslut = await this.$API.attr.remove(value.id);
        //如果成功便重新获取列表属性,跟新界面
        const reslut2 = await this.$API.attr.getList(this.category1Id, this.category2Id, this.category3Id)
        //保存列表的属性数据
        this.attrs = reslut2.data;

      }
    },

  }

</script>

<style scoped>
  .edit-input {
    padding-right: 60px;
  }

  .save-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }

</style>
