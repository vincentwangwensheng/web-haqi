import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {SidebarService} from '../../../../../@fuse/components/sidebar/sidebar.service';
import {DataAnalyticsService} from '../../../../services/data-analytics.service';

@Component({
  selector: 'app-data-analytics',
  templateUrl: './data-analytics.component.html',
  styleUrls: ['./data-analytics.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DataAnalyticsComponent implements OnInit {

    testDataList = {
        "cellset": [
            [{
                "value": "XF DATEKEY",
                "type": "ROW_HEADER_HEADER",
                "properties": {
                    "hierarchy": "[日期表.XF DATEKEY]",
                    "dimension": "日期表",
                    "level": "[日期表.XF DATEKEY].[XF DATEKEY]"
                }
            }, {
                "value": "销售金额",
                "type": "COLUMN_HEADER",
                "properties": {
                    "uniquename": "[Measures].[销售金额]",
                    "hierarchy": "[Measures]",
                    "dimension": "Measures",
                    "level": "[Measures].[MeasuresLevel]"
                }
            }],
            [{
                "value": "20180101",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF DATEKEY].[20180101]",
                    "hierarchy": "[日期表.XF DATEKEY]",
                    "dimension": "日期表",
                    "level": "[日期表.XF DATEKEY].[XF DATEKEY]"
                }
            }, {
                "value": "71,109.1",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:0",
                    "raw": "71109.1"
                }
            }],
            [{
                "value": "20180102",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF DATEKEY].[20180102]",
                    "hierarchy": "[日期表.XF DATEKEY]",
                    "dimension": "日期表",
                    "level": "[日期表.XF DATEKEY].[XF DATEKEY]"
                }
            }, {
                "value": "13,728.45",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:1",
                    "raw": "13728.45"
                }
            }],
            [{
                "value": "20180103",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF DATEKEY].[20180103]",
                    "hierarchy": "[日期表.XF DATEKEY]",
                    "dimension": "日期表",
                    "level": "[日期表.XF DATEKEY].[XF DATEKEY]"
                }
            }, {
                "value": "8,636.2",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:2",
                    "raw": "8636.2"
                }
            }],
            [{
                "value": "20180104",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF DATEKEY].[20180104]",
                    "hierarchy": "[日期表.XF DATEKEY]",
                    "dimension": "日期表",
                    "level": "[日期表.XF DATEKEY].[XF DATEKEY]"
                }
            }, {
                "value": "5,450.75",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:3",
                    "raw": "5450.75"
                }
            }],
            [{
                "value": "20180105",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF DATEKEY].[20180105]",
                    "hierarchy": "[日期表.XF DATEKEY]",
                    "dimension": "日期表",
                    "level": "[日期表.XF DATEKEY].[XF DATEKEY]"
                }
            }, {
                "value": "9,694.35",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:4",
                    "raw": "9694.35"
                }
            }]
        ],
        "rowTotalsLists": [
            [{
                "cells": [],
                "captions": null,
                "span": 5,
                "width": 5
            }],
            [{
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }]
        ],
        "colTotalsLists": [
            [{
                "cells": [],
                "captions": ["销售金额"],
                "span": 1,
                "width": 1
            }],
            [{
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }]
        ],
        "runtime": 38,
        "error": null,
        "height": 6,
        "width": 2,
        "query": {
            "queryModel": {
                "axes": {
                    "FILTER": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "FILTER",
                        "hierarchies": [],
                        "nonEmpty": false,
                        "aggregators": []
                    },
                    "COLUMNS": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "COLUMNS",
                        "hierarchies": [],
                        "nonEmpty": true,
                        "aggregators": []
                    },
                    "ROWS": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "ROWS",
                        "hierarchies": [{
                            "mdx": null,
                            "filters": [],
                            "sortOrder": null,
                            "sortEvaluationLiteral": null,
                            "hierarchizeMode": null,
                            "name": "[日期表.XF DATEKEY]",
                            "caption": "XF DATEKEY",
                            "dimension": "日期表",
                            "levels": {
                                "XF DATEKEY": {
                                    "mdx": null,
                                    "filters": [],
                                    "name": "XF DATEKEY",
                                    "caption": "XF DATEKEY",
                                    "selection": {
                                        "type": "INCLUSION",
                                        "members": [{
                                            "name": "20171001",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171001]",
                                            "caption": "20171001",
                                            "type": null
                                        }, {
                                            "name": "20171002",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171002]",
                                            "caption": "20171002",
                                            "type": null
                                        }, {
                                            "name": "20171003",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171003]",
                                            "caption": "20171003",
                                            "type": null
                                        }, {
                                            "name": "20171004",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171004]",
                                            "caption": "20171004",
                                            "type": null
                                        }, {
                                            "name": "20171005",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171005]",
                                            "caption": "20171005",
                                            "type": null
                                        }, {
                                            "name": "20171006",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171006]",
                                            "caption": "20171006",
                                            "type": null
                                        }, {
                                            "name": "20171007",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171007]",
                                            "caption": "20171007",
                                            "type": null
                                        }, {
                                            "name": "20171008",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171008]",
                                            "caption": "20171008",
                                            "type": null
                                        }, {
                                            "name": "20171009",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171009]",
                                            "caption": "20171009",
                                            "type": null
                                        }, {
                                            "name": "20171010",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171010]",
                                            "caption": "20171010",
                                            "type": null
                                        }, {
                                            "name": "20171011",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171011]",
                                            "caption": "20171011",
                                            "type": null
                                        }, {
                                            "name": "20171012",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171012]",
                                            "caption": "20171012",
                                            "type": null
                                        }, {
                                            "name": "20171013",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171013]",
                                            "caption": "20171013",
                                            "type": null
                                        }, {
                                            "name": "20171014",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171014]",
                                            "caption": "20171014",
                                            "type": null
                                        }, {
                                            "name": "20171015",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171015]",
                                            "caption": "20171015",
                                            "type": null
                                        }, {
                                            "name": "20171016",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171016]",
                                            "caption": "20171016",
                                            "type": null
                                        }, {
                                            "name": "20171017",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171017]",
                                            "caption": "20171017",
                                            "type": null
                                        }, {
                                            "name": "20171018",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171018]",
                                            "caption": "20171018",
                                            "type": null
                                        }, {
                                            "name": "20171019",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171019]",
                                            "caption": "20171019",
                                            "type": null
                                        }, {
                                            "name": "20171020",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171020]",
                                            "caption": "20171020",
                                            "type": null
                                        }, {
                                            "name": "20171021",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171021]",
                                            "caption": "20171021",
                                            "type": null
                                        }, {
                                            "name": "20171022",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171022]",
                                            "caption": "20171022",
                                            "type": null
                                        }, {
                                            "name": "20171023",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171023]",
                                            "caption": "20171023",
                                            "type": null
                                        }, {
                                            "name": "20171024",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171024]",
                                            "caption": "20171024",
                                            "type": null
                                        }, {
                                            "name": "20171025",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171025]",
                                            "caption": "20171025",
                                            "type": null
                                        }, {
                                            "name": "20171026",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171026]",
                                            "caption": "20171026",
                                            "type": null
                                        }, {
                                            "name": "20171027",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171027]",
                                            "caption": "20171027",
                                            "type": null
                                        }, {
                                            "name": "20171028",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171028]",
                                            "caption": "20171028",
                                            "type": null
                                        }, {
                                            "name": "20171029",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171029]",
                                            "caption": "20171029",
                                            "type": null
                                        }, {
                                            "name": "20171030",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171030]",
                                            "caption": "20171030",
                                            "type": null
                                        }, {
                                            "name": "20171031",
                                            "uniqueName": "[日期表.XF DATEKEY].[20171031]",
                                            "caption": "20171031",
                                            "type": null
                                        }],
                                        "parameterName": "日期"
                                    },
                                    "aggregators": ["nil"],
                                    "measureAggregators": []
                                }
                            },
                            "cmembers": {}
                        }],
                        "nonEmpty": true,
                        "aggregators": []
                    }
                },
                "visualTotals": false,
                "visualTotalsPattern": null,
                "lowestLevelsOnly": false,
                "details": {
                    "axis": "COLUMNS",
                    "location": "BOTTOM",
                    "measures": [{
                        "name": "销售金额",
                        "uniqueName": "[Measures].[销售金额]",
                        "caption": "销售金额",
                        "type": "EXACT",
                        "aggregators": []
                    }]
                },
                "calculatedMeasures": [],
                "calculatedMembers": []
            },
            "cube": {
                "uniqueName": "[NewSalesCube].[NewSalesCube].[NewSalesCube].[NewSalesCube]",
                "name": "NewSalesCube",
                "connection": "NewSalesCube",
                "catalog": "NewSalesCube",
                "schema": "NewSalesCube",
                "caption": null,
                "visible": false
            },
            "mdx": "WITH\nSET [~ROWS] AS\n    {[日期表.XF DATEKEY].[20180101], [日期表.XF DATEKEY].[20180102], [日期表.XF DATEKEY].[20180103], [日期表.XF DATEKEY].[20180104], [日期表.XF DATEKEY].[20180105]}\nSELECT\nNON EMPTY {[Measures].[销售金额]} ON COLUMNS,\nNON EMPTY [~ROWS] ON ROWS\nFROM [NewSalesCube]",
            "name": "d4ad3a34-6311-492b-a6a5-fca14fa8775c",
            "parameters": {
                "日期": "20180101,20180102,20180103,20180104,20180105"
            },
            "plugins": {},
            "properties": {
                "saiku.olap.query.automatic_execution": true,
                "saiku.olap.query.nonempty": true,
                "saiku.olap.query.nonempty.rows": true,
                "saiku.olap.query.nonempty.columns": true,
                "saiku.ui.render.mode": "chart",
                "saiku.olap.query.filter": true,
                "saiku.olap.result.formatter": "flattened",
                "org.saiku.query.explain": true,
                "saiku.olap.query.drillthrough": true,
                "org.saiku.connection.scenario": false,
                "saiku.ui.render.type": "line",
                "saiku.ui.map.options": {
                    "mapDefinition": {}
                }
            },
            "metadata": {},
            "queryType": "OLAP",
            "type": "QUERYMODEL"
        },
        "topOffset": 1,
        "leftOffset": 1
    };
    testYearDataList = {
        "cellset": [
            [{
                "value": "XF MONTHCN",
                "type": "ROW_HEADER_HEADER",
                "properties": {
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "销售金额",
                "type": "COLUMN_HEADER",
                "properties": {
                    "uniquename": "[Measures].[销售金额]",
                    "hierarchy": "[Measures]",
                    "dimension": "Measures",
                    "level": "[Measures].[MeasuresLevel]"
                }
            }],
            [{
                "value": "一月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[一月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "876,934.66",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:0",
                    "raw": "876934.66"
                }
            }],
            [{
                "value": "七月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[七月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "4,493,394.03",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:1",
                    "raw": "4493394.03"
                }
            }],
            [{
                "value": "三月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[三月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "2,073,053.09",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:2",
                    "raw": "2073053.09"
                }
            }],
            [{
                "value": "九月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[九月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "12,132,897.13",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:3",
                    "raw": "1.213289713E7"
                }
            }],
            [{
                "value": "二月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[二月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "1,221,202.15",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:4",
                    "raw": "1221202.15"
                }
            }],
            [{
                "value": "五月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[五月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "2,685,662.53",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:5",
                    "raw": "2685662.53"
                }
            }],
            [{
                "value": "八月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[八月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "16,021,104.94",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:6",
                    "raw": "1.602110494E7"
                }
            }],
            [{
                "value": "六月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[六月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "3,216,404.65",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:7",
                    "raw": "3216404.65"
                }
            }],
            [{
                "value": "十一月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[十一月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "6,869,225.77",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:8",
                    "raw": "6869225.77"
                }
            }],
            [{
                "value": "十二月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[十二月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "5,131,553.36",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:9",
                    "raw": "5131553.36"
                }
            }],
            [{
                "value": "十月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[十月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "9,661,793.1",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:10",
                    "raw": "9661793.1"
                }
            }],
            [{
                "value": "四月",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF MONTHCN].[四月]",
                    "hierarchy": "[日期表.XF MONTHCN]",
                    "dimension": "日期表",
                    "level": "[日期表.XF MONTHCN].[XF MONTHCN]"
                }
            }, {
                "value": "2,418,235.34",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:11",
                    "raw": "2418235.34"
                }
            }]
        ],
        "rowTotalsLists": [
            [{
                "cells": [],
                "captions": null,
                "span": 12,
                "width": 12
            }],
            [{
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }]
        ],
        "colTotalsLists": [
            [{
                "cells": [],
                "captions": ["销售金额"],
                "span": 1,
                "width": 1
            }],
            [{
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }]
        ],
        "runtime": 21,
        "error": null,
        "height": 13,
        "width": 2,
        "query": {
            "queryModel": {
                "axes": {
                    "FILTER": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "FILTER",
                        "hierarchies": [{
                            "mdx": null,
                            "filters": [],
                            "sortOrder": null,
                            "sortEvaluationLiteral": null,
                            "hierarchizeMode": null,
                            "name": "[日期表.年]",
                            "caption": "年",
                            "dimension": "日期表",
                            "levels": {
                                "年": {
                                    "mdx": null,
                                    "filters": [],
                                    "name": "年",
                                    "caption": "年",
                                    "selection": {
                                        "type": "INCLUSION",
                                        "members": [{
                                            "name": "2018",
                                            "uniqueName": "[日期表.年].[2018]",
                                            "caption": "2018",
                                            "type": null
                                        }],
                                        "parameterName": "year"
                                    },
                                    "aggregators": ["nil"],
                                    "measureAggregators": []
                                }
                            },
                            "cmembers": {}
                        }],
                        "nonEmpty": false,
                        "aggregators": []
                    },
                    "COLUMNS": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "COLUMNS",
                        "hierarchies": [],
                        "nonEmpty": true,
                        "aggregators": []
                    },
                    "ROWS": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "ROWS",
                        "hierarchies": [{
                            "mdx": null,
                            "filters": [],
                            "sortOrder": null,
                            "sortEvaluationLiteral": null,
                            "hierarchizeMode": null,
                            "name": "[日期表.XF MONTHCN]",
                            "caption": "XF MONTHCN",
                            "dimension": "日期表",
                            "levels": {
                                "XF MONTHCN": {
                                    "mdx": null,
                                    "filters": [],
                                    "name": "XF MONTHCN",
                                    "caption": "XF MONTHCN",
                                    "selection": {
                                        "type": "INCLUSION",
                                        "members": [],
                                        "parameterName": null
                                    },
                                    "aggregators": [],
                                    "measureAggregators": []
                                }
                            },
                            "cmembers": {}
                        }],
                        "nonEmpty": true,
                        "aggregators": []
                    }
                },
                "visualTotals": false,
                "visualTotalsPattern": null,
                "lowestLevelsOnly": false,
                "details": {
                    "axis": "COLUMNS",
                    "location": "BOTTOM",
                    "measures": [{
                        "name": "销售金额",
                        "uniqueName": "[Measures].[销售金额]",
                        "caption": "销售金额",
                        "type": "EXACT",
                        "aggregators": []
                    }]
                },
                "calculatedMeasures": [],
                "calculatedMembers": []
            },
            "cube": {
                "uniqueName": "[NewSalesCube].[NewSalesCube].[NewSalesCube].[NewSalesCube]",
                "name": "NewSalesCube",
                "connection": "NewSalesCube",
                "catalog": "NewSalesCube",
                "schema": "NewSalesCube",
                "caption": null,
                "visible": false
            },
            "mdx": "WITH\nSET [~FILTER] AS\n    {[日期表.年].[2018]}\nSET [~ROWS] AS\n    {[日期表.XF MONTHCN].[XF MONTHCN].Members}\nSELECT\nNON EMPTY {[Measures].[销售金额]} ON COLUMNS,\nNON EMPTY [~ROWS] ON ROWS\nFROM [NewSalesCube]\nWHERE [~FILTER]",
            "name": "f21b73dd-5d3b-43be-bbd4-19ce921bc884",
            "parameters": {
                "year": "[2018]"
            },
            "plugins": {},
            "properties": {
                "saiku.olap.query.automatic_execution": true,
                "saiku.olap.query.nonempty": true,
                "saiku.olap.query.nonempty.rows": true,
                "saiku.olap.query.nonempty.columns": true,
                "saiku.ui.render.mode": "chart",
                "saiku.olap.query.filter": true,
                "saiku.olap.result.formatter": "flattened",
                "org.saiku.query.explain": true,
                "saiku.olap.query.drillthrough": true,
                "org.saiku.connection.scenario": false,
                "saiku.ui.render.type": "line",
                "saiku.ui.map.options": {
                    "mapDefinition": {}
                }
            },
            "metadata": {},
            "queryType": "OLAP",
            "type": "QUERYMODEL"
        },
        "topOffset": 1,
        "leftOffset": 1
    };
    testYearWeekDataList = {
        "cellset": [
            [{
                "value": "XF WEEKOFYEAR",
                "type": "ROW_HEADER_HEADER",
                "properties": {
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "年",
                "type": "ROW_HEADER_HEADER",
                "properties": {
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "销售金额",
                "type": "COLUMN_HEADER",
                "properties": {
                    "uniquename": "[Measures].[销售金额]",
                    "hierarchy": "[Measures]",
                    "dimension": "Measures",
                    "level": "[Measures].[MeasuresLevel]"
                }
            }],
            [{
                "value": "1",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[1]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "137,994.5",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:0",
                    "raw": "137994.5"
                }
            }],
            [{
                "value": "2",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[2]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "103,343.25",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:1",
                    "raw": "103343.25"
                }
            }],
            [{
                "value": "3",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[3]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "135,205.6",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:2",
                    "raw": "135205.6"
                }
            }],
            [{
                "value": "4",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[4]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "96,285.5",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:3",
                    "raw": "96285.5"
                }
            }],
            [{
                "value": "5",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[5]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "495,843.81",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:4",
                    "raw": "495843.81"
                }
            }],
            [{
                "value": "6",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[6]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "128,653",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:5",
                    "raw": "128653.0"
                }
            }],
            [{
                "value": "7",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[7]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "220,579.5",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:6",
                    "raw": "220579.5"
                }
            }],
            [{
                "value": "8",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[8]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "248,340.5",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:7",
                    "raw": "248340.5"
                }
            }],
            [{
                "value": "9",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[9]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "871,903.15",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:8",
                    "raw": "871903.15"
                }
            }],
            [{
                "value": "10",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[10]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "406,726.36",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:9",
                    "raw": "406726.36"
                }
            }],
            [{
                "value": "11",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[11]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "472,298.74",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:10",
                    "raw": "472298.74"
                }
            }],
            [{
                "value": "12",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[12]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "395,703.13",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:11",
                    "raw": "395703.13"
                }
            }],
            [{
                "value": "13",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[13]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "544,758.38",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:12",
                    "raw": "544758.38"
                }
            }],
            [{
                "value": "14",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[14]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "438,637.77",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:13",
                    "raw": "438637.77"
                }
            }],
            [{
                "value": "15",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[15]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "300,764.76",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:14",
                    "raw": "300764.76"
                }
            }],
            [{
                "value": "16",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[16]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "474,766.47",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:15",
                    "raw": "474766.47"
                }
            }],
            [{
                "value": "17",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[17]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "715,502.32",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:16",
                    "raw": "715502.32"
                }
            }],
            [{
                "value": "18",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[18]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,042,061.85",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:17",
                    "raw": "1042061.85"
                }
            }],
            [{
                "value": "19",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[19]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "606,603.57",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:18",
                    "raw": "606603.57"
                }
            }],
            [{
                "value": "20",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[20]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "567,596.05",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:19",
                    "raw": "567596.05"
                }
            }],
            [{
                "value": "21",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[21]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "619,185.76",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:20",
                    "raw": "619185.76"
                }
            }],
            [{
                "value": "22",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[22]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "643,439.34",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:21",
                    "raw": "643439.34"
                }
            }],
            [{
                "value": "23",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[23]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "608,779.58",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:22",
                    "raw": "608779.58"
                }
            }],
            [{
                "value": "24",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[24]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "809,260.82",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:23",
                    "raw": "809260.82"
                }
            }],
            [{
                "value": "25",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[25]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "678,790.75",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:24",
                    "raw": "678790.75"
                }
            }],
            [{
                "value": "26",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[26]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,002,657.9",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:25",
                    "raw": "1002657.9"
                }
            }],
            [{
                "value": "27",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[27]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "991,796.69",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:26",
                    "raw": "991796.69"
                }
            }],
            [{
                "value": "28",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[28]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,054,505.47",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:27",
                    "raw": "1054505.47"
                }
            }],
            [{
                "value": "29",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[29]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "936,011.92",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:28",
                    "raw": "936011.92"
                }
            }],
            [{
                "value": "30",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[30]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,043,996.7",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:29",
                    "raw": "1043996.7"
                }
            }],
            [{
                "value": "31",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[31]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "2,918,988.32",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:30",
                    "raw": "2918988.32"
                }
            }],
            [{
                "value": "32",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[32]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "3,633,522.15",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:31",
                    "raw": "3633522.15"
                }
            }],
            [{
                "value": "33",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[33]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "4,240,317.62",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:32",
                    "raw": "4240317.62"
                }
            }],
            [{
                "value": "34",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[34]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "3,307,692.88",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:33",
                    "raw": "3307692.88"
                }
            }],
            [{
                "value": "35",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[35]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "3,116,734.36",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:34",
                    "raw": "3116734.36"
                }
            }],
            [{
                "value": "36",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[36]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "2,500,365.99",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:35",
                    "raw": "2500365.99"
                }
            }],
            [{
                "value": "37",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[37]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "2,493,015.51",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:36",
                    "raw": "2493015.51"
                }
            }],
            [{
                "value": "38",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[38]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "3,221,472.31",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:37",
                    "raw": "3221472.31"
                }
            }],
            [{
                "value": "39",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[39]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "2,914,786.24",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:38",
                    "raw": "2914786.24"
                }
            }],
            [{
                "value": "40",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[40]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "3,169,144.76",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:39",
                    "raw": "3169144.76"
                }
            }],
            [{
                "value": "41",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[41]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,144,383.79",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:40",
                    "raw": "1144383.79"
                }
            }],
            [{
                "value": "42",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[42]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,249,689.43",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:41",
                    "raw": "1249689.43"
                }
            }],
            [{
                "value": "43",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[43]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,388,679.99",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:42",
                    "raw": "1388679.99"
                }
            }],
            [{
                "value": "44",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[44]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "3,743,352.92",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:43",
                    "raw": "3743352.92"
                }
            }],
            [{
                "value": "45",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[45]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,224,365.6",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:44",
                    "raw": "1224365.6"
                }
            }],
            [{
                "value": "46",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[46]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "929,755.01",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:45",
                    "raw": "929755.01"
                }
            }],
            [{
                "value": "47",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[47]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,182,645.2",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:46",
                    "raw": "1182645.2"
                }
            }],
            [{
                "value": "48",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[48]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "2,907,994.46",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:47",
                    "raw": "2907994.46"
                }
            }],
            [{
                "value": "49",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[49]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "494,704.9",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:48",
                    "raw": "494704.9"
                }
            }],
            [{
                "value": "50",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[50]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "822,694.58",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:49",
                    "raw": "822694.58"
                }
            }],
            [{
                "value": "51",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[51]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "857,965.29",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:50",
                    "raw": "857965.29"
                }
            }],
            [{
                "value": "52",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[52]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,028,432.81",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:51",
                    "raw": "1028432.81"
                }
            }],
            [{
                "value": "53",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.XF WEEKOFYEAR].[53]",
                    "hierarchy": "[日期表.XF WEEKOFYEAR]",
                    "dimension": "日期表",
                    "level": "[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR]"
                }
            }, {
                "value": "2018",
                "type": "ROW_HEADER",
                "properties": {
                    "uniquename": "[日期表.年].[2018]",
                    "hierarchy": "[日期表.年]",
                    "dimension": "日期表",
                    "level": "[日期表.年].[年]"
                }
            }, {
                "value": "1,518,763.49",
                "type": "DATA_CELL",
                "properties": {
                    "position": "0:52",
                    "raw": "1518763.49"
                }
            }]
        ],
        "rowTotalsLists": [
            [{
                "cells": [],
                "captions": null,
                "span": 106,
                "width": 53
            }],
            [{
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }, {
                "cells": [
                    [{
                        "value": "-",
                        "type": "DATA_CELL",
                        "properties": {}
                    }]
                ],
                "captions": null,
                "span": 1,
                "width": 1
            }],
            [{
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }, {
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }]
        ],
        "colTotalsLists": [
            [{
                "cells": [],
                "captions": ["销售金额"],
                "span": 1,
                "width": 1
            }],
            [{
                "cells": [],
                "captions": null,
                "span": 1,
                "width": 0
            }]
        ],
        "runtime": 44,
        "error": null,
        "height": 54,
        "width": 3,
        "query": {
            "queryModel": {
                "axes": {
                    "FILTER": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "FILTER",
                        "hierarchies": [],
                        "nonEmpty": false,
                        "aggregators": []
                    },
                    "COLUMNS": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "COLUMNS",
                        "hierarchies": [],
                        "nonEmpty": true,
                        "aggregators": []
                    },
                    "ROWS": {
                        "mdx": null,
                        "filters": [],
                        "sortOrder": null,
                        "sortEvaluationLiteral": null,
                        "hierarchizeMode": null,
                        "location": "ROWS",
                        "hierarchies": [{
                            "mdx": null,
                            "filters": [],
                            "sortOrder": null,
                            "sortEvaluationLiteral": null,
                            "hierarchizeMode": null,
                            "name": "[日期表.XF WEEKOFYEAR]",
                            "caption": "XF WEEKOFYEAR",
                            "dimension": "日期表",
                            "levels": {
                                "XF WEEKOFYEAR": {
                                    "mdx": null,
                                    "filters": [],
                                    "name": "XF WEEKOFYEAR",
                                    "caption": "XF WEEKOFYEAR",
                                    "selection": {
                                        "type": "INCLUSION",
                                        "members": [],
                                        "parameterName": "week"
                                    },
                                    "aggregators": ["nil"],
                                    "measureAggregators": []
                                }
                            },
                            "cmembers": {}
                        }, {
                            "mdx": null,
                            "filters": [],
                            "sortOrder": null,
                            "sortEvaluationLiteral": null,
                            "hierarchizeMode": null,
                            "name": "[日期表.年]",
                            "caption": "年",
                            "dimension": "日期表",
                            "levels": {
                                "年": {
                                    "mdx": null,
                                    "filters": [],
                                    "name": "年",
                                    "caption": "年",
                                    "selection": {
                                        "type": "INCLUSION",
                                        "members": [],
                                        "parameterName": "weekyear"
                                    },
                                    "aggregators": ["nil"],
                                    "measureAggregators": []
                                }
                            },
                            "cmembers": {}
                        }],
                        "nonEmpty": true,
                        "aggregators": []
                    }
                },
                "visualTotals": false,
                "visualTotalsPattern": null,
                "lowestLevelsOnly": false,
                "details": {
                    "axis": "COLUMNS",
                    "location": "BOTTOM",
                    "measures": [{
                        "name": "销售金额",
                        "uniqueName": "[Measures].[销售金额]",
                        "caption": "销售金额",
                        "type": "EXACT",
                        "aggregators": []
                    }]
                },
                "calculatedMeasures": [],
                "calculatedMembers": []
            },
            "cube": {
                "uniqueName": "[NewSalesCube].[NewSalesCube].[NewSalesCube].[NewSalesCube]",
                "name": "NewSalesCube",
                "connection": "NewSalesCube",
                "catalog": "NewSalesCube",
                "schema": "NewSalesCube",
                "caption": null,
                "visible": false
            },
            "mdx": "WITH\nSET [~ROWS_日期表_日期表.XF WEEKOFYEAR] AS\n    {[日期表.XF WEEKOFYEAR].[XF WEEKOFYEAR].Members}\nSET [~ROWS_日期表_日期表.年] AS\n    {[日期表.年].[2018]}\nSELECT\nNON EMPTY {[Measures].[销售金额]} ON COLUMNS,\nNON EMPTY NonEmptyCrossJoin([~ROWS_日期表_日期表.XF WEEKOFYEAR], [~ROWS_日期表_日期表.年]) ON ROWS\nFROM [NewSalesCube]",
            "name": "64555b59-26b3-431f-af56-d1f49640a490",
            "parameters": {
                "week": "",
                "weekyear": "[2018]"
            },
            "plugins": {},
            "properties": {
                "saiku.olap.query.automatic_execution": true,
                "saiku.olap.query.nonempty": true,
                "saiku.olap.query.nonempty.rows": true,
                "saiku.olap.query.nonempty.columns": true,
                "saiku.ui.render.mode": "chart",
                "saiku.olap.query.filter": true,
                "saiku.olap.result.formatter": "flattened",
                "org.saiku.query.explain": true,
                "saiku.olap.query.drillthrough": true,
                "org.saiku.connection.scenario": false,
                "saiku.ui.render.type": "line",
                "saiku.ui.map.options": {
                    "mapDefinition": {}
                }
            },
            "metadata": {},
            "queryType": "OLAP",
            "type": "QUERYMODEL"
        },
        "topOffset": 1,
        "leftOffset": 2
    };
    widgets: any;
    widget1SelectedYear = '2016';
    widget5SelectedDay = '2019';
    dataList = {};
    // x轴坐标数组
    xAxis = [];
    // y轴坐标数组
    yAxis = [];

    /**
     * Constructor
     *
     * @param {AnalyticsDashboardService} _analyticsDashboardService
     */
    constructor(private _fuseSidebarService: SidebarService, private dataAnalyticsService: DataAnalyticsService) {
        // Register the custom chart.js plugin
        this._registerCustomChartJSPlugin();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.widgets = {

            widget5: {
                chartType: 'line',
                datasets: {
                    '2018': [
                        {
                            label: 'value',
                            data: '',
                            fill: 'start'

                        },
                    ],
                    '2019': [
                        {
                            label: 'value',
                            data: '',
                            fill: 'start'
                        },
                    ]

                },
                // labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
                labels: '',
                colors: [
                    {
                        borderColor: '#3949ab',
                        // backgroundColor: '#3949ab',
                        pointBackgroundColor: '#3949ab',
                        // pointHoverBackgroundColor: '#3949ab',
                        pointBorderColor: '#ffffff',
                        pointHoverBorderColor: '#ffffff'
                    },
                    {
                        borderColor: 'rgba(30, 136, 229, 0.87)',
                        // backgroundColor: 'rgba(30, 136, 229, 0.87)',
                        pointBackgroundColor: 'rgba(30, 136, 229, 0.87)',
                        // pointHoverBackgroundColor: 'rgba(30, 136, 229, 0.87)',
                        pointBorderColor: '#ffffff',
                        pointHoverBorderColor: '#ffffff'
                    }
                ],
                options: {
                    spanGaps: false,
                    legend: {
                        display: false
                    },
                    maintainAspectRatio: false,
                    tooltips: {
                        position: 'nearest',
                        mode: 'index',
                        intersect: false
                    },
                    layout: {
                        padding: {
                            left: 24,
                            right: 32
                        }
                    },
                    elements: {
                        point: {
                            radius: 4,
                            borderWidth: 2,
                            hoverRadius: 4,
                            hoverBorderWidth: 2
                        },
                        line: {
                            tension: 0
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    fontColor: 'rgba(0,0,0,0.54)'
                                }
                            }
                        ],
                        yAxes: [
                            {
                                /*gridLines: {
                                    tickMarkLength: 16
                                },
                                ticks: {
                                    stepSize: 2000
                                }*/
                            }
                        ]
                    },
                    plugins: {
                        filler: {
                            propagate: false
                        }
                    }
                }
            },
        };
        // Get the widgets from the service

        // 调用查询数据方法
        this.serchData('20180101');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register a custom plugin
     */
    private _registerCustomChartJSPlugin(): void {
        (<any>window).Chart.plugins.register({
            afterDatasetsDraw: function (chart, easing): any {
                // Only activate the plugin if it's made available
                // in the options
                if (
                    !chart.options.plugins.xLabelsOnTop ||
                    (chart.options.plugins.xLabelsOnTop && chart.options.plugins.xLabelsOnTop.active === false)
                ) {
                    return;
                }

                // To only draw at the end of animation, check for easing === 1
                const ctx = chart.ctx;

                chart.data.datasets.forEach(function (dataset, i): any {
                    const meta = chart.getDatasetMeta(i);
                    if (!meta.hidden) {
                        meta.data.forEach(function (element, index): any {

                            // Draw the text in black, with the specified font
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                            const fontSize = 13;
                            const fontStyle = 'normal';
                            const fontFamily = 'Roboto, Helvetica Neue, Arial';
                            ctx.font = (<any>window).Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

                            // Just naively convert to string for now
                            const dataString = dataset.data[index].toString() + 'k';

                            // Make sure alignment settings are correct
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            const padding = 15;
                            const startY = 24;
                            const position = element.tooltipPosition();
                            ctx.fillText(dataString, position.x, startY);

                            ctx.save();

                            ctx.beginPath();
                            ctx.setLineDash([5, 3]);
                            ctx.moveTo(position.x, startY + padding);
                            ctx.lineTo(position.x, position.y - padding);
                            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                            ctx.stroke();
                            ctx.restore();
                        });
                    }
                });
            }
        });
    }

    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
    // 获取天数据
    serchData(val) {
        // alert(val + '触发成功！！！');
        this.xAxis = [];
        this.yAxis = [];
        this.dataList = this.testDataList;

      /*  this.dataAnalyticsService.searchData(val).subscribe((res) => {
           this.dataList = res['body'];
          } );*/
        this.parseJsonGetDaysData(this.dataList);
        this.setDataToAxes();
    }

    // 解析saiku中的json数据获取天数据
    parseJsonGetDaysData(jsonParam) {
        const cellsetJsonArray = jsonParam['cellset'];
        for (let i = 1; i < cellsetJsonArray.length; i++) {
            const dayArray = cellsetJsonArray[i];
            const dayXAxis = dayArray[0]['value'];
            this.xAxis[i - 1] = dayXAxis;
            const dayYAxis = (dayArray[1]['value']).replace(/,/g , '');
            this.yAxis[i - 1] = dayYAxis;
        }
    }
    // 将解析出的数据放入坐标轴上
    setDataToAxes() {
        const widget5Json = this.widgets['widget5'];
        const datasetsJson = widget5Json['datasets'];
        const todayJson = (datasetsJson['2019'])[0];
        widget5Json['labels'] = this.xAxis;
        const dataJson = todayJson['data'] = this.yAxis;
    }

    // 根据年份获取该年12个月份的数据
    searchYearData(val) {
        this.xAxis = [];
        this.yAxis = [];
        this.parseJsonGetYearData(this.testYearDataList);
        this.setDataToAxes();
    }

    // 解析saiku中的json数据获取年数据
    parseJsonGetYearData(jsonParam) {
        const cellsetJsonArray = jsonParam['cellset'];
        for (let i = 1; i < cellsetJsonArray.length; i++) {
            const yearArray = cellsetJsonArray[i];
            const yearXAxis = yearArray[0]['value'];
            if ('一月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[0] = dayYAxis;
                this.xAxis[0] = '一月';
            }else if ('二月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[1] = dayYAxis;
                this.xAxis[1] = '二月';
            }else if ('三月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[2] = dayYAxis;
                this.xAxis[2] = '三月';
            }else if ('四月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[3] = dayYAxis;
                this.xAxis[3] = '四月';
            }else if ('五月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[4] = dayYAxis;
                this.xAxis[4] = '五月';
            }else if ('六月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[5] = dayYAxis;
                this.xAxis[5] = '六月';
            }else if ('七月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[6] = dayYAxis;
                this.xAxis[6] = '七月';
            }else if ('八月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[7] = dayYAxis;
                this.xAxis[7] = '八月';
            }else if ('九月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[8] = dayYAxis;
                this.xAxis[8] = '九月';
            }else if ('十月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[9] = dayYAxis;
                this.xAxis[9] = '十月';
            }else if ('十一月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[10] = dayYAxis;
                this.xAxis[10] = '十一月';
            }else if ('十二月' === yearXAxis) {
                const dayYAxis = (yearArray[1]['value']).replace(/,/g , '');
                this.yAxis[11] = dayYAxis;
                this.xAxis[11] = '十二月';
            }
        }
    }

    //  查询年份周数据
    searchYearWeekData(val) {
        this.xAxis = [];
        this.yAxis = [];
        this.parseJsonGetYearWeekData(this.testYearWeekDataList);
        this.setDataToAxes();
    }
    // 解析周查询数据
    parseJsonGetYearWeekData(jsonParam) {
        const cellsetJsonArray = jsonParam['cellset'];
        for (let i = 1; i < cellsetJsonArray.length; i++) {
            const yearWeekArray = cellsetJsonArray[i];
            const yearWeekXAxis1 = yearWeekArray[0]['value'];
            const yearWeekXAxis2 = yearWeekArray[1]['value'];
            const yearWeekYAxis = (yearWeekArray[2]['value']).replace(/,/g , '');
            this.xAxis[i - 1] = yearWeekXAxis1 + ':' + yearWeekXAxis2;
            this.yAxis[i - 1] = yearWeekYAxis;
        }
    }
}
