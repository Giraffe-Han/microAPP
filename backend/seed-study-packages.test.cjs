const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const { buildStudyConfig } = require('./seed-study-packages');

const fixture = () => ({
    _home: { title: '现有首页' },
    '9': {
        name: '低空研学服务',
        packages: {
            'study-halfday': { name: '牛山半日营', price: 198 },
            'study-family': { name: '牛山亲子营', price: 238 },
            'study-99': { name: '牛山科技研学', price: 99 }
        },
        locations: [
            { key: 'niushan', action: 'packages', enabled: false, cover: '/uploads/niushan.jpg' },
            { key: 'zhennan', action: 'demand', intro: '现有介绍', cover: '/uploads/cover.jpg', gallery: [{ image: '/uploads/gallery.jpg' }], enterText: '了解详情', tag: '需求收集' }
        ]
    },
    '6': { name: '飞手培训' }
});

test('增量新增飞服中心两款套餐，名称、价格、四项内容正确', () => {
    const current = fixture();
    const snapshot = structuredClone(current);
    const next = buildStudyConfig(current);
    const one = next['9'].packages['study-zhennan-99'];
    const two = next['9'].packages['study-zhennan-198'];
    assert.equal(one.name, '低空科普研学套餐一');
    assert.equal(one.price, 99);
    assert.equal(two.name, '低空科普研学套餐二');
    assert.equal(two.price, 198);
    assert.equal(one.location, 'zhennan');
    assert.equal(two.location, 'zhennan');
    assert.deepEqual(one.cardHighlights, ['低空展厅参观+沉浸式VR体验', '低空课堂', '积木无人机拼搭', '无人机调试飞行']);
    assert.deepEqual(two.cardHighlights, ['低空展厅参观+沉浸式VR体验', '低空课堂', '无人机拼搭（组装成品可带走）', '无人机试飞']);
    assert.deepEqual(two.projects.map(item => item.name), two.cardHighlights);
    assert.deepEqual(one.schedule, []);
    assert.deepEqual(current, snapshot);
    for (const id of Object.keys(current['9'].packages)) assert.deepEqual(next['9'].packages[id], current['9'].packages[id]);
    assert.deepEqual(next._home, current._home);
    assert.deepEqual(next['6'], current['6']);
});

test('选课入口更新时保留两馆素材及牛山停用状态', () => {
    const current = fixture();
    const next = buildStudyConfig(current);
    const zhennan = next['9'].locations.find(loc => loc.key === 'zhennan');
    assert.equal(zhennan.action, 'intro');
    assert.equal(zhennan.enterText, '了解详情');
    assert.equal(zhennan.tag, '课程报名');
    for (const key of ['cover', 'intro', 'gallery']) assert.deepEqual(zhennan[key], current['9'].locations[1][key]);
    assert.deepEqual(next['9'].locations[0], current['9'].locations[0]);
});

test('重复执行幂等，后台调整后的套餐不被覆盖', () => {
    const next = buildStudyConfig(fixture());
    next['9'].packages['study-zhennan-99'].price = 109;
    next['9'].packages['study-zhennan-99'].name = '后台编辑过的套餐';
    assert.deepEqual(buildStudyConfig(next), next);
});

test('缺少场馆配置时补齐，缺少服务9时拒绝写入', () => {
    const current = fixture();
    delete current['9'].locations;
    const next = buildStudyConfig(current);
    assert.deepEqual(next['9'].locations.map(loc => loc.key), ['niushan', 'zhennan']);
    assert.throws(() => buildStudyConfig({}), /缺少低空研学服务配置/);
});

test('前端场馆归属兼容旧套餐及中文名称，两馆套餐不会串馆', async () => {
    const moduleUrl = pathToFileURL(path.join(__dirname, '../frontend/h5/src/utils/study.js')).href;
    const { getStudyPackageLocation, getStudyLocationName } = await import(moduleUrl);
    assert.equal(getStudyPackageLocation({}), 'niushan');
    assert.equal(getStudyPackageLocation({ location: '牛山低空科创园' }), 'niushan');
    assert.equal(getStudyPackageLocation({ location: '浙南低空飞行服务中心' }), 'zhennan');
    assert.equal(getStudyLocationName('zhennan'), '浙南低空飞行服务中心');
    const pkgs = buildStudyConfig(fixture())['9'].packages;
    assert.deepEqual(Object.keys(pkgs).filter(id => getStudyPackageLocation(pkgs[id]) === 'zhennan'), ['study-zhennan-99', 'study-zhennan-198']);
    assert.deepEqual(Object.keys(pkgs).filter(id => getStudyPackageLocation(pkgs[id]) === 'niushan'), ['study-halfday', 'study-family', 'study-99']);
});

