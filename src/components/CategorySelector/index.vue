<template>
  <el-form :inline="true" :model="cForm" class="demo-form-inline">
    <el-form-item label="一级分类">
      <el-select :disabled="disabled" v-model="cForm.category1Id" placeholder="选择一级分类" @change="handleChange1">
        <el-option v-for="c in category1List" :label="c.name" :value="c.id" :key="c.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select :disabled="disabled" v-model="cForm.category2Id" placeholder="选择二级分类" @change="handleChange2">
        <el-option v-for="c in category2List" :label="c.name" :value="c.id" :key="c.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select :disabled="disabled" v-model="cForm.category3Id" placeholder="选择三级分类" @change="handleChange3">
        <el-option v-for="c in category3List" :label="c.name" :value="c.id" :key="c.id"></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import { c } from '../../test/es-module/test1';
  export default {

    data() {
      return {
        disabled :false,
        formInline: {
          user: '',
          region: ""
        },
        cForm:{
          category1Id: '',
          category2Id: '',
          category3Id: '',
        },
        category1List:[],//一级分类列表
        category2List:[],//二级分类列表
        category3List:[],//三级分类列表
      }
    },
    mounted() {//创建页面时便发送获取一级分类列表的请求,其他的在点击一级分类列表的选项时在发送
      this.getCategory1List();
    },
    methods: {
      onSubmit() {
        console.log('submit!');
      },
      async getCategory1List(){
        //发送获取一级分类列表的属性
        const result = await this.$API.category.getCategorys1();
        //将一级分类列表的数据进行保存
        this.category1List = result.data;
      },
      //选择一级分类的时候触发事件,获取二级分类列表显示
      async handleChange1(category1Id){
        //重置二级与三级分类相关的数据,否则重新请求后上次的数据还是存在的
        this.cForm.category2Id='';
        this.cForm.category3Id='';
        this.category2List = [];
        this.category3List = [];
        //分发事件,通知父组件,方便父组件收集一二三级列表的id,发送三级分类列表属性的请求
        this.$emit('categoryChange',{categoryId:category1Id,level:1});
        //获取二级分类列表
        const result = await this.$API.category.getCategorys2(category1Id)
        //获取二级列表数据
        this.category2List = result.data;
      },
      //选择二级分类的时候触发事件,获取三级分类列表显示
      async handleChange2(category2Id){
        //重置三级分类相关的数据,否则重新请求后上次的数据还是存在的
        this.cForm.category3Id='';
        this.category3List = [];
        //分发事件,通知父组件,方便父组件收集一二三级列表的id,发送三级分类列表属性的请求
        this.$emit('categoryChange',{categoryId:category2Id,level:2});
        //获取三级分类列表
        const result = await this.$API.category.getCategorys3(category2Id)
        //获取二级列表数据
        this.category3List = result.data;
      },
      //选择三级分类的时候分发事件,通知父组件
      async handleChange3(category3Id){
        //分发事件
        this.$emit('categoryChange',{categoryId:category3Id,level:3});
      }
    }

  }

</script>
