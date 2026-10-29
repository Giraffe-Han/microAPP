// 增量初始化飞服中心套餐，兼容 JSON / PostgreSQL，保留现有课程和场馆素材。
// 用法：npm run seed:study；预览变更：npm run seed:study -- --dry-run。
const path = require('path');

const PACKAGE_CONTENTS = [
    {
        id: 'study-zhennan-99',
        name: '低空科普研学套餐一',
        tag: '套餐一',
        price: 99,
        items: ['低空展厅参观+沉浸式VR体验', '低空课堂', '积木无人机拼搭', '无人机调试飞行']
    },
    {
        id: 'study-zhennan-198',
        name: '低空科普研学套餐二',
        tag: '套餐二',
        price: 198,
        items: ['低空展厅参观+沉浸式VR体验', '低空课堂', '无人机拼搭（组装成品可带走）', '无人机试飞']
    }
];

function buildStudyConfig(current) {
    if (!current?.['9'] || typeof current['9'] !== 'object') {
        throw new Error('缺少低空研学服务配置，请先配置服务9，未执行写入。');
    }
    const config = JSON.parse(JSON.stringify(current));
    const study = config['9'];
    if (!study.packages) study.packages = {};
    for (const { id, name, tag, price, items } of PACKAGE_CONTENTS) {
        // 已有同名套餐可能经过后台编辑，不覆盖其内容。
        if (Object.prototype.hasOwnProperty.call(study.packages, id)) continue;
        study.packages[id] = {
            id, name, tag, price,
            location: 'zhennan',
            recommended: false,
            desc: items.join('、'),
            intro: items.join('、') + '。',
            cardHighlights: items,
            projects: items.map(name => ({ name, icon: 'star-o' })),
            headerBg: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
            schedule: [],
            studyGoals: [],
            audience: [],
            feeInfo: [{ label: '套餐费用', value: `${price}元/人` }],
            tips: ['请提前预约，具体活动安排以预约确认为准。'],
            advantages: [],
            showcase: [],
            safetyBriefing: [],
            studySummary: ''
        };
    }
    if (!Array.isArray(study.locations)) study.locations = [];
    if (!study.locations.some(loc => loc?.key === 'niushan')) {
        study.locations.push({
            key: 'niushan', name: '牛山低空科创园',
            subtitle: '专业无人机研学课程，支持在线报名',
            tag: '课程报名', enterText: '查看课程', action: 'packages', enabled: true
        });
    }
    let zhennan = study.locations.find(loc => loc?.key === 'zhennan');
    if (!zhennan) {
        zhennan = {
            key: 'zhennan', name: '浙南低空飞行服务中心',
            subtitle: '集展示、宣传、体验于一体的低空经济科普平台',
            address: '浙江省温州市鹿城区七都街道温州金融科技文化中心A4号楼',
            enabled: true
        };
        study.locations.push(zhennan);
    }
    zhennan.action = 'intro';
    if (!zhennan.tag || zhennan.tag === '需求收集') zhennan.tag = '课程报名';
    if (!zhennan.enterText || zhennan.enterText === '登记需求') zhennan.enterText = '了解详情';
    return config;
}

async function main() {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    const { readServicesConfig, writeServicesConfig } = require('./storage');
    const current = await readServicesConfig();
    const next = buildStudyConfig(current);
    const changed = JSON.stringify(current) !== JSON.stringify(next);
    const mode = process.env.USE_POSTGRES === '1' ? 'PostgreSQL' : 'JSON';
    if (process.argv.includes('--dry-run')) {
        console.log(`预览（${mode}）：${changed ? '需要增量初始化飞服中心套餐及选课入口' : '配置已就绪，无需修改'}，未写入。`);
        return;
    }
    if (changed && !await writeServicesConfig(next)) throw new Error('保存研学配置失败。');
    const check = await readServicesConfig();
    for (const { id } of PACKAGE_CONTENTS) {
        if (!check['9']?.packages?.[id]) throw new Error(`套餐回读校验失败：${id}`);
    }
    console.log(`飞服中心套餐配置已就绪（${mode}），保留所有已有课程及场馆素材。`);
}

module.exports = { buildStudyConfig, PACKAGE_CONTENTS };

if (require.main === module) {
    main().then(() => process.exit(0)).catch(error => {
        console.error('研学套餐初始化失败：', error.message);
        process.exit(1);
    });
}
