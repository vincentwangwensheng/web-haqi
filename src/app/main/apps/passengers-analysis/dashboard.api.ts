export const dashboardApi = {
    appletUserInfo: 'backend/api/report/applet/user', // 柱状图：访问人户，新增用户，老用户
    appletChartLine: 'backend/api/report/applet/user/chart', // 小程序统计--图表趋势(复用):访问人户，访问次数，访问时长
    appletChartActive: 'backend/api/report/applet/user/active', // 小程序统计--用户活跃(日、周)
    appletTerminal: 'backend/api/report/applet/terminal', // 小程序统计--终端

    memberTotalSalesActivity: 'backend/api/report/member/info', // 会员累计+销售+活跃
    memberRolePercent: 'backend/api/report/member/form', // 会员组成性别占比+等级结构
    memberRegister: 'backend/api/report/member/register', // 会员注册人数
    memberTagAge: 'backend/api/report/member/tag', // 会员价值+会员年龄

    getMallList: 'backend/api/get-mall-list', // 商场
};
