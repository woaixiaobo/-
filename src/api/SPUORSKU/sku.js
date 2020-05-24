/*
包含所有SPU管理的接口请求函数
*/
import request from '@/utils/request'

export default{
  //下架SKU
  cancelSale(skuId){
    return request.get(`/admin/product/cancelSale/${skuId}`)
  },
  //上架SKU
  onSale(skuId){
    return request.get(`/admin/product/onSale/${skuId}`)
  },
  //获取sku列表
  getSkuList(page,limit){
    return request.get(`/admin/product/list/${page}/${limit}`)
  },
  //根据id删除sku
  remove(skuId){
    return request.delete(`/admin/product/deleteSku/${skuId}`)
  },
  //根据spu的id查询对应的sku的列表
  getListBySpuId(spuId){
    return request.get(`/admin/product/findBySpuId/${spuId}`)
  },
  //根据sku的id查询对应的sku的详情信息
  getSkuInfo(skuId){
    return request.get(`/admin/product/getSkuById/${skuId}`)
  },
  /*
  保存/更新SKU
  */
  addUpdate (skuInfo) {
    return request.post(`/admin/product/${skuInfo.id ? 'update' : 'save'}SkuInfo`, skuInfo)
  },

  /*
  获取指定SPU的id对应的图片列表
  */
  getSpuImageList (spuId) {
    return request.get(`/admin/product/spuImageList/${spuId}`)
  },

  /*
  获取指定SPU的id对应的销售属性列表
  */
  getSpuSaleAttrList (spuId) {
    return request.get(`/admin/product/spuSaleAttrList/${spuId}`)
  }
}
