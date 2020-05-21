//商品管理平台属性相关的接口请求
import request from '@/utils/request'

export default{
  //根据三级分类获取属性列表(就是当一二三级分类都存在时,根据这三个分类的id请求具体商品的属性)
  //用来显示在页面的下方
  getList(category1Id, category2Id, category3Id){
    return request(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
  },
  //根据ID删除对应的属性
  remove(id){
    return request.delete(`/admin/product/deleteAttr/${id}`)
  },
  //根据属性id获取属性列表
  getValueList (attrId) {
    return request(`/admin/product/getAttrValueList/${attrId}`)
  },
  //添加/更新属性
  //区别就是发生的请求参数有无id,有就是更新,没有就是添加\
  /**
   *
   * {
      "attrName": "string",
      "attrValueList": [
        {
          "attrId": 0,
          "id": 0,
          "valueName": "string"
        }
      ],
      "categoryId": 0,
      "categoryLevel": 0,
      "id": 0 //跟新时才存在Id
    }
   */
  addOrUpdate (attrInfo) {
    return request.post('/admin/product/saveAttrInfo', attrInfo)
  }
}
