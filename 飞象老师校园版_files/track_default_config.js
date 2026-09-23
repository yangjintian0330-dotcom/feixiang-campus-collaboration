(function () {
  window.__track_config = {
    test: {
      qt: {
        serverUrl: 'https://d.alicdn.com/alilog/mlog/aplus/204201353.js',
        trackHost: 'https://sjcj.ykt.eduyun.cn',
        enable: false
      },
      sensors: {
        serverUrl: 'https://data-collect-service.debug.ndaeweb.com/v1/data_collect/',
        pcAppKey: 'xstudy_pc',
        appKey: 'xstudy_web',
        enable: true,
        sessionTimeout: 60 * 60 * 1000
      }
    },
    preproduction: {
      qt: {
        serverUrl: 'https://d.alicdn.com/alilog/mlog/aplus/204201353.js',
        trackHost: 'https://sjcj.ykt.eduyun.cn',
        enable: false
      },
      sensors: {
        serverUrl: 'https://data-collect-service.beta.101.com/v1/data_collect/',
        pcAppKey: 'xstudy_pc',
        appKey: 'xstudy_web',
        enable: true,
        sessionTimeout: 60 * 60 * 1000
      }
    },
    product: {
      qt: {
        serverUrl: 'https://d.alicdn.com/alilog/mlog/aplus/204201353.js',
        trackHost: 'https://sjcj.ykt.eduyun.cn',
        enable: false
      },
      sensors: {
        serverUrl: 'https://data-collect-service-pro.sdp.101.com/v1/data_collect/',
        pcAppKey: 'xstudy_pc',
        appKey: 'xstudy_web',
        enable: true,
        sessionTimeout: 60 * 60 * 1000
      }
    },
    'ncet-xedu': {
      qt: {
        serverUrl: 'https://d.alicdn.com/alilog/mlog/aplus/204201353.js',
        trackHost: 'https://sjcj.ykt.eduyun.cn',
        enable: false
      },
      sensors: {
        serverUrl: 'https://data-collect-service.ykt.eduyun.cn/v1/data_collect/',
        pcAppKey: 'xstudy_pc',
        appKey: 'xstudy_web',
        enable: true,
        sessionTimeout: 60 * 60 * 1000
      }
    }
  }
})()