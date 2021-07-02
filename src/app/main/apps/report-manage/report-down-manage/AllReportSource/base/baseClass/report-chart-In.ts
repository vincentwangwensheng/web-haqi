
/** 报表通用方法  **/
export abstract class ReportChartIn {

    /** 拿到表单对象 **/
    getFormGroup(){
        return null;
    }
    /** 拿到需要生成的表单的参数 **/
    getFormKeys(){
        return null;
    }
    /** 拿到右侧报表列表的实体对象 **/
    getRightDataList(){
        return null;
    }

    /** 根据参数获取其他数据 ， 可以用来查询额外的数据 **/
    getOtherData(param){
        return null ;
    }
}
