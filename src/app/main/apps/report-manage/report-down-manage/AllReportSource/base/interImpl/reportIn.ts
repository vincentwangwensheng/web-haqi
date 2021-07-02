import {HttpCommonServiceService} from '../../../../../../../services/httpCommonService.service';

/** 这里继承HttpCommonServiceService 通用接口，再新增自己的接口，以便添加新的自己需要的接口，就不用在父接口里面添加东西了**/
export interface ReportIn extends  HttpCommonServiceService {

    dataTemplateExport(page, size, sort, search?, filter?, type? , itemIds?);

    getUserAuth(username);

    getBlocList(); // 拿到集团的列表做下拉选

    getMallList(); // 拿到商场的列表做下拉选

    getMouthList(); // 拿到月份数据
}

