
/** 这是一共公共的接口类，其他页面的接口实现这个接口的方法~，目前只有增删改查**/
export interface HttpCommonServiceService {
    getDataList(page, size, sort, search?, filter?);

    getDataById(id);

    createData(data);

    updateData(data);

    delData(id);

    getDataListOther(page, size, sort, search?, filter? , type? , itemIds?);

}

