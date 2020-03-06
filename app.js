require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const JDate = require('jalali-date');

const DATE_RANGE = [
    process.env.START_DATE,
    process.env.END_DATE
];

const toJalaali = date => {
    let jDate = new JDate(date);

    return jDate.format('YYYY/MM/DD');
}

const getData = (date, callback) => {
    const jDate = toJalaali(date);

    axios.post('https://aqms.doe.ir/Home/GetAQIData', {
        Date: jDate + ' 11:00',
        type: 1
    }).then(res => {

        if (!res.data) {
            return;
        }


        if (res.data.Data) {
            const resString = JSON.stringify(res.data.Data);
            const fileName = jDate.replace(/\//g, '-').split(' ')[0];

            fs.writeFile(`./results/data_${fileName}.json`, resString, function () {
                console.log(`data_${fileName}.json generated!`);

                callback(date);
            });
        }

    }).catch(err => console.error(err));
}

const goNext = (today, lastDay = DATE_RANGE[1]) => {
    const todayDate = new Date(today).getDate();
    const lastDayDate = new Date(lastDay).getDate();

    if (todayDate < lastDayDate) {
        const nextDate = new Date();
        nextDate.setDate(todayDate + 1);

        getData(nextDate, goNext);

    } else {
        console.log('All Done!');
    }
}

const start = () => {
    if (DATE_RANGE[0] && DATE_RANGE[1]) {
        getData(new Date(DATE_RANGE[0]), goNext);
    } else {
        console.error('Set Start and end date')
    }
}

start();