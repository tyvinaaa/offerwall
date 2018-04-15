var currentData = [];
var resData;
//日期构造器
var dateController = function () {};
dateController.prototype = {
    getWeekDay(year, month, day) {
        var date = new Date(year, month, day);
        return date.getDay();
    },
    getMonthDays(year, month) {
        var date = new Date(year, month, 0);
        return date.getDate();
    },
    getDate() {
        this.now_date = new Date();
        this.now_year = this.now_date.getFullYear(); //获取年份
        this.now_month = this.now_date.getMonth() + 1; //获取月份，这里是月索引所以要+1
        this.now_day = this.now_date.getDate(); //获取当天是几号
        this.now_week = this.now_date.getDay(); ////获取当天是周几，返回0.周日   1.周一  2.周二  3.周三  4.周四  5.周五  6.周六
        this.now_weekstart = this.getWeekDay(this.now_year, this.now_month - 1, 1); //获取当月一号是周几
        this.now_monthdays = this.getMonthDays(this.now_year, this.now_month); //获取当月天数
    }
}
//日历vue实例
var calender = new Vue({
    el: '.container',
    data: {
        data: [], //当前渲染数据
        dataStack: [], //请求数据栈
        sendDateArr: [], //请求的周视图日期
        monthData: [], //请求的月视图日期
        monthDataStack: [],
        firstWeekDays: 0,
        panel: false, //位于哪个视图 false为月视图，true为周视图
        ifBackward: 1 //周视图往前往后标记
    },
    methods: {
        init() {
            this.dc = new dateController();
            this.dc.getDate();
            this.panel ? this.RenderMoreData(7) : this.RenderMoreDataByMonth(); //根据当前视图渲染
        },
        changeView() {
            this.dc.getDate();
            if (this.panel) {
                this.RenderMoreDataByMonth();
            } else {
                this.RenderMoreData(7);
            }
            this.panel = !this.panel;
        },
        //周视图往后加载
        RenderMoreData(k) {
            var dc = this.dc;
            var self = this;
            this.data = []; //清空显示数据
            this.sendDateArr = []; //发送的日期数据
            currentData = [];
            //往前转换为往后
            if (this.ifBackward == 0) {
                for (var i = 0; i < k; i++) {
                    dc.now_day = dc.now_day < 10 ? '0' + dc.now_day : dc.now_day;
                    (dc.now_week < 6 && dc.now_week >= 0) ? dc.now_week++: dc.now_week = 0;
                    if (dc.now_day < dc.now_monthdays) {
                        dc.now_day++;
                    } else {
                        if (dc.now_month == 12) {
                            dc.now_year++;
                            dc.now_month = 1;
                            dc.now_day = 1;
                        } else {
                            dc.now_month++;
                            dc.now_monthdays = dc.getMonthDays(dc.now_year, dc.now_month);
                            dc.now_day = 1;
                        }
                    }
                }
            }

            for (var i = 0; i < k; i++) {
                var oneData = {};
                dc.now_day = dc.now_day < 10 ? '0' + dc.now_day : dc.now_day;
                oneData.itemTime = dc.now_year + '-' + dc.now_month + '-' + dc.now_day;
                this.sendDateArr.push(oneData.itemTime);
                oneData.itemList = [];
                oneData.itemWeek = dc.now_week;
                (dc.now_week < 6 && dc.now_week >= 0) ? dc.now_week++: dc.now_week = 0;
                if (dc.now_day < dc.now_monthdays) {
                    dc.now_day++;
                } else {
                    if (dc.now_month == 12) {
                        dc.now_year++;
                        dc.now_month = 1;
                        dc.now_day = 1;
                    } else {
                        dc.now_month++;
                        dc.now_monthdays = dc.getMonthDays(dc.now_year, dc.now_month);
                        dc.now_day = 1;
                    }
                }
                currentData.push(oneData);
            }
            //请求数据
            var obj = {
                url: 'todolist/getData_new.php',
                data: {
                    date_arr: this.sendDateArr
                },
                success: function (data) {
                    console.log('周视图数据' + data);
                    resData = JSON.parse(data).resData;
                    self.tranformData(resData);
                }
            };
            wlbPostData(obj);
            this.ifBackward = 1;
        },
        //周视图往前加载
        RenderMoreDataForward(k) {
            var dc = this.dc;
            var self = this;
            this.data = []; //清空显示数据
            this.sendDateArr = []; //发送的日期数据
            currentData = [];
            //往后转换为往前
            if (this.ifBackward == 1) {
                for (var i = 0; i < k; i++) {
                    if (dc.now_day > 1) {
                        dc.now_day--;
                    } else {
                        if (dc.now_month == 1) {
                            dc.now_year--;
                            dc.now_month = 12;
                        } else {
                            dc.now_month--;
                        }
                        dc.now_monthdays = dc.getMonthDays(dc.now_year, dc.now_month);
                        dc.now_day = dc.now_monthdays;
                    }
                }
            };
            for (var i = 0; i < k; i++) {
                if (dc.now_day > 1) {
                    dc.now_day--;
                } else {
                    if (dc.now_month == 1) {
                        dc.now_year--;
                        dc.now_month = 12;
                    } else {
                        dc.now_month--;
                    }
                    dc.now_monthdays = dc.getMonthDays(dc.now_year, dc.now_month);
                    dc.now_day = dc.now_monthdays;
                }
                var oneData = {};
                (dc.now_week <= 6 && dc.now_week > 0) ? dc.now_week--: dc.now_week = 6;
                dc.now_day = dc.now_day < 10 ? '0' + dc.now_day : dc.now_day;
                oneData.itemTime = dc.now_year + '-' + dc.now_month + '-' + dc.now_day;
                this.sendDateArr.push(oneData.itemTime);
                oneData.itemList = [];
                oneData.itemWeek = dc.now_week;
                currentData.push(oneData);
            };

            currentData.reverse();
            //请求数据
            var obj = {
                url: 'todolist/getData_new.php',
                data: {
                    date_arr: this.sendDateArr
                },
                success: function (data) {
                    console.log('周视图数据' + data);
                    resData = JSON.parse(data).resData;
                    self.tranformData(resData);
                }
            };

            wlbPostData(obj);
            this.ifBackward = 0;
        },
        //月视图往后加载
        RenderMoreDataByMonth() {
            this.monthData = []; //显示数据清空
            this.monthDataStack = [];
            this.sendDateArr = []; //发送的日期数据
            currentData = [];
            this.dc.now_day = 1;
            this.dc.now_week = this.dc.now_weekstart;
            this.firstWeekDays = 7 - this.dc.now_weekstart;
            this.dc.now_month = this.dc.now_month < 10 ? '0' + this.dc.now_month : this.dc.now_month;
            for (var i = 0; i < this.dc.now_monthdays; i++) {
                var oneData = {};
                this.dc.now_day = this.dc.now_day < 10 ? '0' + this.dc.now_day : this.dc.now_day;
                oneData.itemTime = this.dc.now_year + '-' + this.dc.now_month + '-' + this.dc.now_day;
                this.sendDateArr.push(oneData.itemTime);
                oneData.itemList = [];
                oneData.itemWeek = this.dc.now_week;
                (this.dc.now_week < 6 && this.dc.now_week >= 0) ? this.dc.now_week++: this.dc.now_week = 0;
                this.dc.now_day++;
                currentData.push(oneData);
            }
            //后台获取数据
            var self = this;
            var obj = {
                url: 'todolist/getData_new.php',
                data: {
                    date_arr: this.sendDateArr
                },
                success: function (data) {
                    console.log(data);
                    resData = JSON.parse(data).resData;
                    calender.tranformData(resData);
                    //存储为monthData
                    self.renderfirstWeekData();
                    self.renderWeekData();
                    console.log(JSON.stringify(self.monthData));
                }
            };
            wlbPostData(obj);
        },
        RenderMoreDataInMonth() {
            this.dc.now_month--;
            if (this.dc.now_month < 1) {
                this.dc.now_month = 12;
                this.dc.now_year--;
            }
            this.dc.now_monthdays = this.dc.getMonthDays(this.dc.now_year, this.dc.now_month);
            this.dc.now_weekstart = this.dc.getWeekDay(this.dc.now_year, this.dc.now_month - 1, 1);
            this.RenderMoreDataByMonth();
        },
        RenderMoreDataInMonthForward() {
            this.dc.now_month++;
            if (this.dc.now_month > 12) {
                this.dc.now_month = 1;
                this.dc.now_year++;
            }
            this.dc.now_monthdays = this.dc.getMonthDays(this.dc.now_year, this.dc.now_month);
            this.dc.now_weekstart = this.dc.getWeekDay(this.dc.now_year, this.dc.now_month - 1, 1);
            this.RenderMoreDataByMonth();
        },
        tranformData(resData) {
            for (var k in resData) {
                for (var j in currentData) {
                    if (resData[k].itemTime == currentData[j].itemTime) {
                        currentData[j].itemList = resData[k].itemList;
                        for (var n in currentData[j].itemList) {
                            currentData[j].itemList[n].manual = 0;
                        }
                        break;
                    }
                }
            }
            this.data = currentData;
            this.dataStack = JSON.parse(JSON.stringify(currentData));
            console.log(JSON.stringify(this.data));
        },
        saveData(itemIndex, index, weekIndex) {
            // console.log(JSON.stringify(this.dataStack));
            // console.log(JSON.stringify(this.data));//为什么this.data会在月视图起作用
            // console.log(JSON.stringify(this.monthData));
            //处于哪个视图
            if (this.panel) {

            } else {
                console.log('itemIndex,index,weekIndex ====== ' + itemIndex + '/' + index + '/' + weekIndex);
                var ifItemManual = this.monthData[weekIndex][index].itemList[itemIndex].manual; //1是新增数据
                console.log(JSON.stringify(this.monthDataStack[weekIndex][index].itemList));
                //判断是否新增数据，新增数据和更新数据的接口不一样
                if (ifItemManual) {
                    var totalData = [];
                    var modifyData = {
                        itemTime: this.monthData[weekIndex][index].itemTime,
                        itemName: this.monthData[weekIndex][index].itemList[itemIndex].name,
                        itemFinish: this.monthData[weekIndex][index].itemList[itemIndex].finish
                    };
                    totalData.push(modifyData);
                    //请求后台
                    console.log('=====打印的数据' + JSON.stringify(totalData)); //打印提交的数据
                    var obj = {
                        url: 'todolist/saveData.php',
                        data: {
                            totalData: totalData
                        },
                        success: function (data) {
                            console.log('=====savedatasuccess');
                        }
                    };
                    wlbPostData(obj);
                } else {
                    //非新增 调用update接口
                    var totalData = [];
                    console.log('=====' + JSON.stringify(this.monthData[weekIndex][index].itemList[itemIndex]));
                    console.log('=====' + JSON.stringify(this.monthDataStack[weekIndex][index].itemList[itemIndex]));
                    if (this.monthData[weekIndex][index].itemList[itemIndex] != this.monthDataStack[weekIndex][index].itemList[itemIndex]) {
                        var modifyData = {
                            itemTime: this.monthData[weekIndex][index].itemTime,
                            itemName: this.monthData[weekIndex][index].itemList[itemIndex].name,
                            itemFinish: this.monthData[weekIndex][index].itemList[itemIndex].finish
                        };
                        totalData.push(modifyData);
                        // }
                        //请求后台
                        console.log('====提交后台的数据' + JSON.stringify(totalData)); //打印提交的数据
                        // var obj = {
                        //     url: 'todolist/saveData.php',
                        //     data: {
                        //         totalData: totalData
                        //     },
                        //     success: function (data) {
                        //         console.log('=====savedatasuccess');
                        //     }
                        // };
                        // wlbPostData(obj);
                    }
                }
            }

            // var totalData = [];
            // for (var i = 0; i < this.data.length; i++) {
            //     if (this.data[i].itemList != this.dataStack[i].itemList) {
            //         var time = this.data[i].itemTime;
            //         for (var k = 0; k < this.data[i].itemList.length; k++) {
            //             if (!this.dataStack[i].itemList[k] || this.data[i].itemList[k].name !== this.dataStack[i].itemList[k].name || this.data[i].itemList[k].finish !== this.dataStack[i].itemList[k].finish) {
            //                 var modifyData = {
            //                     itemTime: this.data[i].itemTime,
            //                     itemName: this.data[i].itemList[k].name,
            //                     itemFinish: Number(this.data[i].itemList[k].finish)
            //                 };
            //                 totalData.push(modifyData);
            //             }
            //         }
            //     }
            // }

            ///////////
            // var totalData = [];
            // console.log(this.data[index].itemList != this.dataStack[index].itemList);
            // if (this.data[index].itemList != this.dataStack[index].itemList) {
            //     var modifyData = {
            //         itemTime: this.data[index].itemTime,
            //         itemName: this.data[index].itemList[itemIndex].name,
            //         itemFinish: Number(this.data[index].itemList[itemIndex].finish)
            //     };
            //     totalData.push(modifyData);
            // }
            // //请求后台
            // console.log('=====打印的数据' + JSON.stringify(totalData)); //打印提交的数据
            // var obj = {
            //     url: 'todolist/saveData.php',
            //     data: {
            //         totalData: totalData
            //     },
            //     success: function (data) {
            //         console.log('=====savedatasuccess');
            //     }
            // };
            // wlbPostData(obj);
        },
        delData(itemIndex, index, weekIndex) {
            var _self = this;
            var totalData = {};
            if (this.panel) {
                console.log('weekIndex===' + weekIndex);
                totalData.itemTime = _self.data[index].itemTime;
                totalData.itemName = _self.data[index].itemList[itemIndex].name;
                var obj = {
                    url: 'todolist/delData.php',
                    data: {
                        totalData: totalData
                    },
                    success: function (data) {
                        console.log('=====delsuccess');
                        _self.data[index].itemList.splice(itemIndex, 1);
                    }
                };
            } else {
                totalData.itemTime = _self.monthData[weekIndex][index].itemTime;
                totalData.itemName = _self.monthData[weekIndex][index].itemList[itemIndex].name;
                var obj = {
                    url: 'todolist/delData.php',
                    data: {
                        totalData: totalData
                    },
                    success: function (data) {
                        console.log('=====delsuccess');
                        _self.monthData[weekIndex][index].itemList.splice(itemIndex, 1);
                    }
                };
            }
            //传递给后台
            wlbPostData(obj);
        },
        addData(index, weekIndex) {
            var tempData = {
                name: '',
                finish: 0,
                manual: 1
            }
            if (this.panel) {
                this.data[index].itemList.push(tempData);
            } else {
                this.monthData[weekIndex][index].itemList.push(tempData);
            }
        },
        renderfirstWeekData() {
            var firstWeek = [];
            var temp = 7 - this.firstWeekDays;
            for (var k = 0; k < temp; k++) {
                var a = {};
                firstWeek.push(a);
            }
            for (var i = 0; i < this.firstWeekDays; i++) {
                firstWeek.push(this.data[i]);
            }
            this.monthData.push(firstWeek);
        },
        renderWeekData() {
            var midWeekNum = Math.floor((this.dc.now_monthdays - this.firstWeekDays) / 7); //中间的周数
            var leftWeekNum = (this.dc.now_monthdays - this.firstWeekDays) % 7; //最后一周的天数
            var beginNum = this.firstWeekDays;
            //添加中间周数的数据
            for (var i = 0; i < midWeekNum; i++) {
                var weekArr = [];
                for (var k = 0; k < 7; k++) {
                    weekArr.push(this.data[beginNum]);
                    beginNum++;
                }
                this.monthData.push(weekArr);
            }
            var weekArr = [];
            //添加最后一周剩余的数据
            for (var j = 0; j < leftWeekNum; j++) {
                weekArr.push(this.data[beginNum]);
                beginNum++;
            }
            for (var n = 0; n < (7 - leftWeekNum); n++) {
                var a = {};
                weekArr.push(a);
            }
            this.monthData.push(weekArr);
            this.monthDataStack = this.monthData;
        }
    },
    filters: {
        filterWeek(value) {
            if (value == 0) return '星期日';
            if (value == 1) return '星期一';
            if (value == 2) return '星期二';
            if (value == 3) return '星期三';
            if (value == 4) return '星期四';
            if (value == 5) return '星期五';
            if (value == 6) return '星期六';
        }
    }
})


