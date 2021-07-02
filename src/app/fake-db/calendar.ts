import {
    startOfDay,
    subDays,
    addDays,
    endOfMonth,
    addHours
} from 'date-fns';

export class CalendarFakeDb {

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
                        marketingTarget: '测试一个三天的活动计划',
                        marketingForm: '采用发放优惠券的方式',
                        marketingBudget: '10000000'
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
                        marketingTarget: '测试一个长期活动计划',
                        marketingForm: '采用发放优惠券的方式',
                        marketingBudget: '10000000'
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
                        marketingTarget: '测试一个持续2月的活动计划',
                        marketingForm: '采用发放优惠券的方式',
                        marketingBudget: '99999999'
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
                        marketingTarget: '测试一下',
                        marketingForm: '采用发放优惠券的方式',
                        marketingBudget: '99999'
                    }
                }
            ]
        }
    ];
}
