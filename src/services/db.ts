import type { User, Document, Category, SearchHistory, ReadingRecord, DownloadRecord, Article } from '@/types';
import { UserRole, UserStatus, DocumentStatus, DocumentType } from '@/types';

// 数据库键名
const DB_KEYS = {
  USERS: 'law_db_users',
  DOCUMENTS: 'law_db_documents',
  CATEGORIES: 'law_db_categories',
  SEARCH_HISTORY: 'law_db_search_history',
  READING_RECORDS: 'law_db_reading_records',
  DOWNLOAD_RECORDS: 'law_db_download_records',
  ARTICLES: 'law_db_articles',
  CURRENT_USER: 'law_db_current_user',
  TOKEN: 'law_db_token',
};

// 初始化数据库
export const initDatabase = () => {
  // 检查是否需要初始化
  if (!localStorage.getItem(DB_KEYS.CATEGORIES)) {
    // 初始化分类数据
    const defaultCategories: Category[] = [
      {
        id: 'cat-1',
        name: '法律',
        description: '全国人大及其常委会制定的法律',
        parentId: null,
        level: 1,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-1-1',
        name: '市场主体登记管理',
        description: '市场主体登记管理相关法律',
        parentId: 'cat-1',
        level: 2,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-1-2',
        name: '反垄断与反不正当竞争',
        description: '反垄断与反不正当竞争相关法律',
        parentId: 'cat-1',
        level: 2,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-1-3',
        name: '消费者权益保护',
        description: '消费者权益保护相关法律',
        parentId: 'cat-1',
        level: 2,
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-1-4',
        name: '产品质量与食品安全',
        description: '产品质量与食品安全相关法律',
        parentId: 'cat-1',
        level: 2,
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-1-5',
        name: '知识产权',
        description: '知识产权相关法律',
        parentId: 'cat-1',
        level: 2,
        sortOrder: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-2',
        name: '行政法规',
        description: '国务院制定的行政法规',
        parentId: null,
        level: 1,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-2-1',
        name: '公司登记管理条例',
        description: '公司登记管理相关行政法规',
        parentId: 'cat-2',
        level: 2,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-2-2',
        name: '食品安全条例',
        description: '食品安全相关行政法规',
        parentId: 'cat-2',
        level: 2,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-3',
        name: '部门规章',
        description: '市场监管总局制定的部门规章',
        parentId: null,
        level: 1,
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-3-1',
        name: '登记注册',
        description: '登记注册相关规章',
        parentId: 'cat-3',
        level: 2,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-3-2',
        name: '信用监管',
        description: '信用监管相关规章',
        parentId: 'cat-3',
        level: 2,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-3-3',
        name: '价格监管',
        description: '价格监管相关规章',
        parentId: 'cat-3',
        level: 2,
        sortOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-4',
        name: '地方性法规',
        description: '地方人大及其常委会制定的地方性法规',
        parentId: null,
        level: 1,
        sortOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-5',
        name: '地方政府规章',
        description: '地方政府制定的地方政府规章',
        parentId: null,
        level: 1,
        sortOrder: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cat-6',
        name: '规范性文件',
        description: '市场监管总局及地方市场监管部门制定的规范性文件',
        parentId: null,
        level: 1,
        sortOrder: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }

  // 初始化管理员账号
  const users = getUsers();
  if (!users.find(u => u.role === 'admin')) {
    const adminUser: User = {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@marketlaw.gov.cn',
      password: 'admin123',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      realName: '系统管理员',
      organization: '市场监管总局',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveUser(adminUser);
  }

  // 初始化示例文档
  if (!localStorage.getItem(DB_KEYS.DOCUMENTS)) {
    initSampleDocuments();
  }
};

// 初始化示例文档
const initSampleDocuments = () => {
  const sampleDocuments: Document[] = [
    {
      id: 'doc-1',
      title: '中华人民共和国公司法',
      subtitle: '2023年修订版',
      documentNumber: '中华人民共和国主席令第十五号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2024-07-01',
      publishDate: '2023-12-29',
      content: `第一章 总则
第一条 为了规范公司的组织和行为，保护公司、股东、职工和债权人的合法权益，完善中国特色现代企业制度，弘扬企业家精神，维护社会经济秩序，促进社会主义市场经济的发展，根据宪法，制定本法。
第二条 本法所称公司，是指依照本法在中华人民共和国境内设立的有限责任公司和股份有限公司。
第三条 公司是企业法人，有独立的法人财产，享有法人财产权。公司以其全部财产对公司的债务承担责任。
公司的合法权益受法律保护，不受侵犯。
第四条 有限责任公司的股东以其认缴的出资额为限对公司承担责任；股份有限公司的股东以其认购的股份为限对公司承担责任。
公司股东对公司依法享有资产收益、参与重大决策和选择管理者等权利。`,
      summary: '公司法是规范公司组织和行为的基本法律，2023年12月29日修订通过，自2024年7月1日起施行。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-1',
      tags: ['公司法', '市场主体', '法律'],
      viewCount: 12580,
      downloadCount: 3420,
      createdBy: 'admin-1',
      createdAt: '2023-12-29T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2024-01-01T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-2',
      title: '中华人民共和国反垄断法',
      subtitle: '2022年修正版',
      documentNumber: '中华人民共和国主席令第一一六号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2022-08-01',
      publishDate: '2022-06-24',
      content: `第一章 总则
第一条 为了预防和制止垄断行为，保护市场公平竞争，鼓励创新，提高经济运行效率，维护消费者利益和社会公共利益，促进社会主义市场经济健康发展，制定本法。
第二条 中华人民共和国境内经济活动中的垄断行为，适用本法；中华人民共和国境外的垄断行为，对境内市场竞争产生排除、限制影响的，适用本法。
第三条 本法规定的垄断行为包括：
（一）经营者达成垄断协议；
（二）经营者滥用市场支配地位；
（三）具有或者可能具有排除、限制竞争效果的经营者集中。`,
      summary: '反垄断法旨在预防和制止垄断行为，保护市场公平竞争，2022年6月24日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-2',
      tags: ['反垄断', '公平竞争', '法律'],
      viewCount: 8960,
      downloadCount: 2150,
      createdBy: 'admin-1',
      createdAt: '2022-06-24T00:00:00Z',
      updatedAt: '2022-08-01T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2022-08-01T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-3',
      title: '中华人民共和国消费者权益保护法',
      subtitle: '2013年修正版',
      documentNumber: '中华人民共和国主席令第七号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2014-03-15',
      publishDate: '2013-10-25',
      content: `第一章 总则
第一条 为保护消费者的合法权益，维护社会经济秩序，促进社会主义市场经济健康发展，制定本法。
第二条 消费者为生活消费需要购买、使用商品或者接受服务，其权益受本法保护；本法未作规定的，受其他有关法律、法规保护。
第三条 经营者为消费者提供其生产、销售的商品或者提供服务，应当遵守本法；本法未作规定的，应当遵守其他有关法律、法规。`,
      summary: '消费者权益保护法是保护消费者合法权益的基本法律，2013年10月25日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-3',
      tags: ['消费者权益', '保护', '法律'],
      viewCount: 15230,
      downloadCount: 4560,
      createdBy: 'admin-1',
      createdAt: '2013-10-25T00:00:00Z',
      updatedAt: '2014-03-15T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2014-03-15T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-4',
      title: '中华人民共和国食品安全法',
      subtitle: '2021年修正版',
      documentNumber: '中华人民共和国主席令第八十一号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2021-04-29',
      publishDate: '2021-04-29',
      content: `第一章 总则
第一条 为了保证食品安全，保障公众身体健康和生命安全，制定本法。
第二条 在中华人民共和国境内从事下列活动，应当遵守本法：
（一）食品生产和加工（以下称食品生产），食品销售和餐饮服务（以下称食品经营）；
（二）食品添加剂的生产经营；
（三）用于食品的包装材料、容器、洗涤剂、消毒剂和用于食品生产经营的工具、设备（以下称食品相关产品）的生产经营；
（四）食品生产经营者使用食品添加剂、食品相关产品；
（五）食品的贮存和运输；
（六）对食品、食品添加剂、食品相关产品的安全管理。`,
      summary: '食品安全法是保证食品安全、保障公众健康的基本法律，2021年4月29日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-4',
      tags: ['食品安全', '健康', '法律'],
      viewCount: 11350,
      downloadCount: 2890,
      createdBy: 'admin-1',
      createdAt: '2021-04-29T00:00:00Z',
      updatedAt: '2021-04-29T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2021-04-29T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-5',
      title: '中华人民共和国商标法',
      subtitle: '2019年修正版',
      documentNumber: '中华人民共和国主席令第二十九号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2019-11-01',
      publishDate: '2019-04-23',
      content: `第一章 总则
第一条 为了加强商标管理，保护商标专用权，促使生产、经营者保证商品和服务质量，维护商标信誉，以保障消费者和生产、经营者的利益，促进社会主义市场经济的发展，特制定本法。
第二条 国务院工商行政管理部门商标局主管全国商标注册和管理的工作。
国务院工商行政管理部门设立商标评审委员会，负责处理商标争议事宜。`,
      summary: '商标法是保护商标专用权、加强商标管理的基本法律，2019年4月23日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-5',
      tags: ['商标', '知识产权', '法律'],
      viewCount: 7680,
      downloadCount: 1820,
      createdBy: 'admin-1',
      createdAt: '2019-04-23T00:00:00Z',
      updatedAt: '2019-11-01T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2019-11-01T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-6',
      title: '中华人民共和国专利法',
      subtitle: '2020年修正版',
      documentNumber: '中华人民共和国主席令第五十五号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2021-06-01',
      publishDate: '2020-10-17',
      content: `第一章 总则
第一条 为了保护专利权人的合法权益，鼓励发明创造，推动发明创造的应用，提高创新能力，促进科学技术进步和经济社会发展，制定本法。
第二条 本法所称的发明创造是指发明、实用新型和外观设计。
发明，是指对产品、方法或者其改进所提出的新的技术方案。
实用新型，是指对产品的形状、构造或者其结合所提出的适于实用的新的技术方案。
外观设计，是指对产品的整体或者局部的形状、图案或者其结合以及色彩与形状、图案的结合所作出的富有美感并适于工业应用的新设计。`,
      summary: '专利法是保护专利权人合法权益、鼓励发明创造的基本法律，2020年10月17日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-5',
      tags: ['专利', '知识产权', '法律'],
      viewCount: 8920,
      downloadCount: 2340,
      createdBy: 'admin-1',
      createdAt: '2020-10-17T00:00:00Z',
      updatedAt: '2021-06-01T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2021-06-01T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-7',
      title: '中华人民共和国反不正当竞争法',
      subtitle: '2019年修正版',
      documentNumber: '中华人民共和国主席令第二十九号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2019-04-23',
      publishDate: '2019-04-23',
      content: `第一章 总则
第一条 为了促进社会主义市场经济健康发展，鼓励和保护公平竞争，制止不正当竞争行为，保护经营者和消费者的合法权益，制定本法。
第二条 经营者在生产经营活动中，应当遵循自愿、平等、公平、诚信的原则，遵守法律和商业道德。
本法所称的不正当竞争行为，是指经营者在生产经营活动中，违反本法规定，扰乱市场竞争秩序，损害其他经营者或者消费者的合法权益的行为。
本法所称的经营者，是指从事商品生产、经营或者提供服务（以下所称商品包括服务）的自然人、法人和非法人组织。`,
      summary: '反不正当竞争法是制止不正当竞争行为、保护公平竞争的基本法律，2019年4月23日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-2',
      tags: ['反不正当竞争', '公平竞争', '法律'],
      viewCount: 6540,
      downloadCount: 1680,
      createdBy: 'admin-1',
      createdAt: '2019-04-23T00:00:00Z',
      updatedAt: '2019-04-23T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2019-04-23T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-8',
      title: '中华人民共和国产品质量法',
      subtitle: '2018年修正版',
      documentNumber: '中华人民共和国主席令第二十二号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2018-12-29',
      publishDate: '2018-12-29',
      content: `第一章 总则
第一条 为了加强对产品质量的监督管理，提高产品质量水平，明确产品质量责任，保护消费者的合法权益，维护社会经济秩序，制定本法。
第二条 在中华人民共和国境内从事产品生产、销售活动，必须遵守本法。
本法所称产品是指经过加工、制作，用于销售的产品。
建设工程不适用本法规定；但是，建设工程使用的建筑材料、建筑构配件和设备，属于前款规定的产品范围的，适用本法规定。`,
      summary: '产品质量法是加强对产品质量监督管理、保护消费者合法权益的基本法律，2018年12月29日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-4',
      tags: ['产品质量', '监管', '法律'],
      viewCount: 7890,
      downloadCount: 1980,
      createdBy: 'admin-1',
      createdAt: '2018-12-29T00:00:00Z',
      updatedAt: '2018-12-29T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2018-12-29T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-9',
      title: '中华人民共和国广告法',
      subtitle: '2021年修正版',
      documentNumber: '中华人民共和国主席令第一〇二号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2021-04-29',
      publishDate: '2021-04-29',
      content: `第一章 总则
第一条 为了规范广告活动，保护消费者的合法权益，促进广告业的健康发展，维护社会经济秩序，制定本法。
第二条 在中华人民共和国境内，商品经营者或者服务提供者通过一定媒介和形式直接或者间接地介绍自己所推销的商品或者服务的商业广告活动，适用本法。
本法所称广告主，是指为推销商品或者服务，自行或者委托他人设计、制作、发布广告的自然人、法人或者其他组织。
本法所称广告经营者，是指接受委托提供广告设计、制作、代理服务的自然人、法人或者其他组织。
本法所称广告发布者，是指为广告主或者广告主委托的广告经营者发布广告的自然人、法人或者其他组织。`,
      summary: '广告法是规范广告活动、保护消费者合法权益的基本法律，2021年4月29日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-3',
      tags: ['广告', '监管', '法律'],
      viewCount: 9230,
      downloadCount: 2450,
      createdBy: 'admin-1',
      createdAt: '2021-04-29T00:00:00Z',
      updatedAt: '2021-04-29T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2021-04-29T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-10',
      title: '中华人民共和国价格法',
      subtitle: '1997年版',
      documentNumber: '中华人民共和国主席令第九十二号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '1998-05-01',
      publishDate: '1997-12-29',
      content: `第一章 总则
第一条 为了规范价格行为，发挥价格合理配置资源的作用，稳定市场价格总水平，保护消费者和经营者的合法权益，促进社会主义市场经济健康发展，制定本法。
第二条 在中华人民共和国境内发生的价格行为，适用本法。
本法所称价格包括商品价格和服务价格。
商品价格是指各类有形产品和无形资产的价格。
服务价格是指各类有偿服务的收费。`,
      summary: '价格法是规范价格行为、稳定市场价格总水平的基本法律，1997年12月29日通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-3',
      tags: ['价格', '监管', '法律'],
      viewCount: 5670,
      downloadCount: 1420,
      createdBy: 'admin-1',
      createdAt: '1997-12-29T00:00:00Z',
      updatedAt: '1998-05-01T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '1998-05-01T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-11',
      title: '中华人民共和国电子商务法',
      subtitle: '2018年版',
      documentNumber: '中华人民共和国主席令第七号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2019-01-01',
      publishDate: '2018-08-31',
      content: `第一章 总则
第一条 为了保障电子商务各方主体的合法权益，规范电子商务行为，维护市场秩序，促进电子商务持续健康发展，制定本法。
第二条 中华人民共和国境内的电子商务活动，适用本法。
本法所称电子商务，是指通过互联网等信息网络销售商品或者提供服务的经营活动。
法律、行政法规对销售商品或者提供服务有规定的，适用其规定。金融类产品和服务，利用信息网络提供新闻信息、音视频节目、出版以及文化产品等内容方面的服务，不适用本法。`,
      summary: '电子商务法是保障电子商务各方主体合法权益、规范电子商务行为的基本法律，2018年8月31日通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-1',
      tags: ['电子商务', '互联网', '法律'],
      viewCount: 11230,
      downloadCount: 3120,
      createdBy: 'admin-1',
      createdAt: '2018-08-31T00:00:00Z',
      updatedAt: '2019-01-01T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2019-01-01T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
    {
      id: 'doc-12',
      title: '中华人民共和国计量法',
      subtitle: '2018年修正版',
      documentNumber: '中华人民共和国主席令第二十六号',
      issuingAuthority: '全国人民代表大会常务委员会',
      effectiveDate: '2018-10-26',
      publishDate: '2018-10-26',
      content: `第一章 总则
第一条 为了加强计量监督管理，保障国家计量单位制的统一和量值的准确可靠，有利于生产、贸易和科学技术的发展，适应社会主义现代化建设的需要，维护国家、人民的利益，制定本法。
第二条 在中华人民共和国境内，建立计量基准器具、计量标准器具，进行计量检定，制造、修理、销售、使用计量器具，必须遵守本法。`,
      summary: '计量法是加强计量监督管理、保障国家计量单位制统一的基本法律，2018年10月26日修正通过。',
      status: DocumentStatus.APPROVED,
      lawStatus: 'currently_effective' as const,
      type: DocumentType.TEXT,
      categoryId: 'cat-1-4',
      tags: ['计量', '标准', '法律'],
      viewCount: 4320,
      downloadCount: 980,
      createdBy: 'admin-1',
      createdAt: '2018-10-26T00:00:00Z',
      updatedAt: '2018-10-26T00:00:00Z',
      reviewedBy: 'admin-1',
      reviewedAt: '2018-10-26T00:00:00Z',
      isPublic: true,
      requireAuth: false,
    },
  ];

  localStorage.setItem(DB_KEYS.DOCUMENTS, JSON.stringify(sampleDocuments));
};

// 用户相关操作
export const getUsers = (): User[] => {
  const data = localStorage.getItem(DB_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

export const getUserByUsername = (username: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.username === username);
};

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email === email);
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
};

// 文档相关操作
export const getDocuments = (): Document[] => {
  const data = localStorage.getItem(DB_KEYS.DOCUMENTS);
  return data ? JSON.parse(data) : [];
};

export const getDocumentById = (id: string): Document | undefined => {
  const documents = getDocuments();
  return documents.find(d => d.id === id);
};

export const getDocumentsByCategory = (categoryId: string): Document[] => {
  const documents = getDocuments();
  return documents.filter(d => d.categoryId === categoryId && d.status === 'approved');
};

export const saveDocument = (document: Document): void => {
  const documents = getDocuments();
  const index = documents.findIndex(d => d.id === document.id);
  if (index >= 0) {
    documents[index] = document;
  } else {
    documents.push(document);
  }
  localStorage.setItem(DB_KEYS.DOCUMENTS, JSON.stringify(documents));
};

export const deleteDocument = (id: string): void => {
  const documents = getDocuments();
  const filtered = documents.filter(d => d.id !== id);
  localStorage.setItem(DB_KEYS.DOCUMENTS, JSON.stringify(filtered));
};

// 分类相关操作
export const getCategories = (): Category[] => {
  const data = localStorage.getItem(DB_KEYS.CATEGORIES);
  return data ? JSON.parse(data) : [];
};

export const getCategoryById = (id: string): Category | undefined => {
  const categories = getCategories();
  return categories.find(c => c.id === id);
};

export const getCategoriesByParentId = (parentId: string | null): Category[] => {
  const categories = getCategories();
  return categories.filter(c => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const saveCategory = (category: Category): void => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index >= 0) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const deleteCategory = (id: string): void => {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(filtered));
};

// 搜索历史相关操作
export const getSearchHistory = (userId: string): SearchHistory[] => {
  const data = localStorage.getItem(DB_KEYS.SEARCH_HISTORY);
  const history = data ? JSON.parse(data) : [];
  return history.filter((h: SearchHistory) => h.userId === userId);
};

export const saveSearchHistory = (history: SearchHistory): void => {
  const data = localStorage.getItem(DB_KEYS.SEARCH_HISTORY);
  const histories = data ? JSON.parse(data) : [];
  histories.push(history);
  localStorage.setItem(DB_KEYS.SEARCH_HISTORY, JSON.stringify(histories));
};

export const clearSearchHistory = (userId: string): void => {
  const data = localStorage.getItem(DB_KEYS.SEARCH_HISTORY);
  const histories = data ? JSON.parse(data) : [];
  const filtered = histories.filter((h: SearchHistory) => h.userId !== userId);
  localStorage.setItem(DB_KEYS.SEARCH_HISTORY, JSON.stringify(filtered));
};

// 阅读记录相关操作
export const getReadingRecords = (userId: string): ReadingRecord[] => {
  const data = localStorage.getItem(DB_KEYS.READING_RECORDS);
  const records = data ? JSON.parse(data) : [];
  return records.filter((r: ReadingRecord) => r.userId === userId);
};

export const saveReadingRecord = (record: ReadingRecord): void => {
  const data = localStorage.getItem(DB_KEYS.READING_RECORDS);
  const records = data ? JSON.parse(data) : [];
  const index = records.findIndex((r: ReadingRecord) => r.userId === record.userId && r.documentId === record.documentId);
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(DB_KEYS.READING_RECORDS, JSON.stringify(records));
};

// 下载记录相关操作
export const getDownloadRecords = (userId: string): DownloadRecord[] => {
  const data = localStorage.getItem(DB_KEYS.DOWNLOAD_RECORDS);
  const records = data ? JSON.parse(data) : [];
  return records.filter((r: DownloadRecord) => r.userId === userId);
};

export const saveDownloadRecord = (record: DownloadRecord): void => {
  const data = localStorage.getItem(DB_KEYS.DOWNLOAD_RECORDS);
  const records = data ? JSON.parse(data) : [];
  records.push(record);
  localStorage.setItem(DB_KEYS.DOWNLOAD_RECORDS, JSON.stringify(records));
};

// 当前用户相关操作
export const getCurrentUser = (): Omit<User, 'password'> | null => {
  const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: Omit<User, 'password'> | null): void => {
  if (user) {
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
  }
};

// Token相关操作
export const getToken = (): string | null => {
  return localStorage.getItem(DB_KEYS.TOKEN);
};

export const setToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(DB_KEYS.TOKEN, token);
  } else {
    localStorage.removeItem(DB_KEYS.TOKEN);
  }
};

// 清除所有数据（用于测试）
export const clearAllData = (): void => {
  Object.values(DB_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// ========== 文章相关操作 ==========

// 获取所有文章
export const getArticles = (): Article[] => {
  const data = localStorage.getItem(DB_KEYS.ARTICLES);
  return data ? JSON.parse(data) : [];
};

// 获取已发布的文章
export const getPublishedArticles = (): Article[] => {
  const articles = getArticles();
  return articles.filter(a => a.isPublished).sort((a, b) => 
    new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  );
};

// 根据ID获取文章
export const getArticleById = (id: string): Article | undefined => {
  const articles = getArticles();
  return articles.find(a => a.id === id);
};

// 保存文章
export const saveArticle = (article: Article): void => {
  const articles = getArticles();
  const index = articles.findIndex(a => a.id === article.id);
  if (index >= 0) {
    articles[index] = article;
  } else {
    articles.push(article);
  }
  localStorage.setItem(DB_KEYS.ARTICLES, JSON.stringify(articles));
};

// 删除文章
export const deleteArticle = (id: string): void => {
  const articles = getArticles();
  const filtered = articles.filter(a => a.id !== id);
  localStorage.setItem(DB_KEYS.ARTICLES, JSON.stringify(filtered));
};

export default DB_KEYS;
