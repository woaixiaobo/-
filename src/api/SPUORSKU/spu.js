/*
包含所有SPU管理的接口请求函数
*/
import request from '@/utils/request'

export default{
  //获取所有销售属性列表,最外边一层的属性
  getSaleList(){
    return request.get('/admin/product/baseSaleAttrList');
  },
  //删除指定id的spu
  remove(spuId){
    return request.delete(`/admin/product/deleteSpu/${spuId}`)
  },
  //获取指定id的spu的详细信息
  get(spuId){
    return request.get(`/admin/product/getSpuById/${spuId}`)
  },
  //保存/更新sku的信息
  addUpdate(spuInfo){
    return request.post(`/admin/product/${spuInfo.id?'update':'save'}SpuInfo`,spuInfo)
  },
  //获取指定分类的spu分页列表
  getList(page,limit,category3Id){
    return request.get(`/admin/product/${page}/${limit}`,{params:{category3Id}})
  }
}
