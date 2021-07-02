import { TechTransPage } from './app.po';

describe('TechTrans App', () => {
    let page: TechTransPage;

    beforeEach(() => {
        page = new TechTransPage();
    });

    it('欢迎使用精准营销后台管理平台！', () => {
        page.navigateTo();
        expect(page.getParagraphText()).toEqual('欢迎!');
    });
});
