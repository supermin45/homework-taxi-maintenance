/**
 * Created by Administrator on 2017/10/14.
 */
`use strict`
//获取车辆的报废日期
Date.prototype.addDay = function (num) {
    this.setDate(this.getDate() + num);
    return this;
}
Date.prototype.toString = function (date) {
    let year = date.getFullYear();
    let month =	date.getMonth()+1;
    let day	= date.getDate();

    function f(n){
        if(n<10)
            n =	"0" + n;
        return n;
    }

    return year + "/" + f(month) + "/" + f(day);
}
//比较报废日期和提交日期的大小
function compare(date1, date2) {
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    let minus = Date.parse(d1) - Date.parse(d2);
    if (minus <= 0) {
        return true;
    } else {
        return false;
    }
}
//获取车辆的基本信息
function getTaxi(arr, subDate) {
    let result = [];
    for (let i = 1; i < arr.length; i++) {
        let taxiArr = arr[i].split('|');
        let obj = {id: '', buyDate: '', name: '',
            mileage: '', overhaul: '', scrapDate: '', useYear: ''};
        obj.id = taxiArr[0];
        obj.buyDate = taxiArr[1];
        obj.name = taxiArr[2];
        obj.mileage = taxiArr[3];
        obj.overhaul = taxiArr[4];
        let date = new Date(obj.buyDate);
        let gmtDate;
        if (obj.overhaul === 'T') {
            gmtDate = date.addDay(1095);
        } else {
            gmtDate = date.addDay(2190);
        }
        obj.scrapDate = gmtDate.toString();
        let year1 = subDate.getFullYear();
        let year2 = obj.buyDate.getFullYear();
        obj.useYear = year1 - year2;
        result.push(obj);
    }
}
//逐步打印保养以及报废的车辆信息
function print(timeRelated, distanceRelated, writeOff) {
    let str = `Reminder
==================`;
    let str1 = '* Time-related maintenance coming soon...';
    let str2 = '* Distance-related maintenance coming soon...';
    let str3 = '* Write-off coming soon...';
    let taxi1 = summary(statistic(timeRelated));
    let taxi2 = summary(statistic(distanceRelated));
    let taxi3 = summary(statistic(writeOff));
    str1 += taxi1;
    str2 += taxi2;
    str3 += taxi3;
    return str + str1 + str2 + str3;
}
function summary(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if (arr[i].name === arr[j].name) {
                arr[i].count++;
                arr[i].id += ', ' + arr[j].id;
                arr.splice(j, 1);
            }
        }
    }
    arr.sort((x, y) => {
        if (x.id.substr(0, 1) < x.id.substr(0, 1)) {
            return 1;
        }
        if (x.id.substr(0, 1) > x.id.substr(0, 1)) {
            return -1;
        }

        return 0;
    });
    arr.map(e => e = e.name + ': ' + e.count + ' (' + e.id + ')');
    return arr.join('\n');
}
//统计报废和需要提醒保养的车辆信息
function statistic(arr) {
    let result = [];
    arr.forEach(e => {
        let obj = {id: '', name: '', count: 1};
        obj.id = e.id;
        obj.name = e.name;
        if (!result.includes(e)) {
            result.push(e);
        } else {
            e.count++;
        }
    });
}
//主函数
function main(taxiStr) {
    let arr = taxiStr.split(' ');
    let submitDate = arr[0].split(': ')[1];
    let subDate = new Date(submitDate);
    let taxis = getTaxi(arr, subDate);
    let timeRelated = [];
    let distanceRelated = [];
    let writeOff = [];
    let alreadyScrap = [];
    let result = '';
    taxis.forEach(e => {
        let isSmall = compare(e.scrapDate, submitDate);
        if (!isSmall) {//判断是否已经报废
            let d1 = new Date(e.scrapDate);
            let d2 = new Date(submitDate);
            let month1 = d1.getMonth() + 1;
            let month2 = d2.getMonth() + 1;
            let minusMonth = month1 - month2;
            if (e.overhaul === 'T') {
                timeRelated.push(e);
                if (e.useYear === 3) {
                    if (minusMonth <= 1) {
                        writeOff.push(e);
                    }
                }
            } else {
                if (e.mileage >= 9500) {
                    distanceRelated.push(e);
                } else {
                    if (e.useYear >=3 && minusMonth >=5) {
                        timeRelated.push(e);
                    }else {
                        if (minusMonth >= 11) {
                            timeRelated.push(e);
                        }
                    }
                }
            }

        } else {
            alreadyScrap.push(e);
        }
    });
    result = print(timeRelated, distanceRelated, writeOff);

    return result;
}


module.exports = main;