calender.init();

function wlbPostData(jsonObj) {
    var url = 'http://localhost' + '/' + jsonObj.url;
    var data = jsonObj.data || {};
    var successCb = jsonObj.success;
    var failCb = jsonObj.fail;
    var errorCb = jsonObj.error;
    $.ajax({
        type: "post",
        url: url,
        data: data,
        async: true,
        success: function (data) {
            if (successCb) {
                if (data) {
                    successCb(data);
                } else {
                    if (failCb) {
                        failCb(data);
                    }
                }
            }
        },
        error: function (res) {
            if (errorCb) {
                errorCb(res);
            } else {
                console.log("网络连接失败，请检查网络设置");
            }
        }
    });
}

// window.onscroll = function (event) {
//     var wScrollY = window.scrollY; // 当前滚动条位置    
//     var wInnerH = window.innerHeight; // 设备窗口的高度（不会变）    
//     var bScrollH = document.body.scrollHeight; // 滚动条总高度        
//     if (wScrollY + wInnerH >= bScrollH) {
//         console.log("到底了.");
//         RenderMoreData(7);
//     }
//  if(wScrollY + wInnerH >= bScrollH){
//     console.log("到了顶.");
//     RenderMoreDataForward(7);
//  }
// };

// var data = {
//     resData: [{
//         itemTime: '2017/10/7',
//         itemList: [{
//             name: '回学校',
//             finish: false
//         }, {
//             name: 'php完成',
//             finish: false
//         }],
//         itemWeek: ''
//     }, {
//         itemTime: '2017/10/11',
//         itemList: [{
//             name: '中移互联网简历截止',
//             finish: true
//         }],
//         itemWeek: ''
//     }]
// };