test('展示说明依据课程内容生成，成品可带走不会出现在积木套餐中', async () => {
    const { getStudyActivity, getStudyPackageFeature } = await import(pathToFileURL(path.join(__dirname, '../frontend/h5/src/utils/study.js')).href);
    const packages = buildStudyConfig(fixture())['9'].packages;
    const one = getStudyPackageFeature(packages['study-zhennan-99'].cardHighlights);
    const two = getStudyPackageFeature(packages['study-zhennan-198'].cardHighlights);
    assert.equal(one.title, '积木拼搭 · 调试飞行');
    assert.equal(two.title, '亲手组装 · 成品可带走');
    assert.equal(getStudyPackageFeature([]), null);
    assert.equal(getStudyPackageFeature(['后台新课程']), null);
    assert.equal(getStudyActivity('后台新课程').desc, '');
    assert.equal(getStudyActivity('低空课堂').icon, 'notes-o');
});

test('场馆图片兼容旧字符串和新对象配置，忽略空项', async () => {
    const { getStudyGallery, getStudyImageUrl } = await import(pathToFileURL(path.join(__dirname, '../frontend/h5/src/utils/study.js')).href);
    const gallery = getStudyGallery({ gallery: ['/uploads/a.jpg', { image: '/uploads/b.jpg', title: '展厅' }, null, {}, { image: 123 }] });
    assert.equal(gallery.length, 2);
    assert.equal(gallery[1].title, '展厅');
    assert.deepEqual(getStudyGallery({}), []);
    assert.equal(getStudyImageUrl('uploads/a.jpg'), '/uploads/a.jpg');
    assert.equal(getStudyImageUrl('/uploads/a.jpg'), '/uploads/a.jpg');
    assert.equal(getStudyImageUrl('https://example.com/a.jpg'), 'https://example.com/a.jpg');
    assert.equal(getStudyImageUrl(null), '');
});

// 仅载入提交处理器，使用内存存储验证，不启动服务或写入真实订单。
function submitHarness(config, failConfig = false) {
    const source = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');
    const start = source.indexOf("app.post('/api/submit',");
    const end = source.indexOf('\n});', start) + '\n});'.length;
    let handler;
    const db = [];
    const res = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    vm.runInNewContext(source.slice(start, end), {
        app: { post: (_, __, fn) => { handler = fn; } },
        authOptional: () => {},
        readServicesConfig: async () => { if (failConfig) throw new Error('存储不可用'); return config; },
        readDB: async () => db,
        writeDB: async () => true
    });
    return { db, res, submit: body => handler({ body }, res) };
}

test('提交按服务端套餐保存飞服中心归属和价格，不采信篡改字段', async () => {
    const harness = submitHarness(buildStudyConfig(fixture()));
    await harness.submit({ serviceId: '9', studyPackage: 'study-zhennan-198', studyLocationKey: 'niushan', studyPackageName: '伪造名称', studyPackagePrice: 1, studyType: '需求收集' });
    assert.equal(harness.res.code, 200);
    assert.equal(harness.db.length, 1);
    assert.equal(harness.db[0].studyLocationKey, 'zhennan');
    assert.equal(harness.db[0].studyLocation, '浙南低空飞行服务中心');
    assert.equal(harness.db[0].studyPackageName, '低空科普研学套餐二');
    assert.equal(harness.db[0].studyPackagePrice, 198);
    assert.equal(harness.db[0].studyType, '课程报名');
});

test('不存在、停用及原型属性套餐拒绝提交，不保存订单', async () => {
    const config = buildStudyConfig(fixture());
    config['9'].packages['study-zhennan-99'].enabled = false;
    for (const id of ['missing', 'study-zhennan-99', '__proto__', 'constructor']) {
        const harness = submitHarness(config);
        await harness.submit({ serviceId: '9', studyPackage: id });
        assert.equal(harness.res.code, 400);
        assert.equal(harness.db.length, 0);
    }
});

test('旧牛山课程默认归牛山、未选套餐需求登记及其他服务保持兼容', async () => {
    const config = buildStudyConfig(fixture());
    const course = submitHarness(config);
    await course.submit({ serviceId: '9', studyPackage: 'study-halfday' });
    assert.equal(course.db[0].studyLocationKey, 'niushan');
    for (const body of [
        { serviceId: '9', studyLocationKey: 'zhennan', studyType: '需求收集' },
        { serviceId: '6', traineeName: '测试' }
    ]) {
        const harness = submitHarness(config);
        await harness.submit({ ...body });
        assert.equal(harness.res.code, 200);
        for (const key of Object.keys(body)) assert.equal(harness.db[0][key], body[key]);
    }
});

test('套餐配置加载失败时返回可重试错误，不保存订单', async () => {
    const harness = submitHarness({}, true);
    await harness.submit({ serviceId: '9', studyPackage: 'study-zhennan-99' });
    assert.equal(harness.res.code, 503);
    assert.equal(harness.db.length, 0);
});
