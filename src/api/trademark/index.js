import request from '@/utils/request'
// 有关商品的请求接口
const api_name = '/admin/product/baseTrademark'
export default {

  //获取 所有品牌的数据
  gitTrademarkList(page,limit) {
    // 对象方式书写
    // return request({
    //   url: '/admin/product/baseTrademark/getTrademarkList',
    //   method: 'get'
    // })
    //字符串方式
    if(page&&limit){ //获取分页列表  和获取所有数据的合并了
      return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    }else{
      return request.get(`${api_name}/getTrademarkList`);
    }
  },

  //获取单个商品的信息
  //params:商品的ID
  gitTrademark(id){
    return request.get(`/admin/product/baseTrademark/get/${id}`)
  },

  //删除商品的信息
  //params : 删除品牌的ID
  remove(id){
    return request.delete(`/admin/product/baseTrademark/remove/${id}`)
  },

  //添加品牌信息
  //params: trademark 是包含商品信息的名字和logo 结构如下 不需要ID  ID是后台根据商品信息生成的
  /**
   * {
  "logoUrl": "string",
  "tmName": "string"
}
   */
  add(trademark){
    return request.post(`/admin/product/baseTrademark/save/`,trademark)
  },

  //修改品牌信息
  /**
   *
   * @param  treademark 包含商品ID,因为商品是根据商品ID来修改信息的
   *{
      "id": 0,
      "logoUrl": "string",
      "tmName": "string"
    }
   */
  update(treademark){
    return request.put(`/admin/product/baseTrademark/update/`,treademark)
  },

  //获取分页列表
  basemarkde(page,limit){
    return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
  }
}
