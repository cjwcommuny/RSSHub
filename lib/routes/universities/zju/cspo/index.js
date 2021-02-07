const got = require('@/utils/got');
const cheerio = require('cheerio');
const host = 'http://cspo.zju.edu.cn/';

const map = new Map([
    [1, { title: '浙大计算机学院 -- 研究生教育', tag: '27109/list.htm' }],
    [2, { title: '浙大计算机学院 -- 本科生教育', tag: '29529/list.htm' }],
]);

module.exports = async (ctx) => {
    const type = Number.parseInt(ctx.params.type);
    const tag = map.get(type).tag;
    const res = await got({
        method: 'get',
        url: host + `${tag}`,
    });

    const $ = cheerio.load(res.data);
    const list = $('#wp_news_w7').find($('.a')).slice(0, 20);
    const items =
        list &&
        list
            .map((index, item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    pubDate: new Date(item.find('.fr.fbdate').text()).toUTCString(),
                    link: `http://cspo.zju.edu.cn${item.find('a').eq(-1).attr('href')}`,
                    description: '',
                };
            })
            .get();

    ctx.state.data = {
        title: map.get(type).title,
        link: host + `${tag}`,
        item: items,
    };
};
