import {
    startOfDay,
    subDays,
    addDays,
    endOfMonth,
    addHours
} from 'date-fns';

export class AppCalendarDB {

    public static data = [
        {
            id: 'events',
            data: [
                {
                    start: subDays(startOfDay(new Date()), 1),
                    end: addDays(new Date(), 1),
                    title: '三天的活动计划',
                    allDay: true,
                    color: {
                        primary: '#F44336',
                        secondary: '#FFCDD2'
                    },
                    meta: {
                        couDes: '测试一个三天的活动计划',
                        info: [
                            {id: 25 ,  name: 'R测试券2' , number: 'cf300665-e8a4-4820-9d37-1ef4f2d926a7' , source: '精准营销' ,
                                timeBegin:  '2020-02-26T00:00:00+08:00' , timeEnd: '2020-02-29T23:59:59+08:00' , selected: true},

                        ]
                    }
                },
                {
                    start: startOfDay(new Date()),
                    title: '没有结束时间的长期活动',
                    allDay: false,
                    color: {
                        primary: '#FF9800',
                        secondary: '#FFE0B2'
                    },
                    meta: {
                        couDes: '测试一个长期活动计划',
                        info: [
                            {id: 25 ,  name: 'R测试券2' , number: 'cf300665-e8a4-4820-9d37-1ef4f2d926a7' , source: '精准营销' ,
                                timeBegin:  '2020-02-26T00:00:00+08:00' , timeEnd: '2020-02-29T23:59:59+08:00' , selected: true},

                        ]
                    }
                },
                {
                    start: subDays(endOfMonth(new Date()), 3),
                    end: addDays(endOfMonth(new Date()), 3),
                    title: '长期活动持续2个月',
                    allDay: false,
                    color: {
                        primary: '#1E90FF',
                        secondary: '#D1E8FF'
                    },
                    meta: {
                        couDes: '测试一个持续2月的活动计划',
                        info: [
                            {id: 25 ,  name: 'R测试券2' , number: 'cf300665-e8a4-4820-9d37-1ef4f2d926a7' , source: '精准营销' ,
                                timeBegin:  '2020-02-26T00:00:00+08:00' , timeEnd: '2020-02-29T23:59:59+08:00' , selected: true},

                        ]
                    }
                },
                {
                    start: addHours(startOfDay(new Date()), 2),
                    end: new Date(),
                    title: '测试一下金额',
                    allDay: false,
                    color: {
                        primary: '#673AB7',
                        secondary: '#D1C4E9'
                    },
                    meta: {
                        couDes: '测试一下',
                        info: []
                    }
                }
            ]
        }
    ];
}
