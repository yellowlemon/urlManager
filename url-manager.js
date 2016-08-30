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
	var urlManager = {
		version: '0.0.1',
		list: function() {
			console.log(getData('urlArray'));
			console.log(storageParams);
		},
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
			setData('params', opt, 'd1');
			storageParams = opt;
			//存储设置属性后，将首页放入存储数组
			pushUrlArr(params);
		}
	};
	/*************私有属性*************/
	//默认属性
	var params = {
		//mode: 'storage',
		time: 'd1', //只针对cookie存储方式有效
		backBtn: 'back',//默认返回按钮
		index: '/views/a.html',//默认首页，回到首页既可清除urlArr
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
	function isSupportStorage(){
		var supportStorage = false;
		if (window.sessionStorage && window.sessionStorage.getItem) {
			supportStorage = true;
		}
		return supportStorage;
	};
	//设置存取数据
	function setData(name,value,time) {
		var value = JSON.stringify(value);
		if(isSupportStorage()) {
			window.sessionStorage.setItem(name, value);
		} else if(isSupportCookie()) {
			var strsec = getsec(time);
			var exp = new Date();
			exp.setTime(exp.getTime() + strsec*1);
			document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
		} else {
			console.log('暂时不支持storage和cookie存储方式');
		}
	}
	//读取存取数据
	function getData(name) {
		if(isSupportStorage()) {
			return JSON.parse(window.sessionStorage.getItem(name));
		} else if(isSupportCookie()) {
			var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
			if(arr=document.cookie.match(reg)) {
				return JSON.parse(unescape(arr[2]));
			} else {
				return null;
			}
		} else {
			console.log('暂时不支持storage和cookie存储方式');
		}
	}
	//删除存取数据
	function delData(name) {
		if(isSupportStorage()) {
			window.sessionStorage.removeItem(name);
		} else if(isSupportCookie()) {
			var exp = new Date();
			exp.setTime(exp.getTime() - 1);
			var cval=getCookie(name);
			if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
		} else {
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
	//储存url数组
	function pushUrlArr(params) {
		var urlArray = getData('urlArray');
		if(!urlArray || window.location.pathname == params.index){
			urlArray = [];
			urlArray.push(window.location.pathname+window.location.search);
		} else {
			if(urlArray.length>=1){
				//防止同一页面多次刷新，导致误存储
				if(window.location.pathname != urlArray[urlArray.length-1].split('?')[0]){
					urlArray.push(window.location.pathname+window.location.search);
				}
			}else{
				urlArray.push(window.location.pathname+window.location.search);
			}
		}
		setData('urlArray', urlArray, params.time);
	}
	/*************默认执行方法*************/
	var storageParams = getData('params');
	//如果已经初始化, 则进行存储url处理
	if(storageParams) {
		pushUrlArr(params);
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