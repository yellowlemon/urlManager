/**
 * urlManager 0.0.1
 *
 * Copyright 2016, yellowlemon
 *
 * Licensed under MIT
 *
 * Released on: 2016/08/30
 */
;(function(window, document, undefined) {
	'use strict';
	var version = '0.0.1';//版本号
	//rulManager对象
	var urlManager = {
		urls: getData('urlArray'),
		init: function(opt) {
			for (var def in params) {
				if (typeof opt[def] === 'undefined') {
					opt[def] = params[def];
				}
				else if (typeof opt[def] === 'object') {
					for (var deepDef in params[def]) {
						if (typeof opt[def][deepDef] === 'undefined') {
							opt[def][deepDef] = params[def][deepDef];
						}
					}
				}
			}
			setData('params', opt, 'd365', 'local');//将配置作为长时间存储，避免下次未在首页打开情况
			storageParams = opt;
			//存储设置属性后，将首页放入存储数组
			pushUrlArr(storageParams);
		},
		jumpTo: function(index) {
		},
		stringJumpTo: function(str) {
		},
	};
	//定义对象
	var backUrl, //回退的URL
	storageParams; //获取当前定义的参数
	/*************私有属性*************/
	//默认属性
	var params = {
		type: 'session', //判断使用seesion还是local或者cookie存储
		time: 'd1', //只针对cookie存储方式有效
		backBtn: 'back',//默认返回按钮
		index: '/views/a.html',//默认首页
		clearHistory: true,//默认回到首页后清除历史记录
	};
	/*************私有方法*************/
	//判断是否支持cookie调用
	function isSupportCookie(){
		var supportCookie = '';
		if(typeof(navigator.cookieEnabled) != 'undefined') {
			supportCookie = navigator.cookieEnabled;
		} else{
			document.cookie = 'test';
			supportCookie = document.cookie.indexOf('test') != -1;
			document.cookie = '';
		}
		return supportCookie;
	};
	//判断是否支持storage调用方式
	function isSupportStorage(type){
		if(!arguments[0]) type = 'session';
		var supportStorage = false;
		if(type == 'session') {
			if (window.sessionStorage && window.sessionStorage.getItem) {
				supportStorage = true;
			}
		} else {
			if (window.localStorage && window.localStorage.getItem) {
				supportStorage = true;
			}
		}
		return supportStorage;
	};
	//设置存取数据
	function setData(name, value, time, type) {
		var value = JSON.stringify(value);
		if(!arguments[3]) type = 'session';
		if(isSupportStorage(type) && type != 'cookie') {
			if(type == 'session') {
				window.sessionStorage.setItem(name, value);
			} else {
				window.localStorage.setItem(name, value);
			}
		} else if(isSupportCookie()) {
			var strsec = getsec(time);
			var exp = new Date();
			exp.setTime(exp.getTime() + strsec*1);
			document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
		} else {
			return false;
			console.log('暂时不支持storage和cookie存储方式');
		}
	}
	//读取存取数据
	function getData(name, type) {
		if(!arguments[1]) type = 'session';
		if(isSupportStorage(type) && type != 'cookie') {
			if(type == 'session') {
				return JSON.parse(window.sessionStorage.getItem(name));
			} else {
				return JSON.parse(window.localStorage.getItem(name));
			}
		} else if(isSupportCookie()) {
			var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
			if(arr=document.cookie.match(reg)) {
				return JSON.parse(unescape(arr[2]));
			} else {
				return null;
			}
		} else {
			return false;
			console.log('暂时不支持storage和cookie存储方式');
		}
	}
	//删除存取数据
	function delData(name, type) {
		if(!arguments[1]) type = 'session';
		if(isSupportStorage(type) && type != 'cookie') {
			if(type == 'session') {
				window.sessionStorage.removeItem(name);
			} else {
				window.localStorage.removeItem(name);
			}
		} else if(isSupportCookie()) {
			var exp = new Date();
			exp.setTime(exp.getTime() - 1);
			var cval=getCookie(name);
			if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
		} else {
			return false;
			console.log('暂时不支持storage和cookie存储方式');
		}
	}
	//判断传入cookie时间
	function getsec(str) {
		var str1=str.substring(1,str.length)*1;
		var str2=str.substring(0,1);
		if (str2=="s"){
			return str1*1000;
		}else if (str2=="h"){
			return str1*60*60*1000;
		}else if (str2=="d"){
			return str1*24*60*60*1000;
		}
	}
	//储存URL数组
	function pushUrlArr(params) {
		var urlArray = getData('urlArray');
		if(toString.apply(urlArray) != '[object Array]' || (window.location.pathname == params.index&&params.clearHistory)){
			urlArray = [];
			urlArray.push(window.location.pathname+window.location.search);
		} else {
			if(urlArray.length>=1){
				//防止同一页面多次刷新，导致误存储
				if(window.location.pathname != urlArray[urlArray.length-1].split('?')[0]){
					urlArray.push(window.location.pathname+window.location.search);
				}
			} else {
				urlArray.push(window.location.pathname+window.location.search);
			}
		}
		setData('urlArray', urlArray, params.time);
	}
	//获取返回的URL序号方法
	function getReturnUrlNum(params, num, isDel) {
		if(!arguments[2]) isDel = true;
		var urlArray = getData('urlArray');
		var returnUrl = urlArray[num];
		if(isDel) {
			urlArray.splice(num, urlArray.length-num);
		}
		setData('urlArray', urlArray, params.time, params.type);
		return returnUrl;
	}
	//获取返回的URL字符串方法
	function getReturnUrlString(params, string, isDel) {
		if(!arguments[2]) isDel = true;
		var urlArray = getData('urlArray');
		var returnUrlIndex = urlArray.indexOf('string');
		if(returnUrlIndex != -1) {
			var returnUrl = urlArray.slice(returnUrlIndex, returnUrlIndex+1);
		} else {
			var returnUrl = null;
		}
		if(isDel) {
			urlArray.splice(returnUrlIndex, urlArray.length-returnUrlIndex);
		}
		setData('urlArray', urlArray, params.time, params.type);
		return returnUrl;
	}
	/*************默认执行方法*************/
	storageParams = getData('params', 'local');
	//如果已经初始化, 则进行存储url处理
	if(storageParams) {
		pushUrlArr(storageParams);//将当前页面push到urlArray数组当中
		var urlArray = getData('urlArray');
		if(urlArray) {
			var backBtn = document.getElementsByClassName(storageParams.backBtn)[0];
			if(urlArray.length>=2) {
				backUrl = backBtn.href;
				backBtn.href = 'javascript:;';
				backBtn.addEventListener('click', function(){
					window.location.href = getReturnUrlNum(storageParams, urlArray.length-2);
				});
			}
		}
	}

	//模块调用出口
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = urlManager;
	} else if (typeof define === 'function' && define.amd) {
		define(function(){return urlManager;});
	} else {
		(function(){ return this || (0,eval)('this'); }()).urlManager = urlManager;
	}
})(window, document);