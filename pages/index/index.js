//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    flag: true,
    indicatorDots: true,
    autoplay: true,
    interval: 9000,
    duration: 500,
    loadingHidden: false , // loading
    userInfo: {},
    swiperCurrent: 0,  
    selectCurrent:0,
    categories: [],
    activeCategoryId: 0,
    goods:[],
    scrollTop:"0",
    loadingMoreHidden:true,

    hasNoCoupons:true,
    coupons: [],
    searchInput: '',
  },

  
  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function(e) {
      //console.log(e.detail.current)
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/index?id="+e.currentTarget.dataset.id
    })
  },
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index 
    })  
  },
  scroll: function (e) {
    //  console.log(e) ;
    var that = this,scrollTop=that.data.scrollTop;
    that.setData({
      scrollTop:e.detail.scrollTop
    })
    // console.log('e.detail.scrollTop:'+e.detail.scrollTop) ;
    // console.log('scrollTop:'+scrollTop)
  },
  hide: function () {//弹窗优惠券关闭按钮
    this.setData({ flag: true })
  },
  newCoupon: function () {//用户自主领取优惠券
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: wx.getStorageSync('newcoupons'),//优惠券id
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '成功领取',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  },
  onLoad: function () {
    var that = this
    //新用户领取饭票
    setTimeout(function () {//index页面打开两秒后弹窗优惠券
      wx.request({//识别用户是否可以领取优惠券
        url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
        data: {
          id: wx.getStorageSync('newcoupons'),//优惠券id
          token: app.globalData.token,
          detect: true
        },
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({ flag: false })
          }
        }
      })
      }, 2000
    ),
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/banner/list',
      data: {
        key: 'mallName'
      },
      success: function(res) {
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '请在后台添加 banner 轮播图片',
            showCancel: false
          })
        } else {
          that.setData({
            banners: res.data.data
          });
        }
      }
    })
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/category/all',
      success: function(res) {
        var categories = [{ id: 0, name: "推荐", icon:"https://cdn.it120.cc/apifactory/2018/02/03/8c3ddf25666056a6e7dcf2a0937b5b10.png"}];
        if (res.data.code == 0) {
          for (var i = 0; i < res.data.data.length; i++) {
            categories.push(res.data.data[i]);
          }
        }
        that.setData({
          categories:categories,
          activeCategoryId:0
        });
        that.getGoodsList(0);
      }
    })
    that.getCoupons ();
    that.getNotice ();
  },
  getGoodsList: function (categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    console.log(categoryId)
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.subDomain +'/shop/goods/list',
      data: {
        categoryId: categoryId,
        nameLike: that.data.searchInput
      },
      success: function(res) {
        that.setData({
          goods:[],
          loadingMoreHidden:true
        });
        var goods = [];
        if (res.data.code != 0 || res.data.data.length == 0) {
          that.setData({
            loadingMoreHidden:false,
          });
          return;
        }
        for(var i=0;i<res.data.data.length;i++){
          goods.push(res.data.data[i]);
        }
        that.setData({
          goods:goods,
        });
      }
    })
  },
  getCoupons: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/coupons',
      data: {
        type: ''
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            hasNoCoupons: false,
            coupons: res.data.data
          });
        }
      }
    })
  },
  gitCoupon : function (e) {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/discounts/fetch',
      data: {
        id: e.currentTarget.dataset.id,
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 20001 || res.data.code == 20002) {
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20003) {
          wx.showModal({
            title: '领取失败',
            content: '您已经领过了哦~',
            showCancel: false
          })
        }
        if (res.data.code == 30001) {
          wx.showModal({
            title: '领取失败',
            content: '您的积分不足～',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 20004) {
          wx.showModal({
            title: '领取失败',
            content: '已过期~',
            showCancel: false
          })
          return;
        }
        if (res.data.code == 0) {
          wx.showToast({
            title: '成功领取饭票',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('mallName') + '—' + app.globalData.shareProfile,
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  getNotice: function () {
    var that = this;
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.subDomain + '/notice/list',
      data: { pageSize :5},
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    })
  },
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  toSearch : function (){
    this.getGoodsList(this.data.activeCategoryId);
  }
})
